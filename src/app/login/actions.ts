"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, VALID_CREDENTIALS } from "@/lib/auth";

interface LoginState {
  error: string | null;
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (
    username === VALID_CREDENTIALS.username &&
    password === VALID_CREDENTIALS.password
  ) {
    await createSession(username);
    redirect("/");
  }

  return {
    error: "Invalid username or password. Try admin / password",
  };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
