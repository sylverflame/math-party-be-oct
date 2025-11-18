import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken"

export const googleOAuthConfig = () => {

  const googlePassport = passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/v1/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // Here, you could save the profile information to your database
        const {sub, name, email} = profile._json;
        const jwtPayload = {sub, name, email}
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {expiresIn: '1h'})
        const user = {
          ...profile._json,
          token
        };
        done(null, user);
      }
    )
  );
  return googlePassport;
};
