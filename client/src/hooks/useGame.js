import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

export function useGame(channelId, user) {
  const [gameState, setGameState] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!channelId || !user) return;

    socketRef.current = io();

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', { channelId, user });
    });

    socketRef.current.on('state_update', (state) => {
      setGameState(state);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [channelId, user]);

  const startGame = useCallback((category, language) => {
    socketRef.current.emit('start_game', { channelId, category, language });
  }, [channelId]);

  const submitClue = useCallback((clue) => {
    socketRef.current.emit('submit_clue', { channelId, userId: user.id, clue });
  }, [channelId, user?.id]);

  const submitVote = useCallback((targetId) => {
    socketRef.current.emit('submit_vote', { channelId, userId: user.id, targetId });
  }, [channelId, user?.id]);

  const resetGame = useCallback(() => {
    socketRef.current.emit('reset', { channelId });
  }, [channelId]);

  const nextRound = useCallback((forceNewWord = false) => {
    socketRef.current.emit('next_round', { channelId, forceNewWord });
  }, [channelId]);

  return { gameState, startGame, submitClue, submitVote, resetGame, nextRound };
}
