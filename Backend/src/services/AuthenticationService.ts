import { logger } from "../logger";
import { User } from "../model/UserModel";

/**
 * Prüft Campus-ID und Passwort, bei Erfolg ist `success` true
 * und es wird die `id` und `role` ("u" oder "a") des Profs zurückgegeben
 *
 * Falls kein Prof mit gegebener Campus-ID existiert oder das Passwort falsch ist, wird nur
 * `success` mit falsch zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(
  email: string,
  password: string
): Promise<{ id: string; role: "admin" | "seller" | "buyer" } | false> {
  if (!email || !password) {
    logger.warn("Kein Email oder Passwort angegeben");
    return false;
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return false;
  }

  const iscorrectPassword = await user.isCorrectPassword(password);
  if (!iscorrectPassword) {
    return false;
  }
  const role: "admin" | "seller" | "buyer" = user.role;
  return { id: user._id.toString(), role };
}
