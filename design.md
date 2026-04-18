# Impostor Game – Specification

## Description

This is a multiplayer game in which all players are assigned a word except one (the impostor).

Each player must give a clue to convince others they know the word, while avoiding giving too much information that would allow the impostor to guess it.

---

## Game Rules

* All players receive a word except one.
* Each player provides a clue.
* Clues are given sequentially.
* Each player has a maximum of 10 seconds to write their clue.
* If time runs out, the content of the text field is automatically submitted (even if empty).

### Voting

* Each player can:

  * Vote for another player to expel them as the impostor
  * Vote blank
* Players cannot vote blank in two consecutive rounds

### Vote Resolution

* If the majority votes blank → no one is expelled
* If there is a tie between players → no one is expelled
* If there is a clear majority → the voted player is expelled

### Scoring

* Only the impostor receives points
* The impostor gets 1 point for each non-impostor player who has been expelled

---

## Requirements

* The app must use the Discord username to identify each player

---

## Screens

### Screen 1: Lobby

* Allows:

  * Hosting a game
  * Joining an existing game
* The host can:

  * Select a word category
  * Choose a global category
* Players can:

  * Stay in the waiting room
  * Leave the game to join another

---

### Screen 2: Clue Phase

* When the game starts:

  * Players are ordered randomly
  * The order remains until the word changes

* Each player:

  * Has a sequential turn
  * Has a text field to write their clue

* The interface must display:

  * Active players
  * Clues in real time

* Clues are reset after each iteration following the vote

---

### Screen 3: Voting

* Each player votes:

  * For another player
  * Or blank

* Rules:

  * Majority blank → no one expelled
  * Tie → no one expelled

---

### Screen 4: Results

* The impostor is expelled (if applicable)
* Points are distributed
* A scoreboard with current scores is displayed