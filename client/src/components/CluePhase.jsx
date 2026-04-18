import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslation } from '../i18n';
import UserAvatar from './UserAvatar';

export default function CluePhase({ gameState, submitClue, currentUser }) {
  const [clue, setClue] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const t = (key) => getTranslation(gameState.language, key);

  const isImpostor = gameState.impostorId === currentUser.id;
  const isExpelled = gameState.expelledPlayerIds?.includes(currentUser.id);
  const currentPlayerId = gameState.playerOrder[gameState.turnIndex];
  const isMyTurn = currentPlayerId === currentUser.id;

  useEffect(() => {
    if (isMyTurn && !isExpelled) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitClue(clue); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(10); // Reset for next person
    }
  }, [isMyTurn, isExpelled, clue, submitClue]);

  if (isExpelled) {
    return (
      <div className="game-screen spectating m3-card">
        <h2>{t('spectating')}</h2>
        <p>{t('spectating_desc')}</p>
        <div className="player-queue">
           {gameState.playerOrder.map((pid, index) => {
             const player = gameState.players.find(p => p.id === pid);
             const hasClue = !!gameState.clues[pid];
             const isCurrent = index === gameState.turnIndex;
             return (
               <div key={pid} className={`player-card m3-card-high ${isCurrent ? 'active' : ''}`}>
                 <UserAvatar user={player} size={40} style={{ marginBottom: '12px' }} />
                 <span className="username">{player?.username}</span>
                 {hasClue && <p className="clue-text">"{gameState.clues[pid]}"</p>}
               </div>
             );
           })}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="game-screen"
    >
      <div className="word-reveal m3-card">
        {isImpostor ? (
          <h2 className="impostor-text" style={{ color: 'var(--md-sys-color-error)' }}>
            {t('you_are_impostor')}
          </h2>
        ) : (
          <>
            <span className="word-label">{t('your_word')}</span>
            <span className="word">{gameState.currentWord}</span>
          </>
        )}
      </div>

      <div className="turn-indicator">
        {isMyTurn ? (
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="my-turn"
            style={{ color: 'var(--md-sys-color-primary)', fontWeight: 800 }}
          >
            <div className="voting-timer" style={{ marginBottom: '10px' }}>
              {t('time_left')}: {timeLeft}s
            </div>
          </motion.div>
        ) : (
          <div className="btn-tonal" style={{ display: 'inline-block' }}>{t('wait_turn')}</div>
        )}
      </div>

      <div className="player-queue">
        {gameState.playerOrder.map((pid, index) => {
          const player = gameState.players.find(p => p.id === pid);
          const hasClue = !!gameState.clues[pid];
          const isCurrent = index === gameState.turnIndex;

          return (
            <motion.div 
              key={pid} 
              layout
              className={`player-card m3-card-high ${isCurrent ? 'active' : ''}`}
            >
              <UserAvatar user={player} size={40} style={{ marginBottom: '12px' }} />
              <span className="username" style={{ fontWeight: 600 }}>{player?.username}</span>
              <AnimatePresence>
                {hasClue && (
                  <motion.span 
                    initial={{ scale: 0, rotate: -45 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="vote-badge"
                    style={{ background: 'var(--md-sys-color-success)', color: 'var(--md-sys-color-on-success)' }}
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
              {hasClue && <p className="clue-text">"{gameState.clues[pid]}"</p>}
            </motion.div>
          );
        })}
      </div>

      {isMyTurn && (
        <motion.div 
          initial={{ y: 100 }} 
          animate={{ y: 0 }} 
          className="input-area m3-card-high"
        >
          <input 
            type="text" 
            placeholder={t('write_clue')} 
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            maxLength={30}
            autoFocus
          />
          <button className="btn-primary" onClick={() => submitClue(clue)}>
            {t('submit')}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

