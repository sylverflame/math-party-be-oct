import z, { infer } from "zod";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";

export const RoomCodeSchema = z.string().length(MULTIPLAYER_ROOMCODE_LENGTH);
export const DifficultyLevelSchema = z.enum(["Easy", "Medium", "Hard", "Crazy"]);
export const GameSettingsSchema = z.object({
  totalRounds: z.number(),
  timePerRound: z.number(),
  isMultiplayer: z.boolean(),
  difficulty: DifficultyLevelSchema,
});

// Web scoket message schemas
const IncomingMessageTypeSchema = z.enum(["AUTHENTICATE_USER", "CREATE_GAME", "JOIN_ROOM", "LEAVE_ROOM"]);
export const IncomingMessageSchema = z.object({
  type: IncomingMessageTypeSchema,
  payload: z.any(),
});

export const AuthPayloadSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

export const CreateGamePayloadSchema = z.object({
  settings: GameSettingsSchema,
});

export const JoinLeavePayloadSchema = z.object({
  roomCode: RoomCodeSchema,
});

// Types
export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;
export type RoomCode = z.infer<typeof RoomCodeSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
