import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DBUser, DBUserUpdate, usersTable } from "../db/schema";

type database = NodePgDatabase<Record<string, never>> & { $client: Pool };
type InsertId = number;

export class UsersRepository {
  private db: database;
  constructor(db: database) {
    this.db = db;
  }
  selectUserWithEmail = async (email: string): Promise<DBUser> => {
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

  selectUsernameCountryByEmail = async (email: string): Promise<Pick<DBUser, "username" | "country">> => {
    const result = await this.db
      .select({
        username: usersTable.username,
        country: usersTable.country,
      })
      .from(usersTable)
      .where(eq(usersTable.email_id, email));
    return result[0];
  };

  selectUserByEmail = async (email: string): Promise<DBUser> => {
    const result = await this.db.select().from(usersTable).where(eq(usersTable.email_id, email)).limit(1);
    return result[0];
  };
  updateUser = async (userId: number, userData: DBUserUpdate) => {
    const result = await this.db.update(usersTable).set(userData).where(eq(usersTable.id, userId)).returning();
    return result[0];
  };
}
