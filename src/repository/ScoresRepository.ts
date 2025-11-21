import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Player } from "../Player";
import { DBScore, scoresTable } from "../db/schema";

type database = NodePgDatabase<Record<string, never>> & { $client: Pool };

export class ScoresRepository {
  private db: database;
  constructor(db: database) {
    this.db = db;
  }

  insertScores = async (scores: DBScore[]) => {
    try {
      await this.db.insert(scoresTable).values(scores);
    } catch (error) {
      throw new Error("Error submitting scores");
    }
  };
}
