import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { db } from "..";
import { NewUser, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { BadRequestError, InternalServerError } from "../error-handling/Errors";

export const googleOAuthConfig = () => {
  const googlePassport = passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/v1/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        // Executed after hitting the callback endpoint
        try {
          const { sub, name, email } = profile._json;
          if (email) {
            // Add user to db if emailid does not exist
            const [userInDb] = await db.select({ email: usersTable.email_id }).from(usersTable).where(eq(usersTable.email_id, email)).limit(1);
            if (!userInDb.email) {
              let newUser: NewUser = {
                email_id: email,
              };
              await db.insert(usersTable).values(newUser);
            }
          }
          const jwtPayload = { sub, name, email };
          const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, { expiresIn: "1h" });
          const user = {
            ...profile._json,
            token,
          };
          done(null, user);
        } catch (error) {
          return done(error as InternalServerError);
        }
      }
    )
  );
  return googlePassport;
};
