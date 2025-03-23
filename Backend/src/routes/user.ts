import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import {
  getAlleUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../services/UserService";
import { UserResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";
import {
  optionalAuthentication,
  requiresAuthentication,
} from "./authenticator";
import { sign } from "jsonwebtoken";

const userRouter = Router();
const allowedRoles = ["admin", "seller", "buyer"];

const COOKIE_NAME = "access_token";
const SECRET = process.env.JWT_SECRET!;
const TTL = parseInt(process.env.JWT_TTL!);

userRouter.get(
  "/",
  optionalAuthentication,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await getAlleUser();
      res.json(users);
    } catch (error) {
      logger.error("Fehler beim Löschen eines Users:", error);
      res.status(500).json({ message: "Fehler beim Abrufen der User", error });
    }
  }
);

userRouter.get(
  "/:id",
  param("id").isMongoId().withMessage("Ungültige User-ID"),
  optionalAuthentication,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await getUser(req.params.id);
      if (!users) {
        res.status(404).json({
          message: `Kein User mit der ID ${req.params.id} gefunden`,
        });
        return;
      }
      res.json(users);
    } catch (error) {
      logger.error("Fehler beim Löschen eines Users:", error);
      res
        .status(500)
        .json({ message: "Fehler beim Abrufen eines Users", error });
      next(error);
    }
  }
);

userRouter.post(
  "/",
  [
    body("username")
      .notEmpty()
      .withMessage("Der Benutzername darf nicht leer sein"),
    body("email").isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role")
      .isIn(allowedRoles)
      .withMessage("Rolle muss admin, seller oder buyer sein"),
  ],
  requiresAuthentication,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const newUser: UserResource = await createUser(req.body);
      console.log("POST /user =>", req.role, req.userId);
      if (req.role !== "admin") {
        // JWT-Token generieren
        const token = sign(
          {
            sub: newUser.id,
            role: newUser.role,
            username: newUser.username,
          },
          SECRET,
          { expiresIn: TTL, algorithm: "HS256" }
        );

        // Cookie setzen
        res.cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // in der Entwicklung false
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          expires: new Date(Date.now() + TTL * 1000),
        });
      }
      res.status(201).json(newUser);
    } catch (error) {
      logger.error("Fehler beim Erstellen eines Users:", error);
      res
        .status(500)
        .json({ message: "Fehler beim Erstellen eines Users", error });
    }
  }
);

userRouter.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Ungültige User-ID"),
    body("username")
      .notEmpty()
      .withMessage("Der Benutzername darf nicht leer sein"),
    body("email").optional().isEmail().withMessage("Ungültige E-Mail-Adresse"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Das Passwort muss mindestens 6 Zeichen lang sein"),
    body("role")
      .notEmpty()
      .withMessage("Die Rolle ist erforderlich")
      .isIn(allowedRoles)
      .withMessage("Rolle muss admin, seller oder buyer sein"),
  ],
  requiresAuthentication,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const userResource: UserResource = {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      };
      const updatedUser = await updateUser(userResource);
      if (!updatedUser) {
        res.status(404).json({
          message: `Kein User mit der ID ${req.params.id} gefunden, Update nicht möglich`,
        });
      }
      res.json(updatedUser);
    } catch (error) {
      logger.error("Fehler beim Aktualisieren eines Users:", error);
      next(error);
    }
  }
);

userRouter.delete(
  "/:id",
  requiresAuthentication,
  async (req: Request, res: Response): Promise<void> => {
    if (req.userId !== req.params.id && req.role !== "admin") {
      res
        .status(403)
        .json({
          message: "Nur Admins oder der User selbst dürfen User löschen",
        });
      return;
    }
    try {
      const deletedUser = await deleteUser(req.params.id);
      if (!deletedUser) {
        res
          .status(404)
          .json({ message: "User nicht gefunden oder bereits gelöscht" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fehler beim Löschen eines Users", error });
    }
  }
);

export { userRouter };
