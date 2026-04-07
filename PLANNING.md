# Project Planning - Game Hub

## Purpose

This file serves as a central point for tracking the progress and planned features of the Game Hub project.

## Production-Readiness Roadmap

- **State Management:** Integrate **Redis** (via Socket.IO Redis adapter) to allow horizontal scaling.
- **Database:** Migrated to **Drizzle ORM** for schema evolution.
- **Type Safety:** Create a `packages/shared-types` workspace for API/Socket contracts.
- **Validation:** Use **Zod** for request/event validation.
- **Authentication:** Move from insecure name-based login to JWT/Session-based system.

## In Progress / Next Steps

### 1. Login Feature Implementation

    *   **Objective:** Enable user authentication, socket connection, and display of connected users.
    *   **Sub-tasks:**
        *   **User Authentication (Server & Database):**
            *   **[COMPLETED]** Design and implement database schema for user accounts (using Drizzle ORM).
            *   Develop server-side API endpoints for user registration and login.
            *   Securely store and retrieve user credentials (hashing passwords).
        *   **Socket Connection Establishment:**
            *   **[IN PROGRESS]** Integrate WebSocket/Socket.IO server (Refining presence tracking).
            *   Establish a new socket connection for each authenticated user upon login.
            *   Handle connection/disconnection events.
        *   **Connected Users Panel:**
            *   **Web UX:** Design a side panel to display a list of currently connected users.
            *   **Mobile UX:** Design an adaptive UI for the connected users list.

### 2. Infrastructure & Scalability

    *   **Objective:** Improve system reliability and extensibility.
    *   **Sub-tasks:**
        *   [ ] Integrate Redis for socket state management.
        *   [ ] Set up `packages/shared-types` for API/Socket event definitions.
        *   [ ] Implement Zod validation for all incoming requests and socket events.

## Completed Tasks

- [x] Database: Initialized Drizzle ORM and refactored manual SQL queries.
- [x] Tooling: Updated `tsconfig` to support build and skip library checks.

---

**Note:** This file should be updated regularly to reflect the current state of the project.
