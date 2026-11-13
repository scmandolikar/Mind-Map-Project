# Two-Window Demo Guide

## Start the apps

1. Follow the setup steps in [README.md](./README.md), including creating `server/.env` and `client/.env`.
2. In one terminal, run `cd server` followed by `npm start`.
3. In a second terminal, run `cd client` followed by `npm run dev`.
4. Open the Vite URL, normally `http://localhost:5173/map/demo-room`, in two browser windows.

Both windows must use the exact same map URL. No account is required to join a map.

## Try collaboration

1. Add a node in one window and confirm it appears in the other.
2. Drag the node and confirm its position updates in the other window.
3. Double-click the node, change its label, and save; confirm the update appears in both windows.
4. Add a second node, connect the nodes, and delete the edge.
5. Connect them again and delete a node.
6. Refresh a window and confirm the map loads from MongoDB.

The username entry is only a local browser convenience, not authentication.

## Optional: use another device on the local network

The server's `CORS_ORIGIN` must exactly match the client origin. Start Vite with `npm run dev -- --host` to display its network URL, then set `CORS_ORIGIN` in `server/.env` to that origin (for example `http://192.168.1.5:5173`). Set `VITE_SOCKET_URL` in `client/.env` to the server's reachable address and port (for example `http://192.168.1.10:4000`), then restart both apps. Open the same `/map/<room-name>` path on each device. Network/firewall settings may also need to allow those ports.
