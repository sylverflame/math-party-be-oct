import { GameDifficultyConfig } from "./types"

export const ALLOW_NEGATIVE_ANSWERS: boolean = false
export const TOTAL_ROUNDS: number = 10
export const MAX_SCORE: number = 300_000
export const WRONG_ANSWER_PENALTY: number = MAX_SCORE * 0.01
export const MULTIPLAYER_ROOMCODE_LENGTH = 5
export const MAX_PLAYERS_PER_ROOM = 5
export const DIFFICULTY_SETTINGS: GameDifficultyConfig = {
    Easy: {
        id: 1,
        level: 'Easy',
        limits: {
            Add: {
                first: { min: 1, max: 20 },
                second: { min: 1, max: 20 },
            },
            Subtract: {
                first: { min: 1, max: 20 },
                second: { min: 1, max: 20 },
            },
            Multiply: {
                first: { min: 2, max: 10 },
                second: { min: 2, max: 10 },
            },
            Divide: {
                first: { min: 1, max: 20 },
                second: { min: 2, max: 4 },
            },
        },
    },
    Medium: {
        id: 2,
        level: 'Medium',
        limits: {
            Add: {
                first: { min: 1, max: 50 },
                second: { min: 1, max: 50 },
            },
            Subtract: {
                first: { min: 1, max: 50 },
                second: { min: 1, max: 50 },
            },
            Multiply: {
                first: { min: 2, max: 20 },
                second: { min: 2, max: 10 },
            },
            Divide: {
                first: { min: 1, max: 50 },
                second: { min: 2, max: 5 },
            },
        },
    },
    Hard: {
        id: 3,
        level: 'Hard',
        limits: {
            Add: {
                first: { min: 1, max: 150 },
                second: { min: 1, max: 100 },
            },
            Subtract: {
                first: { min: 1, max: 100 },
                second: { min: 1, max: 100 },
            },
            Multiply: {
                first: { min: 2, max: 20 },
                second: { min: 2, max: 20 },
            },
            Divide: {
                first: { min: 1, max: 100 },
                second: { min: 3, max: 10 },
            },
        },
    },
    Crazy: {
        id: 4,
        level: 'Crazy',
        limits: {
            Add: {
                first: { min: 1, max: 1000 },
                second: { min: 1, max: 1000 },
            },
            Subtract: {
                first: { min: 1, max: 500 },
                second: { min: 1, max: 500 },
            },
            Multiply: {
                first: { min: 1, max: 200 },
                second: { min: 1, max: 20 },
            },
            Divide: {
                first: { min: 1, max: 1000 },
                second: { min: 3, max: 10 },
            },
        },
    },
}