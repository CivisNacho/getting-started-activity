import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { useDiscord } from './src/hooks/useDiscord';
import { useGame } from './src/hooks/useGame';
import Lobby from './src/components/Lobby.jsx';
import CluePhase from './src/components/CluePhase.jsx';
import VotingPhase from './src/components/VotingPhase.jsx';
import Results from './src/components/Results.jsx';

console.log("Main.jsx executing...");

function App() {
  const { auth, loading, error, discordSdk } = useDiscord();
  const { gameState, startGame, submitClue, submitVote, resetGame, nextRound } = useGame(
    discordSdk.channelId,
    auth?.user
  );

  useEffect(() => {
    console.log("App render state:", { loading, error: !!error, hasAuth: !!auth, hasGameState: !!gameState });
  }, [loading, error, auth, gameState]);

  if (loading) return <div className="initializing m3-card">Initializing Impostor Game...</div>;
  if (error) return <div className="error m3-card">Error: {error.message}</div>;

  const renderScreen = () => {
    if (!gameState) return <div className="initializing m3-card">Connecting to game server...</div>;

    switch (gameState.phase) {
      case 'LOBBY':
        return <Lobby gameState={gameState} startGame={startGame} currentUser={auth.user} />;
      case 'CLUE_PHASE':
        return <CluePhase gameState={gameState} submitClue={submitClue} currentUser={auth.user} />;
      case 'VOTING':
        return <VotingPhase gameState={gameState} submitVote={submitVote} currentUser={auth.user} />;
      case 'RESULTS':
        return <Results gameState={gameState} resetGame={resetGame} nextRound={nextRound} currentUser={auth.user} />;
      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React app mounting...");
} else {
  console.error("Could not find #app element!");
}
