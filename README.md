# Real-Time Mind Map

A collaborative mind-map app where people in the same room can add, connect, move, rename, and delete nodes together. Map contents are stored in MongoDB so they can be loaded again after a refresh.

## Tech stack

- **Client:** React, Vite, React Flow, Socket.IO Client, React Router
- **Server:** Node.js, Express, Socket.IO, Mongoose
- **Database:** MongoDB

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB database and connection string

## Setup

Run these commands from the project root. Install dependencies once for each app:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and replace the `MONGODB_URI` placeholder with your MongoDB connection string. The other example values use the local defaults: the server listens on port `4000`, and accepts the Vite client from `http://localhost:5173`.

In another terminal, from the project root:

```powershell
cd client
npm install
Copy-Item .env.example .env
```

The client example points Socket.IO at `http://localhost:4000`. Change `VITE_SOCKET_URL` if the server is hosted elsewhere. Keep real connection strings and local `.env` files private; only the `.env.example` files belong in source control.

## Run

Start the server in one terminal:

```powershell
cd server
npm start
```

Start Vite in a second terminal:

```powershell
cd client
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`. To try collaboration, open the same room URL in two browser windows, for example `http://localhost:5173/map/demo-room`. Changes in one window are sent to the other.

To check the server's HTTP status, open `http://localhost:4000/health`; a running server returns `{"status":"ok"}`.

## How it works

The client joins a room using `join-map`. The server loads that map from MongoDB the first time it is needed and sends it to the joining client as `initial-map`.

Clients send `add-node`, `add-edge`, `node-move`, `update-node-label`, or `delete-elements` when the corresponding action happens. The server updates the room's in-memory map, broadcasts the change to the other clients in that room, and writes it to MongoDB. Node and edge IDs are unique UUIDs. Deleting a node also removes its connected edges.

## Username entry

The optional username entry is not authentication. It stores a username, map history, saved-map list, and activity log in that browser's local storage. It does not create an account or protect maps.

## Project owner

- **Name:** Sakshath Mandolikar
- **GitHub:** [@scmandolikar](https://github.com/scmandolikar)
- **LinkedIn:** [Sakshath Mandolikar](https://www.linkedin.com/in/sakshath-mandolikar-8432b8396)
