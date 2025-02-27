import { verifyPasswordAndCreateJWT, verifyJWT } from "../../src/services/JWTService";
import { login } from "../../src/services/AuthenticationService";
import { JsonWebTokenError, sign } from "jsonwebtoken";

jest.mock("../../src/services/AuthenticationService");

describe("JWTService", () => {
  const mockLogin = login as jest.Mock;

  beforeEach(() => {
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_TTL = "3600";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create JWT for valid user", async () => {
    mockLogin.mockResolvedValue({ id: "123", role: "admin" });

    const jwt = await verifyPasswordAndCreateJWT("test@example.com", "password");

    expect(jwt).toBeDefined();
  });

  test("should throw error for invalid JWT_SECRET", async () => {
    process.env.JWT_SECRET = "";

    await expect(verifyPasswordAndCreateJWT("test@example.com", "password")).rejects.toThrow(
      "JWT_SECRET oder JWT_TTL nicht gegeben"
    );
  });

  test("should verify valid JWT", () => {
    const jwt = sign({ sub: "123", role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    const result = verifyJWT(jwt);

    expect(result).toEqual({ id: "123", role: "a", exp: expect.any(Number) });
  });

  test("should throw error for invalid JWT", () => {
    expect(() => verifyJWT("invalid_jwt")).toThrow(JsonWebTokenError);
  });
});