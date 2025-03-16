import { logger } from "../../src/logger";
import { User } from "../../src/model/UserModel";
import { UserResource } from "../../src/Resources";
import { login } from "../../src/services/AuthenticationService";
import { createUser } from "../../src/services/UserService";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
afterEach(async () => {
  await User.deleteMany({});
});

test("AuthenticationService test", async () => {
  const newUser: UserResource = {
    username: "klinski",
    email: "1234@example.com",
    password: "1111",
    role: "admin", 
  };

  const createdUser = await createUser(newUser);
  const findUser = await User.findById(createdUser.id).exec();
  if (!findUser) {
    throw new Error("User wurde nicht gefunden");
  }
  const result = await login(findUser.email, "1111");
  expect(result).toBeTruthy();
  expect(findUser.password).not.toBe("1111");
  expect(createdUser.password).not.toBe("1111");
  expect(newUser.password).toBe("1111"); 
  expect(result).toEqual({
    id: createdUser.id,
    role: createdUser.role,
    username: createdUser.username,
  });
});

test("AuthenticationService test admin was false", async () => {
  const newUser: UserResource = {
    username: "klinski",
    email: "1234@example.com",
    password: "1111",
    role: "buyer", 
  };

  const createdUser = await createUser(newUser);
  const findUser = await User.findById(createdUser.id).exec();
  if (!findUser) {
    throw new Error("User wurde nicht gefunden");
  }
  const result = await login(findUser.email, "1111");
  expect(result).toBeTruthy();
  expect(result).toEqual({
    id: createdUser.id,
    role: createdUser.role,
    username: createdUser.username,
  });
});

test("hashed password must be false", async () => {
  const newUser: UserResource = {
    username: "klinski",
    email: "1234@example.com",
    password: "1111",
    role: "buyer", 
  };

  const createdUser = await createUser(newUser);
  const findUser = await User.findById(createdUser.id).exec();
  if (!findUser) {
    throw new Error("User wurde nicht gefunden");
  }
  try {
    await login(findUser.email, findUser.password!);
    throw new Error("Gehashtes Passwort sollte nicht akzeptiert werden");
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

test("AuthenticationService test email failed", async () => {
  const newUser: UserResource = {
    username: "klinski",
    email: "1234@example.com",
    password: "1111",
    role: "admin", 
  };
  try {
    await login("falsche@example.com", newUser.password!);
  } catch (err) {
    expect(err).toBeTruthy();
  }
});

test("AuthenticationService test password not found", async () => {
  const newUser: UserResource = {
    username: "klinski",
    email: "1234@example.com",
    password: undefined!,
    role: "admin",
  };
  try {
    await login(newUser.email!, newUser.password!);
  } catch (err) {
    expect(err).toBeTruthy();
  }
});
