import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { login } from "../services/AuthenticationService";
import { JsonWebTokenError, JwtPayload, sign, verify } from "jsonwebtoken";
import { LoginResource } from "../Resources";
import cookieParser from "cookie-parser";
import { verifyJWT } from "../services/JWTService";

export const loginRouter = express.Router();
loginRouter.use(cookieParser());

// hier ohne Fehlerbehandlung für die Demo
const COOKIE_NAME = "access_token";
const SECRET = process.env.JWT_SECRET!;
const TTL = parseInt(process.env.JWT_TTL!);

loginRouter.post(
  "/",
  body("email").isString().isEmail(),
  body("password").isString().isLength({ min: 8 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, password } = matchedData(req) as {
      email: string;
      password: string;
    };
    console.log("📩 Eingehende Login-Daten:", email, password);

    const loginResult = await login(email, password);
    
    if (!loginResult) {
      res.status(401).send("Login failed");
      return;
    }
    const jwtString = sign(
      {
        // Payload
        sub: loginResult.id,
        role: loginResult.role,
        username: loginResult.username,

      },
      SECRET,
      {
        // SignOptions
        expiresIn: TTL, // numeric, i.e. seconds
        algorithm: "HS256",
      }
    );
    res.cookie(COOKIE_NAME, jwtString, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + TTL * 1000),
    });

    res.status(201).json({
      id: loginResult.id,
      role: loginResult.role,
      username: loginResult.username, 
    });
    return;
  }
);

loginRouter.get("/", (req, res) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json(false);
    return;
  }
  try {
    const payload = verifyJWT(token);
    res.json(payload);
  } catch (err) {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json(false);
  }
});

loginRouter.delete("/", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.sendStatus(200);
});
