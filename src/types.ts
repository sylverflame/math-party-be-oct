import { DifficultyLevel } from "./Schemas";

export type UserID = string;
export const operators = ["Add", "Subtract", "Multiply", "Divide"] as const;
export type Operator = (typeof operators)[number];

// Game Entity types
export type GameRound = {
  firstNumber: number;
  secondNumber: number;
  operator: Operator;
  solution?: number;
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

const playerRoles = ["Host", "Player"] as const;
export type PlayerRole = (typeof playerRoles)[number];
