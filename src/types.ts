// Represents a Jeopardy game configuration
export interface GameData {
  game: Game;
  players: Player[] | undefined;
  round: RoundName | undefined;
}

// Represents a player in the Jeopardy game
export interface Player {
  name: string;
  score: number;
  correct: number;
  incorrect: number;
}

export type RoundName = "single" | "final" | "done";
export const ROUND_SINGLE: RoundName = "single";
export const ROUND_FINAL: RoundName = "final";
export const ROUND_DONE: RoundName = "done";

export interface Game {
  single: GameRound;
  final: FinalRound;
}

export type GameRound = Category[];

export interface Category {
  category: string;
  html: boolean | undefined;
  clues: Clue[];
}

export interface Clue {
  value: number;
  clue: string;
  solution: string;
  dailyDouble: boolean | undefined;
  html: boolean | undefined;

  // Tracks whether the clue has already been played
  chosen: boolean | undefined;
}

export interface FinalRound {
  category: string;
  clue: string;
  solution: string;
  html: boolean | undefined;
}
