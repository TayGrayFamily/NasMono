# Game Hub Architecture: Socket.IO & Real-time Communication

## Overview

The Game Hub utilizes **Socket.IO** for bi-directional, persistent communication between the client and server. This architecture is designed to support both real-time lobby updates and low-latency multiplayer gaming.

## Core Design Principles

### 1. Unified Connection

- **One Connection Per User:** Each client maintains exactly one persistent WebSocket connection. We do not use multiple connections for different domains (e.g., chat vs. game); all traffic flows through this single pipe.
- **Namespacing:** While currently using the default namespace, we will move to **Namespaces** (e.g., `/lobby`, `/game`) as we scale to separate concerns and event types cleanly.

### 2. Communication Strategy

- **Event-Driven Signaling:**
  - Small, atomic updates (e.g., `player_joined`, `chat_message`) are sent directly within event payloads.
  - Complex state synchronization (e.g., full lobby list) uses a "notify-then-fetch" pattern where the socket signal triggers a targeted REST API fetch to ensure data consistency.
- **Multiplayer Engine:** For game-play, we will shift to a **State Snapshot** pattern: the server broadcasts the authoritative game state at high frequency (tick-rate), and the client acts as a reactive renderer.

### 3. Production Readiness & Scalability

- **Horizontal Scaling:** We will implement the **Socket.IO Redis Adapter** to synchronize events across multiple server container instances.
- **Contract Enforcement:** All socket payloads must be defined in a shared `packages/types` workspace.
- **Validation:** Every incoming socket event on the server must be validated using **Zod** schemas before processing.

## Current Roadmap Updates

### Updated PLANNING.md (Excerpts)

#### Infrastructure:

- [ ] **Redis Integration:** Update `docker-compose.unraid.yml` to include a Redis service; configure Socket.IO Redis adapter in `game-server`.
- [ ] **Shared Types:** Create `packages/shared-types` to host TypeScript interfaces for Socket.IO events (Client -> Server and Server -> Client).
- [ ] **Validation Layer:** Implement `zod` middleware for all incoming socket events to ensure schema integrity.

#### Implementation Steps:

- [ ] Refactor existing events to use the new shared type definitions.
- [ ] Implement Redis adapter to enable multi-instance support.
- [ ] Set up Zod validation for `join_lobby_room` and related events.
