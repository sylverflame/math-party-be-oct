import { DifficultyLevel } from "./Schemas";

export type UserID = string;
export const operators = ["Add", "Subtract", "Multiply", "Divide"] as const;
export type Operator = (typeof operators)[number];
export const sendMessageTypes = ["Message", "Error", "Success", "Notification"] as const;
export type SendMessageType = (typeof sendMessageTypes)[number];

export enum OutgoingMessageTypes {
  MESSAGE = "MESSAGE",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  NOTIFICATION = "NOTIFICATION",
  CHAT_MESSAGE = "CHAT_MESSAGE"
}

export enum SocketManagerEvents {
  CREATE_GAME = "CREATE_GAME",
  JOIN_ROOM = "JOIN_ROOM",
  LEAVE_ROOM = "LEAVE_ROOM",
  PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED",
  START_GAME = "START_GAME",
  SOLUTION_SUBMIT = "SOLUTION_SUBMIT",
  SEND_CHAT_MESSAGE = "SEND_CHAT_MESSAGE",
  RESTART_GAME = "RESTART_GAME",
  PENALTY = "PENALTY",
  NO_ANSWER = "NO_ANSWER",
  UPDATE_GAME_SETTINGS = "UPDATE_GAME_SETTINGS"
}

export enum GameManagerEvents {
  GAME_CREATED = "GAME_CREATED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  GAME_STARTED = "GAME_STARTED",
  NEXT_ROUND = "NEXT_ROUND",
  BROADCAST_MESSAGE = "BROADCAST_MESSAGE",
  GAME_RESTARTED = "GAME_RESTARTED",
  STATE_UPDATED="STATE_UPDATED",
  PLAYER_GAME_FINISHED="PLAYER_GAME_FINISHED",
  GAME_OVER="GAME_OVER",
  SCORES_NOT_SUBMITTED="SCORES_NOT_SUBMITTED",
  GAME_SETTINGS_UPDATED="GAME_SETTINGS_UPDATED"
}

export enum Status {
  Success = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export enum ErrorCodes {
  ERR_001 = "ERR_001: Invalid authentication request",
  ERR_002 = "ERR_002: Invalid Credentials",
  ERR_003 = "ERR_003: No payload received",
  ERR_004 = "ERR_004: Sorry can't find that!",
  ERR_005 = "ERR_005: Something went wrong!",
  ERR_006 = "ERR_006: User already exists",
  ERR_007 = "ERR_007: User not found",
  ERR_008 = "ERR_008: JWT secret key not available",
  ERR_009 = "ERR_009: Invalid query parameters",
  ERR_010 = "ERR_010: No game found",
  ERR_011 = "ERR_011: Missing environment variables",
}

// Game Entity types
export type GameRound = {
  roundNumber: number;
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

export enum GameStatus {
  INITIALIZING_GAME = "INITIALIZING_GAME",
  WAITING_TO_START = "WAITING_TO_START",
  GAME_IN_PROGRESS = "GAME_IN_PROGRESS",
  GAME_OVER="GAME_OVER"
}

export type GameDifficultyConfig = Record<DifficultyLevel, Setting>;

// Player Entitity types
export type PlayerScore = {
  round: number;
  elapsedTime: number;
  score: number;
};

const playerRoles = ["Host", "Player"] as const;
export type PlayerRole = (typeof playerRoles)[number];
