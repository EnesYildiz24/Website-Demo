import { logger } from "../logger";
import { User } from "../model/UserModel";
import { UserResource } from "../Resources";

export async function createUser(
  userResource: UserResource
): Promise<UserResource> {
  const existUser = await User.findOne({ email: userResource.email });
  if (existUser) {
    throw new Error("Email must be unique");
  }
  try {
    const user = await User.create({
      username: userResource.username,
      email: userResource.email,
      password: userResource.password,
      role: userResource.role,
    });
    return {
      id: user?._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };
  } catch {
    logger.error("user konnte nicht erstellt werden");
    throw new Error("Prof created failed");
  }
}

export async function getAlleUser(): Promise<UserResource[]> {
  try {
    const alleUser = await User.find({}).exec();
    const alleUserRes = alleUser.map((user) => ({
      id: user?.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }));
    return alleUserRes;
  } catch (err) {
    throw new Error("User not Found: " + err);
  }
}

export async function updateUser(
  userResource: UserResource
): Promise<UserResource> {
  if (!userResource.id) {
    throw new Error("User id is missing, cant update it");
  }
  try {
    const user = await User.findOneAndUpdate(
      { _id: userResource.id },
      {
        username: userResource.username,
        email: userResource.email,
        password: userResource.password,
        role: userResource.role,
      },
      { new: true }
    );
    if (!user) {
      throw new Error(`cant update the User ${userResource.id}`);
    }
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    throw new Error("update fehlgeschlagen: " + err);
  }
}

export async function deleteUser(userId: string): Promise<UserResource> {
  if (!userId) {
    throw new Error("User id is missing, can't delete it");
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error(`Can't delete the user with id ${userId}`);
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
