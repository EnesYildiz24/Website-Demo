import request from "supertest";
import express from "express";
import { userRouter } from "../../src/routes/user"; 
import { deleteUser } from "../../src/services/UserService";
import { expect, jest, test } from "@jest/globals";
import { beforeEach, describe } from "node:test";
import { UserResource } from "../../src/Resources";

jest.mock("../../src/services/UserService", () => ({
  deleteUser: jest.fn(),
}));

jest.mock("../../src/routes/authenticator", () => ({
  requiresAuthentication: (req: any, res: any, next: any) => {
    req.userId = req.headers.userid || "test-user-id"; // Simulierte User-ID
    req.role = req.headers.role || "admin"; // Standardmäßig Admin
    next();
  },
  optionalAuthentication: (req: any, res: any, next: any) => {
    req.userId = req.headers.userid || null;
    req.role = req.headers.role || "guest";
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/users", userRouter);

describe("DELETE /users/:id", () => {
  const validUserId = "123";
  const adminUserId = "admin123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("soll User erfolgreich löschen (als Admin)", async () => {
    (deleteUser as jest.MockedFunction<typeof deleteUser>).mockResolvedValue({} as UserResource);

    const response = await request(app)
      .delete(`/users/${validUserId}`)
      .set("userId", adminUserId)
      .set("role", "admin");

    expect(response.status).toBe(204);
    expect(deleteUser).toHaveBeenCalledWith(validUserId);
  });

  test("soll User erfolgreich löschen (als User selbst)", async () => {
    (deleteUser as jest.MockedFunction<typeof deleteUser>).mockResolvedValue({} as UserResource);

    const response = await request(app)
      .delete(`/users/${validUserId}`)
      .set("userId", validUserId)
      .set("role", "user");

    expect(response.status).toBe(204);
    expect(deleteUser).toHaveBeenCalledWith(validUserId);
  });

  test("soll Fehler 403 geben, wenn nicht Admin oder User selbst", async () => {
    const response = await request(app)
      .delete(`/users/${validUserId}`)
      .set("userId", "456") // Andere User-ID
      .set("role", "user");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Nur Admins oder der User selbst dürfen User löschen");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  test("soll Fehler 404 geben, wenn User nicht existiert", async () => {
    (deleteUser as jest.MockedFunction<typeof deleteUser>).mockResolvedValue(null as any);

    const response = await request(app)
      .delete(`/users/${validUserId}`)
      .set("userId", validUserId)
      .set("role", "user");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User nicht gefunden oder bereits gelöscht");
  });

  test("soll Fehler 500 geben, wenn ein Serverfehler auftritt", async () => {
    (deleteUser as jest.MockedFunction<typeof deleteUser>).mockRejectedValue(new Error("Interner Serverfehler"));

    const response = await request(app)
      .delete(`/users/${validUserId}`)
      .set("userId", validUserId)
      .set("role", "user");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Fehler beim Löschen eines Users");
  });
});
