import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getTranslation } from '../i18n';
import UserAvatar from './UserAvatar';

export default function VotingPhase({ gameState, submitVote, currentUser }) {
  const [votedId, setVotedId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const hasAutoVoted = useRef(false);
  const t = (key) => getTranslation(gameState.language, key);

  const isExpelled = gameState.expelledPlayerIds?.includes(currentUser.id);
  const hasVoted = !!gameState.votes[currentUser.id];
  const activePlayers = gameState.players.filter(p => !gameState.expelledPlayerIds?.includes(p.id));

  const handleVote = (id) => {
    if (votedId || isExpelled) return;
    setVotedId(id);
    submitVote(id);
  };

  // 30-second voting timer
  useEffect(() => {
    if (hasVoted || isExpelled) return;

    hasAutoVoted.current = false;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasAutoVoted.current) {
            hasAutoVoted.current = true;
            handleVote('blank');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasVoted, isExpelled]);

  if (isExpelled) {
    return (
      <div className="game-screen spectating m3-card">
        <h2>{t('spectating')}</h2>
        <p>{t('spectating_desc')}</p>
        <div className="voting-grid">
           {activePlayers.map(p => (
             <div key={p.id} className="vote-card m3-card-high disabled">
               <UserAvatar user={p} size={48} style={{ marginBottom: '12px' }} />
               <span className="username" style={{ fontWeight: 600 }}>{p.username}</span>
               {gameState.clues[p.id] && <p className="clue-text" style={{ fontSize: '0.85rem' }}>"{gameState.clues[p.id]}"</p>}
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="game-screen"
    >
      <h1 className="voting-title">{t('voting_title')}</h1>

      <div className="timer-container">
        {!hasVoted && (
          <div className={`voting-timer ${timeLeft <= 10 ? 'urgent' : ''}`}>
            {t('time_left')}: {timeLeft}s
          </div>
        )}
      </div>

      <div className="voting-grid">
        {activePlayers.map(p => {
          const isMe = p.id === currentUser.id;
          const isVoted = votedId === p.id;

          return (
            <motion.div 
              key={p.id}
              layout
              whileHover={!hasVoted && !isMe ? { scale: 1.05, y: -5 } : {}}
              whileTap={!hasVoted && !isMe ? { scale: 0.95 } : {}}
              className={`vote-card m3-card-high ${isMe ? 'disabled' : ''} ${isVoted ? 'voted' : ''}`}
              onClick={() => !isMe && handleVote(p.id)}
            >
              <UserAvatar user={p} size={64} style={{ marginBottom: '16px' }} />
              <span className="username" style={{ fontWeight: 600 }}>{p.username}</span>
              {gameState.clues[p.id] && (
                <p className="clue-text" style={{ fontSize: '0.85rem' }}>"{gameState.clues[p.id]}"</p>
              )}
              <AnimatePresence>
                {hasVoted && gameState.votes[currentUser.id] === p.id && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="vote-badge"
                  >
                    {t('voted')}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="voting-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
        <button 
          className={`btn-primary ${votedId === 'blank' ? 'voted' : ''}`}
          style={votedId === 'blank' ? { background: 'var(--md-sys-color-secondary)' } : {}}
          onClick={() => handleVote('blank')}
          disabled={hasVoted}
        >
          {t('vote_blank')}
        </button>
      </div>

      <div className="voting-status" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--md-sys-color-primary)', fontWeight: 800 }}>
        <div className="btn-tonal" style={{ display: 'inline-block' }}>
          {Object.keys(gameState.votes).length} / {activePlayers.length} {t('players_voted_desc') || 'Players Voted'}
        </div>
      </div>
    </motion.div>
  );
}

