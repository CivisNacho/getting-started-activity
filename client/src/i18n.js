const translations = {
  en: {
    lobby_title: "Impostor Game Lobby",
    host_game: "Host Game",
    join_game: "Join Game",
    waiting_players: "Waiting for players...",
    start_game: "Start Game",
    category: "Category",
    language: "Language",
    clue_phase: "Clue Phase",
    write_clue: "Write your clue...",
    submit: "Submit",
    time_left: "Time left",
    voting_title: "Who is the Impostor?",
    vote_blank: "Vote Blank",
    results_title: "Round Results",
    impostor_was: "The impostor was",
    word_was: "The word was",
    innocents_win: "Innocents Win!",
    impostor_wins: "Impostor Wins!",
    play_again: "Play Again",
    your_word: "Your word:",
    you_are_impostor: "YOU ARE THE IMPOSTOR!",
    wait_turn: "Waiting for others to give clues...",
    voted: "Voted!",
    scoreboard: "Scoreboard",
    impostor_survived: "The Impostor Survived!",
    game_continues: "The game continues with the same word...",
    expelled_innocent: "Expelled innocent",
    no_one_expelled: "No one was expelled!",
    continue_same_word: "Continue",
    back_to_lobby: "Back to Lobby",
    spectating: "You are spectating...",
    spectating_desc: "You were expelled! Watch the others find the impostor.",
    categories: {
      Personality: "Personality",
      Object: "Object",
      Idea: "Idea",
      Place: "Place",
      Movie: "Movie",
      Animal: "Animal",
      All: "All"
    }
  },
  es: {
    lobby_title: "Lobby del Impostor",
    host_game: "Crear Partida",
    join_game: "Unirse",
    waiting_players: "Esperando jugadores...",
    start_game: "Empezar",
    category: "Categoría",
    language: "Idioma",
    clue_phase: "Fase de Pistas",
    write_clue: "Escribe tu pista...",
    submit: "Enviar",
    time_left: "Tiempo restante",
    voting_title: "¿Quién es el Impostor?",
    vote_blank: "Voto en Blanco",
    results_title: "Resultados",
    impostor_was: "El impostor era",
    word_was: "La palabra era",
    innocents_win: "¡Ganan los Inocentes!",
    impostor_wins: "¡Gana el Impostor!",
    play_again: "Jugar de nuevo",
    your_word: "Tu palabra:",
    you_are_impostor: "¡ERES EL IMPOSTOR!",
    wait_turn: "Esperando pistas de los demás...",
    voted: "¡Votado!",
    scoreboard: "Puntuaciones",
    impostor_survived: "¡El impostor ha sobrevivido!",
    game_continues: "La partida continúa con la misma palabra...",
    expelled_innocent: "Inocente expulsado",
    no_one_expelled: "¡Nadie fue expulsado!",
    continue_same_word: "Continuar",
    back_to_lobby: "Volver al Lobby",
    spectating: "Estás espectando...",
    spectating_desc: "¡Fuiste expulsado! Mira cómo los demás buscan al impostor.",
    categories: {
      Personality: "Personalidad",
      Object: "Objeto",
      Idea: "Idea",
      Place: "Lugar",
      Movie: "Película",
      Animal: "Animal",
      All: "Todos"
    }
  }
};

export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let result = translations[lang] || translations['en'];
  for (const k of keys) {
    result = result[k];
    if (!result) return key;
  }
  return result;
};
