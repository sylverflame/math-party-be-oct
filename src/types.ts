export type UserID = string;
type Operator = "Add" | "Subtract" | "Multiply" | "Divide";
type DifficultyLevel = "Easy" | "Medium" | "Hard" | "Crazy";

// Game Entity types
export type GameRound = {
  first: number;
  second: number;
  operator: Operator;
  solution?: number;
};

export type GameSettings = {
  totalRounds: number;
  timePerRound: number;
  difficulty: DifficultyLevel;
};

type NumberLimit = {
  first: { min: number; max: number };
  second: { min: number; max: number };
};

type Setting = {
  id: number;
  level: DifficultyLevel;
  limits: Record<Operator, NumberLimit>;
};

export type GameDifficultyConfig = Record<DifficultyLevel, Setting>;

// Player Entitity types
export type PlayerScore = {
  round: number;
  score: number;
};

export type PlayerRole = "Host" | "Player";
