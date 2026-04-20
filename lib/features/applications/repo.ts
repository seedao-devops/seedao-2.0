import { nanoid } from "nanoid";
import {
  getTable,
  updateTable,
  type Application,
} from "@/lib/features/_shared/fake-db";
import type { ApplicationFormInput } from "./schema";

export async function createApplication(
  userId: string,
  input: ApplicationFormInput,
): Promise<Application> {
  let created!: Application;
  await updateTable("applications", (rows) => {
    if (
      rows.some(
        (a) => a.nickname.toLowerCase() === input.nickname.toLowerCase(),
      )
    ) {
      throw new Error("NICKNAME_TAKEN");
    }
    if (rows.some((a) => a.userId === userId)) {
      throw new Error("ALREADY_APPLIED");
    }
    created = {
      id: nanoid(12),
      userId,
      nickname: input.nickname,
      selfIntro: input.selfIntro,
      interestTags: input.interestTags,
      portfolio: input.portfolio,
      paymentStatus: "UNPAID",
      reviewStatus: "PENDING",
      submittedAt: new Date().toISOString(),
    };
    return [...rows, created];
  });
  return created;
}

export async function getApplicationByUser(
  userId: string,
): Promise<Application | undefined> {
  const rows = await getTable("applications");
  return rows.find((a) => a.userId === userId);
}

export async function getAllApplications(): Promise<Application[]> {
  const rows = await getTable("applications");
  return rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getApplicationById(
  id: string,
): Promise<Application | undefined> {
  const rows = await getTable("applications");
  return rows.find((a) => a.id === id);
}

export async function patchApplication(
  id: string,
  patch: Partial<Application>,
): Promise<Application | undefined> {
  let updated: Application | undefined;
  await updateTable("applications", (rows) =>
    rows.map((a) => {
      if (a.id !== id) return a;
      updated = { ...a, ...patch };
      return updated;
    }),
  );
  return updated;
}
