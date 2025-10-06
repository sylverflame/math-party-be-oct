import z, { infer } from "zod";

export const MessageSchema = z.object({
    type: z.string(),
    payload: z.any()
})

export const AuthMessageSchema = z.object({
    type: z.literal("AUTH"),
    payload: z.object({
        userId: z.string(),
        token: z.string()
    })
})

export type WsMessage = z.infer<typeof MessageSchema>
export type AuthMessage = z.infer<typeof AuthMessageSchema>