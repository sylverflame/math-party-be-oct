import z, { infer } from "zod";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";

export const RoomCodeSchema = z.string().length(MULTIPLAYER_ROOMCODE_LENGTH, { error: "Invalid room code" });
export const DifficultyLevelSchema = z.enum(["Easy", "Medium", "Hard", "Crazy"]);
export const GameSettingsSchema = z.object({
  totalRounds: z.coerce.number(),
  timePerRound: z.coerce.number(),
  isMultiplayer: z.boolean(),
  isPrivateGame: z.boolean(),
  difficulty: DifficultyLevelSchema,
});

// Web scoket message schemas
const ClientMessageTypeSchema = z.enum([
  "AUTHENTICATE_USER",
  "CREATE_GAME",
  "JOIN_ROOM",
  "LEAVE_ROOM",
  "START_GAME",
  "SOLUTION_SUBMIT",
  "SEND_CHAT_MESSAGE",
  "RESTART_GAME",
  "MESSAGE",
  "PENALTY",
  "NO_ANSWER",
  "UPDATE_GAME_SETTINGS"
]);
export const ClientMessageSchema = z.object({
  type: ClientMessageTypeSchema,
  payload: z.any(),
});

export const AuthPayloadSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

export const SendMessagePayloadSchema = z.object({
  message: z.string().max(20),
  roomCode: RoomCodeSchema,
});

export const CreateGamePayloadSchema = z.object({
  settings: GameSettingsSchema,
});

export const JoinLeaveStartPenaltyPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
});
export const SolutionPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
  round: z.coerce.number(),
  elapsedTime: z.coerce.number(),
});
export const RestartGamePayloadSchema = z.object({
  roomCode: RoomCodeSchema,
});
export const NoAnswerPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
  round: z.coerce.number(),
});
export const UpdateGameSettingsPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
  settings: GameSettingsSchema,
});

// Types
export type ClientMessage = z.infer<typeof ClientMessageSchema>;
export type RoomCode = z.infer<typeof RoomCodeSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
