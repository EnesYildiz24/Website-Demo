import { Router, Request, Response, NextFunction } from "express";
import {
  getAlleUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../services/UserService";
import { UserResource } from "../Resources";
import { User } from "../model/UserModel";
import { body, param, validationResult } from "express-validator";

const userRouter = Router();
const allowedRoles = ["admin", "seller", "buyer"];

userRouter.get("/", async (req: Request, res: Response) => {
  try {
    const users = await getAlleUser();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der User", error });
  }
});

userRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await getUser(req.params.id);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post("/", async (req: Request, res: Response) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fehler beim Erstellen eines Users", error });
  }
});

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const userId = req.params.id;
      const userResource: UserResource = req.body;
      const user = await User.findById(userId).exec();
      if (!user) {
        res.status(404).json({
          message: `Kein User mit der ID ${userId} gefunden, Update nicht möglich`,
        });
        return;
      }

      user.username = userResource.username;
      if (userResource.email) user.email = userResource.email;
      if (userResource.password) user.password = userResource.password;
      user.role = userResource.role as "admin" | "seller" | "buyer";

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.delete("/:id", async (req: Request, res: Response) => {
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
    res.status(500).json({ message: "Fehler beim Löschen eines Users", error });
  }
});

export default userRouter;
