import { logger } from "../logger";
import { Admin } from "../model/AdminModel";
import { AdminResource } from "../Resources";

export async function createAdmin(
  adminResource: AdminResource
): Promise<AdminResource> {
  try {
    const admin = await Admin.create({
      username: adminResource.username,
      email: adminResource.email,
      password: adminResource.password,
      role: "admin",
      permissions: adminResource.permissions,
    });
    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: "admin",
      permissions: admin.permissions,
    };
  } catch (err) {
    logger.error("Admin konnte nicht erstellt werden: " + err);
    throw new Error("Admin creation failed: " + err);
  }
}

export async function getAllAdmins(): Promise<AdminResource[]> {
  try {
    const admins = await Admin.find({}).exec();
    const adminResources = admins.map((admin) => ({
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: "admin" as "admin",
      permissions: admin.permissions,
    }));
    return adminResources; 
  } catch (err) {
    throw new Error("Error fetching admins: " + err);
  }
}

export async function updateAdmin(
  adminResource: AdminResource
): Promise<AdminResource> {
  if (!adminResource.id) {
    throw new Error("Admin id is missing, can't update it");
  }
  try {
    const admin = await Admin.findOneAndUpdate(
      { _id: adminResource.id },
      {
        username: adminResource.username,
        email: adminResource.email,
        ...(adminResource.password && { password: adminResource.password }),
        permissions: adminResource.permissions,
      },
      { new: true }
    );
    if (!admin) {
      throw new Error(`Cannot update admin with id ${adminResource.id}`);
    }
    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: "admin",
      permissions: admin.permissions,
    };
  } catch (err) {
    logger.error("Update Admin fehlgeschlagen: " + err);
    throw new Error("Update Admin failed: " + err);
  }
}

export async function deleteAdmin(adminId: string): Promise<AdminResource> {
  if (!adminId) {
    throw new Error("Admin id is missing, can't delete it");
  }
  try {
    const admin = await Admin.findByIdAndDelete(adminId);
    if (!admin) {
      throw new Error(`Cannot delete admin with id ${adminId}`);
    }
    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: "admin",
      permissions: admin.permissions,
    };
  } catch (err) {
    logger.error("Delete Admin fehlgeschlagen: " + err);
    throw new Error("Delete Admin failed: " + err);
  }
}
