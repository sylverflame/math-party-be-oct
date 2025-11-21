import { Player } from "../Player";
import { db } from "..";
import { DBScore, scoresTable } from "../db/schema";
export const insertScore = async (players: Player[], gameCode: string) => {
  try {
    // any clean-up
    const parsedScores = players
      .filter((player) => player.getScoresForDB().total_score > 0) /// Insert only scores which are higher than 0
      .map((player) => {
        const parsed: DBScore = {
          ...player.getScoresForDB(),
          game_code_id: gameCode,
        };
        return parsed;
      });
    // db call
    await db.insert(scoresTable).values(parsedScores);
  } catch (error) {
    throw new Error("Error submitting scores")
  }
};
