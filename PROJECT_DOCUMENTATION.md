# Mind Map Project Documentation

## What the project does

This is a browser-based collaborative mind map. People who open the same `/map/:mapId` room can add nodes and edges, move nodes, edit node labels and colors, and delete elements. Room changes are sent live through Socket.IO and stored in MongoDB.

## Main technologies

- **React and React Flow** render and manage the map in the browser.
- **Vite** runs and builds the client.
- **Socket.IO Client and Socket.IO** send live room events between the client and server.
- **Express** serves a health endpoint; **Node.js** runs the server.
- **Mongoose and MongoDB** persist map nodes and edges.
- **React Router** maps browser paths to app pages.

## How the app works

When a client opens a map, it sends `join-map`. The server loads the map from MongoDB if it is not already in memory and replies to that client with `initial-map`.

For changes, the client sends `add-node`, `add-edge`, `node-move`, `update-node-label`, or `delete-elements`. The server updates its in-memory copy, broadcasts the event to the other clients in the room, and saves the change to MongoDB. Nodes and edges receive UUIDs so their IDs are unique. Deleting a node also deletes edges connected to it.

## Username entry is not authentication

The optional login page only asks for a username. The username and the browser's map history, saved-map list, and activity log are stored in local storage. There are no accounts, passwords, access controls, or server-side user identities; anyone with a room URL can join that map.

## Notes

- Simultaneous edits to the same value do not have a conflict-resolution system.
- MongoDB and the server's `MONGODB_URI` environment variable are required to run the app with persistent map storage.
- See [README.md](./README.md) for setup and run instructions and [DEMO_GUIDE.md](./DEMO_GUIDE.md) for a two-window walkthrough.
