import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { InternalServerError } from "../error-handling/Errors";
import { userService } from "../services/user.service";

const getId = async (email: string): Promise<number> => {
  let id: number;
  // Add user to db if emailid does not exist
  const existingUser = await userService.selectUserWithEmail(email);
  if (!existingUser) {
    id = await userService.insertUserWithEmail(email);
  } else {
    id = existingUser.id;
  }
  return id;
};

const verifyCallback = async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  // Executed after hitting the callback endpoint
  try {
    const { sub, name, email } = profile._json;
    let id: number = 0;
    if (email) {
      id = await getId(email);
    }
    const jwtPayload = { sub, name, email, id };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, { expiresIn: "1h" });
    // Has to be passed as a user object - other objects cannot be appended to request here
    const user = {
      token,
    };
    done(null, user);
  } catch (error) {
    return done(error as InternalServerError);
  }
};

export const configurePassport = () => {
  const strategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/v1/google/callback",
}, verifyCallback);
  const googlePassport = passport.use(strategy);
  return googlePassport;
};
