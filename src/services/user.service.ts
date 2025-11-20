import { eq } from "drizzle-orm";
import { db } from "..";
import { usersTable } from "../db/schema";

type InsertId = number;

const selectUserWithEmail = async (email: string) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email_id, email)).limit(1);
  return user;
};

const insertUserWithEmail = async (email: string): Promise<InsertId> => {
  const [createdUser] = await db
    .insert(usersTable)
    .values({
      email_id: email,
    })
    .returning({ id: usersTable.id });
  return createdUser.id;
};



export const userService = {
  selectUserWithEmail: selectUserWithEmail,
  insertUserWithEmail: insertUserWithEmail,
};
