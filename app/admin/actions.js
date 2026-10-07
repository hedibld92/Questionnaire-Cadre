"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { deleteResponse } from "@/lib/store";

export async function login(formData) {
  if (!checkPassword(formData.get("password"))) {
    // Petite pause pour freiner les tentatives en série.
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin/login?erreur=1");
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function removeResponse(formData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = formData.get("id");
  if (typeof id === "string" && id) await deleteResponse(id);
  revalidatePath("/admin");
}
