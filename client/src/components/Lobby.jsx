import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getTranslation } from '../i18n';
import UserAvatar from './UserAvatar';

export default function Lobby({ gameState, startGame, currentUser }) {
  const [category, setCategory] = useState('Animal');
  const [language, setLanguage] = useState('en');

  const isHost = gameState.hostId === currentUser.id;
  const t = (key) => getTranslation(language, key);

  const categories = ['Personality', 'Object', 'Idea', 'Place', 'Movie', 'Animal', 'All'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="lobby-card m3-card"
    >
      <h1>{t('lobby_title')}</h1>
      
      <div className="players-list">
        <h3>{t('waiting_players')} ({gameState.players.length})</h3>
        <ul>
          {gameState.players.map(p => (
            <li key={p.id} className={`player-item ${p.id === gameState.hostId ? 'host' : ''}`}>
              <UserAvatar user={p} size={32} />
              {p.username} {p.id === currentUser.id && "(You)"}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <div className="host-controls">
          <div className="control-group">
            <label>{t('category')}:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(c => (
                <option key={c} value={c}>{t(`categories.${c}`)}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>{t('language')}:</label>
            <div className="lang-toggle">
              <button 
                className={language === 'en' ? 'active' : ''} 
                onClick={() => setLanguage('en')}
              >EN</button>
              <button 
                className={language === 'es' ? 'active' : ''} 
                onClick={() => setLanguage('es')}
              >ES</button>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => startGame(category, language)}
            disabled={gameState.players.length < 3}
          >
            {t('start_game')}
          </button>
          
          {gameState.players.length < 3 && (
            <p className="hint">Need at least 3 players to start</p>
          )}
        </div>
      ) : (
        <div className="guest-waiting">
          <p className="btn-tonal">{t('waiting_players')}...</p>
        </div>
      )}
    </motion.div>

  );
}
