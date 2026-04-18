import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wordsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf-8'));

const rooms = new Map();

/**
 * Game Phases: 
 * - 'LOBBY'
 * - 'CLUE_PHASE'
 * - 'VOTING'
 * - 'RESULTS'
 */

export function getRoom(channelId) {
  if (!rooms.has(channelId)) {
    rooms.set(channelId, {
      id: channelId,
      players: [],
      hostId: null,
      phase: 'LOBBY',
      category: 'Animal',
      language: 'en',
      currentWord: '',
      impostorId: null,
      turnIndex: 0,
      clues: {}, // userId -> clue
      votes: {}, // userId -> targetId (or 'blank')
      lastResolution: null,
      scores: {}, // userId -> score
      playerOrder: [],
      expelledPlayerIds: [],
    });
  }
  return rooms.get(channelId);
}

export function joinPlayer(channelId, user) {
  const room = getRoom(channelId);
  if (!room.players.find(p => p.id === user.id)) {
    room.players.push(user);
    if (!room.scores[user.id]) room.scores[user.id] = 0;
    if (!room.hostId) room.hostId = user.id;
  }
  return room;
}

export function leavePlayer(channelId, userId) {
  const room = rooms.get(channelId);
  if (!room) return;
  room.players = room.players.filter(p => p.id !== userId);
  if (room.hostId === userId) {
    room.hostId = room.players[0]?.id || null;
  }
  if (room.players.length === 0) {
    rooms.delete(channelId);
  }
}

export function startGame(channelId, category, language) {
  const room = getRoom(channelId);
  room.category = category;
  room.language = language;
  
  // Pick a word
  let availableCategories = Object.keys(wordsData[language]);
  let selectedCategory = category === 'All' ? availableCategories[Math.floor(Math.random() * availableCategories.length)] : category;
  const words = wordsData[language][selectedCategory];
  room.currentWord = words[Math.floor(Math.random() * words.length)];
  
  // Assign Impostor
  const impostorIndex = Math.floor(Math.random() * room.players.length);
  room.impostorId = room.players[impostorIndex].id;
  
  // Randomize Order
  room.playerOrder = room.players.map(p => p.id).sort(() => Math.random() - 0.5);
  
  room.phase = 'CLUE_PHASE';
  room.turnIndex = 0;
  room.clues = {};
  room.votes = {};
  room.expelledPlayerIds = [];
  
  return room;
}

export function nextRound(channelId, forceNewWord = false) {
  const room = getRoom(channelId);
  const lastRes = room.lastResolution;

  const shouldStartNewWord = forceNewWord || (lastRes && (lastRes.impostorCaught || lastRes.impostorWon));

  if (shouldStartNewWord) {
    // Start fresh with a new word and all players
    return startGame(channelId, room.category, room.language);
  } else {
    // Continue with same word, exclude expelled players
    room.phase = 'CLUE_PHASE';
    room.turnIndex = 0;
    room.clues = {};
    room.votes = {};
    
    // playerOrder only includes people not expelled
    room.playerOrder = room.players
      .map(p => p.id)
      .filter(id => !room.expelledPlayerIds.includes(id))
      .sort(() => Math.random() - 0.5);
      
    room.lastResolution = null;
    return room;
  }
}

export function submitClue(channelId, userId, clue) {
  const room = getRoom(channelId);
  if (room.phase !== 'CLUE_PHASE') return room;
  
  const currentPlayerId = room.playerOrder[room.turnIndex];
  if (currentPlayerId !== userId) return room;
  
  room.clues[userId] = clue || "...";
  room.turnIndex++;
  
  if (room.turnIndex >= room.playerOrder.length) {
    room.phase = 'VOTING';
  }
  
  return room;
}

export function submitVote(channelId, userId, targetId) {
  const room = getRoom(channelId);
  if (room.phase !== 'VOTING') return room;
  
  room.votes[userId] = targetId;
  
  // If everyone voted
  if (Object.keys(room.votes).length === room.players.length) {
    resolveVotes(channelId);
  }
  
  return room;
}

function resolveVotes(channelId) {
  const room = getRoom(channelId);
  const voteCounts = {};
  
  Object.values(room.votes).forEach(vid => {
    if (vid !== 'blank') {
      voteCounts[vid] = (voteCounts[vid] || 0) + 1;
    }
  });

  const blanks = Object.values(room.votes).filter(v => v === 'blank').length;
  
  let maxVotes = 0;
  let expelledId = null;
  let tie = false;
  
  for (const [pid, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      expelledId = pid;
      tie = false;
    } else if (count === maxVotes) {
      tie = true;
    }
  }

  // Design rules:
  // Majority blank -> no one expelled
  // Tie -> no one expelled
  // Clear majority -> expelled
  
  if (blanks > maxVotes) expelledId = null;
  if (tie && maxVotes > 0) expelledId = null;

  const impostorCaught = expelledId === room.impostorId;
  let impostorWon = false;

  if (expelledId && !impostorCaught) {
    // Impostor gets points for caught innocents
    room.scores[room.impostorId] = (room.scores[room.impostorId] || 0) + 1;
    room.expelledPlayerIds.push(expelledId);
  }

  // Check if Impostor wins (only 2 active players left: Impostor + 1 innocent)
  const activePlayers = room.players.filter(p => !room.expelledPlayerIds.includes(p.id));
  if (!impostorCaught && activePlayers.length <= 2) {
    impostorWon = true;
    // Massive bonus for impostor winning the long game?
    room.scores[room.impostorId] = (room.scores[room.impostorId] || 0) + 3;
  }

  room.lastResolution = {
    expelledId,
    impostorId: room.impostorId,
    impostorCaught,
    impostorWon,
    word: room.currentWord,
    votes: room.votes,
    canContinue: !impostorCaught && !impostorWon
  };
  
  room.phase = 'RESULTS';
}

export function resetToLobby(channelId) {
  const room = getRoom(channelId);
  room.phase = 'LOBBY';
  room.currentWord = '';
  room.impostorId = null;
  room.clues = {};
  room.votes = {};
  room.playerOrder = [];
  return room;
}
