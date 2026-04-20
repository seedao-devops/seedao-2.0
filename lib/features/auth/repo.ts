import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getTable, updateTable, type User } from "@/lib/features/_shared/fake-db";
import type { Role } from "@/lib/features/_shared/enums";

export async function findUserByIdentifier(identifier: {
  phone?: string;
  email?: string;
}): Promise<User | undefined> {
  const users = await getTable("users");
  return users.find(
    (u) =>
      (identifier.phone && u.phone === identifier.phone) ||
      (identifier.email && u.email === identifier.email?.toLowerCase()),
  );
}

export async function findUserById(id: string): Promise<User | undefined> {
  const users = await getTable("users");
  return users.find((u) => u.id === id);
}

export async function createUser(args: {
  phone?: string;
  email?: string;
  password: string;
  role?: Role;
}): Promise<User> {
  const passwordHash = await bcrypt.hash(args.password, 10);
  const now = new Date().toISOString();
  let created!: User;
  await updateTable("users", (rows) => {
    if (args.phone && rows.some((u) => u.phone === args.phone)) {
      throw new Error("PHONE_TAKEN");
    }
    if (args.email && rows.some((u) => u.email === args.email!.toLowerCase())) {
      throw new Error("EMAIL_TAKEN");
    }
    created = {
      id: nanoid(12),
      phone: args.phone,
      email: args.email?.toLowerCase(),
      passwordHash,
      role: args.role ?? "user",
      createdAt: now,
    };
    return [...rows, created];
  });
  return created;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateTable("users", (rows) =>
    rows.map((u) => (u.id === userId ? { ...u, passwordHash } : u)),
  );
}
