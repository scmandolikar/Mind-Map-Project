import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, {
  Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { io } from 'socket.io-client';
import EditNodeModal from '../components/EditNodeModal'; // Import Modal
import { useUser } from '../context/UserContext'; // Import User Context

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');

function MapPage() {
  const { mapId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editingNode, setEditingNode] = useState(null); // State for modal
  const { addToHistory, saveMap, savedMaps, removeSavedMap } = useUser(); // User Context hooks

  // Add to history on mount
  useEffect(() => {
    if (mapId) {
      addToHistory(mapId);
    }
  }, [mapId, addToHistory]);

  useEffect(() => {
    socket.emit('join-map', mapId);

    socket.on('initial-map', ({ nodes, edges }) => {
      setNodes(nodes || []);
      setEdges(edges || []);
    });

    socket.on('node-added', (newNode) => setNodes((nds) => [...nds, newNode]));
    socket.on('edge-added', (newEdge) => setEdges((eds) => addEdge(newEdge, eds)));
    socket.on('node-moved', ({ id, position }) => {
      if (!position) return;
      setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, position } : node)));
    });

    // Updated to handle both label and style (color) updates
    socket.on('node-updated', ({ nodeId, data, style }) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data }, style: { ...node.style, ...style } } : node))
      );
    });

    socket.on('elements-deleted', ({ nodeIds, edgeIds }) => {
      setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
      setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id)));
    });

    return () => {
      socket.off('initial-map');
      socket.off('node-added');
      socket.off('edge-added');
      socket.off('node-moved');
      socket.off('node-updated'); // Changed from node-label-updated
      socket.off('elements-deleted');
    };
  }, [mapId]);

  const onNodesChange = useCallback((changes) => {
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    const posChange = changes.find((change) => change.type === 'position' && !change.dragging);
    if (posChange) {
      const node = updatedNodes.find((item) => item.id === posChange.id);
      if (node?.position) {
        socket.emit('node-move', { mapId, id: node.id, position: node.position });
      }
    }
  }, [nodes, mapId]);

  const onEdgesChange = useCallback((c) => setEdges((eds) => applyEdgeChanges(c, eds)), []);

  const onConnect = useCallback((params) => {
    const edge = { ...params, id: uuidv4() };
    setEdges((eds) => addEdge(edge, eds));
    socket.emit('add-edge', { mapId, edge });
  }, [mapId]);

  const addNode = () => {
    const newNode = {
      id: uuidv4(),
      position: { x: 100, y: 100 },
      data: { label: 'New Node' },
      style: { backgroundColor: '#ffffff', color: '#000000', borderRadius: '8px', padding: '10px' }
    };
    setNodes((nds) => [...nds, newNode]);
    socket.emit('add-node', { mapId, node: newNode });
  };

  const onNodeDoubleClick = useCallback((event, node) => {
    setEditingNode(node); // Open Modal
  }, []);

  // Helper to determine text color based on background
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  const saveNodeChanges = (nodeId, newLabel, newColor) => {
    const textColor = getContrastColor(newColor);
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? {
        ...n,
        data: { ...n.data, label: newLabel },
        style: { ...n.style, backgroundColor: newColor, color: textColor }
      } : n))
    );
    // Emit generic update event with text color
    socket.emit('update-node-label', {
      mapId,
      nodeId,
      data: { label: newLabel },
      style: { backgroundColor: newColor, color: textColor }
    });
    setEditingNode(null);
  };

  const deleteNode = (nodeId) => {
    const nodeIds = [nodeId];
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    socket.emit('delete-elements', { mapId, nodeIds, edgeIds: [] }); // Simple delete propagation
    setEditingNode(null);
  }

  const onNodesDelete = useCallback((deletedNodes) => {
    const nodeIds = deletedNodes.map(n => n.id);
    socket.emit('delete-elements', { mapId, nodeIds, edgeIds: [] });
  }, [mapId]);

  const onEdgesDelete = useCallback((deletedEdges) => {
    const edgeIds = deletedEdges.map(e => e.id);
    socket.emit('delete-elements', { mapId, nodeIds: [], edgeIds });
  }, [mapId]);

  const isSaved = savedMaps.includes(mapId);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div className="nav-link" style={{ display: 'flex', gap: '1rem', top: '10px', right: '10px', padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }}>
        <button
          onClick={() => isSaved ? removeSavedMap(mapId) : saveMap(mapId)}
          style={{ padding: '0.6rem', fontSize: '0.9rem', background: isSaved ? 'var(--primary)' : 'var(--panel-bg)' }}
        >
          {isSaved ? 'Saved ★' : 'Save ☆'}
        </button>
        <Link to="/dashboard" style={{ padding: '0.6rem 1rem', background: 'var(--panel-bg)', borderRadius: '8px', color: 'white', textDecoration: 'none', border: '1px solid var(--panel-border)' }}>
          Dashboard
        </Link>
        <Link to="/" style={{ padding: '0.6rem 1rem', background: 'var(--panel-bg)', borderRadius: '8px', color: 'white', textDecoration: 'none', border: '1px solid var(--panel-border)' }}>
          Home
        </Link>
      </div>

      <button onClick={addNode} className="fab">
        + Add Node
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>

      {editingNode && (
        <EditNodeModal
          node={editingNode}
          onClose={() => setEditingNode(null)}
          onSave={saveNodeChanges}
          onDelete={deleteNode}
        />
      )}
    </div>
  );
}

export default MapPage;