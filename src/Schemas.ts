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
export const MessageSchema = z.object({
  type: z.string(),
  payload: z.any(),
});

export const AuthMessageSchema = z.object({
  type: z.literal("AUTH"),
  payload: z.object({
    userId: z.string(),
    token: z.string(),
  }),
});

export const CreateGameMessageSchema = z.object({
  type: z.literal("CREATE_GAME"),
  payload: z.object({
    settings: GameSettingsSchema,
  }),
});
export const JoinGameMessageSchema = z.object({
  type: z.literal("JOIN_ROOM"),
  payload: z.object({
    roomCode: RoomCodeSchema,
  }),
});

// Types
export type WsMessage = z.infer<typeof MessageSchema>;
export type AuthMessage = z.infer<typeof AuthMessageSchema>;
export type RoomCode = z.infer<typeof RoomCodeSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
