import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

type database = NodePgDatabase<Record<string, never>> & { $client: Pool };
type InsertId = number;

export class UsersRepository {
  private db: database;
  constructor(db: database) {
    this.db = db;
  }
  selectUserWithEmail = async (email: string) => {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.email_id, email)).limit(1);
    return user;
  };

  insertUserWithEmail = async (email: string): Promise<InsertId> => {
    const [createdUser] = await this.db
      .insert(usersTable)
      .values({
        email_id: email,
      })
      .returning({ id: usersTable.id });
    return createdUser.id;
  };
}
