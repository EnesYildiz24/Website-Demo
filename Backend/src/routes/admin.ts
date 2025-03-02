import { Router, Request, Response, NextFunction } from "express";
import {
  getAllAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../services/AdminService";
import { AdminResource } from "../Resources";
import { body, param, validationResult } from "express-validator";
import { logger } from "../logger";

const adminRouter = Router();
const allowedRoles = ["admin", "seller", "buyer"];

adminRouter.get("/", async (req: Request, res: Response) => {
  try {
    const admins = await getAllAdmins();
    res.json(admins);
  } catch (error) {
    logger.error("Fehler beim Abrufen der Admins:", error);
    res.status(500).json({ message: "Fehler beim Abrufen der Admins", error });
  }
});

adminRouter.get(
  "/:id",
  param("id").isMongoId().withMessage("Ungültige admin-ID"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const admin = await getAdmin(req.params.id);
      if (!admin) {
        res.status(404).json({
          message: `Kein Admin mit der ID ${req.params.id} gefunden`,
        });
        return;
      }
      res.json(admin);
    } catch (error) {
      logger.error("Fehler beim Abrufen eines Admins:", error);
      res.status(404).json({ message: "Fehler beim Abrufen eines Admins", error });
      next(error);
    }
  }
);

adminRouter.post(
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
    body("permissions").isArray().optional(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    if (req.body.role !== "admin") {
      res.status(403).json({ message: "Nur Admins dürfen Admins erstellen" });
      return;
    }
    try {
      const newAdmin = await createAdmin(req.body);
      res.status(201).json(newAdmin);
    } catch (error) {
      logger.error("Fehler beim Erstellen eines Admins:", error);
      res.status(500).json({ message: "Fehler beim Erstellen eines Admins", error });
    }
  }
);

adminRouter.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Ungültige admin-ID"),
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
    body("permissions").optional().isArray(),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    if (req.body.role !== "admin") {
      res.status(403).json({ message: "Nur Admins dürfen Admins aktualisieren" });
      return;
    }
    try {
      const adminResource: AdminResource = {
        id: req.params.id,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        permissions: req.body.permissions,
      };
      const updatedAdmin = await updateAdmin(adminResource);
      if (!updatedAdmin) {
        res.status(404).json({
          message: `Kein Admin mit der ID ${req.params.id} gefunden, Update nicht möglich`,
        });
        return;
      }
      res.json(updatedAdmin);
    } catch (error) {
      logger.error("Fehler beim Aktualisieren eines Admins:", error);
      next(error);
    }
  }
);

adminRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedAdmin = await deleteAdmin(req.params.id);
    if (!deletedAdmin) {
      res.status(404).json({ message: "Admin nicht gefunden oder bereits gelöscht" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen eines Admins", error });
  }
});

export { adminRouter };
