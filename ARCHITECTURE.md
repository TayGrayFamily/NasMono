# Game Hub Architecture

## Stack Overview

- **Frontend:** React + Vite (Typescript)
- **Backend:** Node.js + Express + Socket.IO
- **Database:** PostgreSQL
- **State Management:** Local React state + Socket.IO real-time synchronization
- **Styling:** CSS (Dark Theme, Cyan/Green/Blue Palette)

## Persistence Layer

- **PostgreSQL:** Used to persist `users` and `lobbies`.
- **Lobby-Player Relationship:** `lobby_players` acts as a join table. Temporary users are purged if they lose their associated lobby or via cleanup tasks.

## Network Layer

- **REST API:** Handles state initialization (creating users, lobbies).
- **Socket.IO:** Manages real-time lobby room updates (joining/leaving lobbies, real-time player list synchronization).
