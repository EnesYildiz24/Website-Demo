import { LoginResource } from "../Resources";
import { JsonWebTokenError, JwtPayload, sign, verify } from "jsonwebtoken";
import { login } from "./AuthenticationService";

export async function verifyPasswordAndCreateJWT(
  email: string,
  password: string
): Promise<string | undefined> {
  const secret = process.env.JWT_SECRET;
  const ttl = process.env.JWT_TTL;
  if (!secret || !ttl) {
    throw new Error("JWT_SECRET oder JWT_TTL nicht gegeben");
  }

  const loggedInUser = await login(email, password);
  if (!loggedInUser) {
    console.warn("Login fehlgeschlagen: Ungültige E-Mail oder Passwort");
    return undefined;
  }

  // Verwende die Rolle direkt aus loggedInUser (lange Form)
  const payload: JwtPayload = {
    sub: loggedInUser.id,
    role: loggedInUser.role, // z.B. "admin", "seller", "buyer"
  };

  const jwtString = sign(payload, secret, {
    expiresIn: parseInt(ttl, 10),
    algorithm: "HS256",
  });

  return jwtString;
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new JsonWebTokenError("JWT_SECRET oder JWT_TTL nicht gegeben");
  }
  if (!jwtString) {
    throw new JsonWebTokenError("JWT ist nicht definiert");
  }

  try {
    const payload = verify(jwtString, secret, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    const userId = payload.sub as string;
    const exp = payload.exp as number;
    const role = payload.role as "admin" | "seller" | "buyer"; // direkt verwenden

    if (!userId || !exp || !role) {
      throw new JsonWebTokenError("Ungültiges JWT-Payload");
    }
    return {
      id: userId,
      role: role,
      exp: exp,
    } as LoginResource;
  } catch (err) {
    throw new JsonWebTokenError(`JWT-Validierung fehlgeschlagen: ${err}`);
  }
}
