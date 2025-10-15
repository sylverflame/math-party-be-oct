import z, { infer } from "zod";
import { MULTIPLAYER_ROOMCODE_LENGTH } from "./config";

export const RoomCodeSchema = z.string().length(MULTIPLAYER_ROOMCODE_LENGTH);
export const DifficultyLevelSchema = z.enum(["Easy", "Medium", "Hard", "Crazy"]);
export const GameSettingsSchema = z.object({
  totalRounds: z.coerce.number(),
  timePerRound: z.coerce.number(),
  isMultiplayer: z.boolean(),
  isPrivateGame: z.boolean(),
  difficulty: DifficultyLevelSchema,
});

// Web scoket message schemas
const ClientMessageTypeSchema = z.enum(["AUTHENTICATE_USER", "CREATE_GAME", "JOIN_ROOM", "LEAVE_ROOM", "START_GAME", "SOLUTION_SUBMIT"]);
export const ClientMessageSchema = z.object({
  type: ClientMessageTypeSchema,
  payload: z.any(),
});

export const AuthPayloadSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

export const CreateGamePayloadSchema = z.object({
  settings: GameSettingsSchema,
});

export const JoinLeaveStartPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
});
export const SolutionPayloadSchema = z.object({
  roomCode: RoomCodeSchema,
  round: z.coerce.number(),
  score: z.coerce.number(),
});

// Types
export type ClientMessage = z.infer<typeof ClientMessageSchema>;
export type RoomCode = z.infer<typeof RoomCodeSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
