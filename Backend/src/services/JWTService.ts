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

  // Mapping der Rollentypen von "admin" | "seller" | "buyer" zu "a" | "s" | "b"
  let mappedRole: "a" | "s" | "b";
  switch (loggedInUser.role) {
    case "admin":
      mappedRole = "a";
      break;
    case "seller":
      mappedRole = "s";
      break;
    case "buyer":
      mappedRole = "b";
      break;
    default:
      throw new Error("Unbekannte Rolle im Login-Response");
  }

  const payload: JwtPayload = {
    sub: loggedInUser.id,
    role: mappedRole,
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

    // Mapping der Rollentypen aus dem JWT-Payload
    let mappedRole: "a" | "s" | "b";
    switch (payload.role) {
      case "admin":
        mappedRole = "a";
        break;
      case "seller":
        mappedRole = "s";
        break;
      case "buyer":
        mappedRole = "b";
        break;
      default:
        throw new JsonWebTokenError("Ungültige Rolle im JWT-Payload");
    }

    if (!userId || !exp || !mappedRole) {
      throw new JsonWebTokenError("Ungültiges JWT-Payload");
    }
    return {
      id: userId,
      role: mappedRole,
      exp: exp,
    } as LoginResource;
  } catch (err) {
    throw new JsonWebTokenError(`JWT-Validierung fehlgeschlagen: ${err}`);
  }
}
