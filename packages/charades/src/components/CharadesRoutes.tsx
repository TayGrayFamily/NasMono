import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CharadesSetup } from './CharadesSetup.js';
import { CharadesPlay } from './CharadesPlay.js';

/**
 * Solo pass-and-play charades routes.
 * Future: lobby multiplayer can mount CharadesPlay with server-dealt cards at
 * `/lobbies/:lobbyId/game/charades`.
 */
export function CharadesRoutes() {
  return (
    <Routes>
      <Route index element={<CharadesSetup />} />
      <Route path="game" element={<CharadesPlay />} />
      <Route path="*" element={<Navigate to="/play/charades" replace />} />
    </Routes>
  );
}
