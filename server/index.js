require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Set it in server/.env or the environment.');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const mindMapSchema = new mongoose.Schema({
  _id: String,
  nodes: [mongoose.Schema.Types.Mixed],
  edges: [mongoose.Schema.Types.Mixed],
});
const MindMap = mongoose.model('MindMap', mindMapSchema);

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CORS_ORIGIN } });
const localMaps = {};
const mapLoads = {};

const loadMap = (mapId) => {
  if (localMaps[mapId]) return Promise.resolve(localMaps[mapId]);

  if (!mapLoads[mapId]) {
    mapLoads[mapId] = MindMap.findById(mapId)
      .then((map) => {
        localMaps[mapId] = {
          nodes: map?.nodes || [],
          edges: map?.edges || [],
        };
        return localMaps[mapId];
      })
      .finally(() => {
        delete mapLoads[mapId];
      });
  }

  return mapLoads[mapId];
};

const onSocketEvent = (socket, event, handler) => {
  socket.on(event, async (...args) => {
    try {
      await handler(...args);
    } catch (error) {
      console.error(`Socket event "${event}" failed:`, error);
    }
  });
};

io.on('connection', (socket) => {
  onSocketEvent(socket, 'join-map', async (mapId) => {
    socket.join(mapId);
    socket.emit('initial-map', await loadMap(mapId));
  });

  onSocketEvent(socket, 'add-node', async ({ mapId, node }) => {
    const map = await loadMap(mapId);
    map.nodes.push(node);

    socket.to(mapId).emit('node-added', node);
    await MindMap.updateOne(
      { _id: mapId },
      { $push: { nodes: node } },
      { upsert: true }
    );
  });

  onSocketEvent(socket, 'add-edge', async ({ mapId, edge }) => {
    const map = await loadMap(mapId);
    map.edges.push(edge);

    socket.to(mapId).emit('edge-added', edge);
    await MindMap.updateOne(
      { _id: mapId },
      { $push: { edges: edge } },
      { upsert: true }
    );
  });

  onSocketEvent(socket, 'node-move', async ({ mapId, id, position }) => {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new Error('node-move requires a numeric x and y position.');
    }

    const map = await loadMap(mapId);
    const node = map.nodes.find((item) => item.id === id);
    if (node) node.position = position;

    socket.to(mapId).emit('node-moved', { id, position });
    await MindMap.updateOne(
      { _id: mapId, 'nodes.id': id },
      { $set: { 'nodes.$.position': position } }
    );
  });

  onSocketEvent(socket, 'update-node-label', async ({ mapId, nodeId, data, style }) => {
    const map = await loadMap(mapId);
    const node = map.nodes.find((item) => item.id === nodeId);
    if (node) {
      if (data) node.data = { ...node.data, ...data };
      if (style) node.style = { ...node.style, ...style };
    }

    socket.to(mapId).emit('node-updated', { nodeId, data, style });

    const updateOps = {};
    if (data?.label !== undefined) updateOps['nodes.$.data.label'] = data.label;
    if (style?.backgroundColor !== undefined) {
      updateOps['nodes.$.style.backgroundColor'] = style.backgroundColor;
    }
    if (style?.color !== undefined) updateOps['nodes.$.style.color'] = style.color;

    if (Object.keys(updateOps).length > 0) {
      await MindMap.updateOne(
        { _id: mapId, 'nodes.id': nodeId },
        { $set: updateOps }
      );
    }
  });

  onSocketEvent(socket, 'delete-elements', async ({ mapId, nodeIds = [], edgeIds = [] }) => {
    const map = await loadMap(mapId);
    const connectedEdgeIds = map.edges
      .filter((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target))
      .map((edge) => edge.id);
    const deletedEdgeIds = [...new Set([...edgeIds, ...connectedEdgeIds])];

    map.nodes = map.nodes.filter((node) => !nodeIds.includes(node.id));
    map.edges = map.edges.filter((edge) => !deletedEdgeIds.includes(edge.id));

    socket.to(mapId).emit('elements-deleted', { nodeIds, edgeIds: deletedEdgeIds });

    const edgeConditions = [];
    if (deletedEdgeIds.length) edgeConditions.push({ id: { $in: deletedEdgeIds } });
    if (nodeIds.length) {
      edgeConditions.push(
        { source: { $in: nodeIds } },
        { target: { $in: nodeIds } }
      );
    }

    const pull = {};
    if (nodeIds.length) pull.nodes = { id: { $in: nodeIds } };
    if (edgeConditions.length) pull.edges = { $or: edgeConditions };

    if (Object.keys(pull).length > 0) {
      await MindMap.updateOne({ _id: mapId }, { $pull: pull });
    }
  });

  onSocketEvent(socket, 'disconnect', () => {});
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');
    server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (error) {
    console.error('Failed to connect to MongoDB. Check MONGODB_URI and database access:', error);
    process.exitCode = 1;
  }
};

startServer();
