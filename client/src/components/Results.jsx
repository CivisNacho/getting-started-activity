import React from 'react';
import { motion } from 'framer-motion';
import { getTranslation } from '../i18n';
import UserAvatar from './UserAvatar';

export default function Results({ gameState, resetGame, nextRound, currentUser }) {
  const { lastResolution } = gameState;
  const t = (key) => getTranslation(gameState.language, key);

  if (!lastResolution) return <div>Loading results...</div>;

  const impostor = gameState.players.find(p => p.id === lastResolution.impostorId);
  const expelled = gameState.players.find(p => p.id === lastResolution.expelledId);
  const isHost = gameState.hostId === currentUser.id;

  const canContinue = lastResolution.canContinue;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, rotateX: 30 }} 
      animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="results-card m3-card"
    >
      <h1>{t('results_title')}</h1>

      <div className="outcome-banner">
        {lastResolution.impostorCaught ? (
          <div className="win-banner innocents">
            <h2 className="title">{t('innocents_win')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserAvatar user={impostor} size={32} />
              <p>{t('impostor_was')} <strong>{impostor?.username}</strong></p>
            </div>
          </div>
        ) : (
          <div className={`win-banner ${lastResolution.impostorWon ? 'game-over' : 'continuing'}`}>
            <h2 className="title">
              {lastResolution.impostorWon ? t('impostor_wins') : t('impostor_survived')}
            </h2>
            {expelled ? (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <UserAvatar user={expelled} size={32} />
                 <p>{t('expelled_innocent')}: {expelled.username}</p>
               </div>
            ) : (
               <p>{t('no_one_expelled')}</p>
            )}
            {!lastResolution.impostorWon && <p className="status-tip">{t('game_continues')}</p>}
          </div>
        )}
      </div>

      <div className="word-reveal-results" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          {t('word_was')}: <span className="word" style={{ fontSize: '1.8rem' }}>{lastResolution.word}</span>
        </p>
      </div>

      <div className="scoreboard m3-card-high" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h3 style={{ padding: '16px 16px 0 16px', color: 'var(--md-sys-color-primary)' }}>{t('scoreboard')}</h3>
        <ul>
          {gameState.players.sort((a,b) => gameState.scores[b.id] - gameState.scores[a.id]).map(p => (
            <li key={p.id} className="score-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserAvatar user={p} size={24} />
                <span style={{ fontWeight: 600 }}>{p.username}</span>
              </div>
              <span className="points">{gameState.scores[p.id]} pts</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="actions-footer">
        {isHost && (
          <>
            {canContinue ? (
              <button className="btn-primary" onClick={() => nextRound(false)}>
                {t('continue_same_word')}
              </button>
            ) : (
              <button className="btn-primary" onClick={() => nextRound(true)}>
                {t('play_again')}
              </button>
            )}
            <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={resetGame}>
              {t('back_to_lobby')}
            </button>
          </>
        )}
      </div>
    </motion.div>

  );
}
