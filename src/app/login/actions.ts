"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authenticateCredentials, createSession, destroySession } from "@/lib/auth";

interface LoginState {
  error: string | null;
}

interface LoginAttemptState {
  count: number;
  windowStartMs: number;
  blockedUntilMs: number;
}

const attemptStore = new Map<string, LoginAttemptState>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

const getClientIp = async (): Promise<string> => {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip") || "unknown";
};

const getAttemptKey = (username: string, ip: string): string =>
  `${username.trim().toLowerCase()}::${ip}`;

const isInputInvalid = (username: string, password: string): boolean =>
  !username || !password || username.length > 256 || password.length > 256;

const registerFailedAttempt = (key: string, nowMs: number): LoginAttemptState => {
  const current = attemptStore.get(key);

  if (!current || nowMs - current.windowStartMs > ATTEMPT_WINDOW_MS) {
    const nextState: LoginAttemptState = {
      count: 1,
      windowStartMs: nowMs,
      blockedUntilMs: 0,
    };
    attemptStore.set(key, nextState);
    return nextState;
  }

  const nextCount = current.count + 1;
  const blockedUntilMs =
    nextCount >= MAX_ATTEMPTS ? nowMs + LOCKOUT_MS : current.blockedUntilMs;

  const nextState: LoginAttemptState = {
    count: nextCount,
    windowStartMs: current.windowStartMs,
    blockedUntilMs,
  };

  attemptStore.set(key, nextState);
  return nextState;
};

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const clientIp = await getClientIp();
  const nowMs = Date.now();
  const key = getAttemptKey(username, clientIp);
  const currentAttemptState = attemptStore.get(key);

  if (currentAttemptState && currentAttemptState.blockedUntilMs > nowMs) {
    return {
      error: "Too many login attempts. Please try again later.",
    };
  }

  if (isInputInvalid(username, password)) {
    registerFailedAttempt(key, nowMs);
    return {
      error: "Invalid username or password.",
    };
  }

  if (authenticateCredentials(username, password)) {
    attemptStore.delete(key);
    await createSession(username.trim());
    redirect("/");
  }

  registerFailedAttempt(key, nowMs);

  return {
    error: "Invalid username or password.",
  };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
