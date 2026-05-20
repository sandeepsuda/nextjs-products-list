import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "session";
const SLIDING_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const ABSOLUTE_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const readRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const jwtSecret = readRequiredEnv("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

const AUTH_USERNAME = readRequiredEnv("AUTH_USERNAME").trim();
const AUTH_PASSWORD_HASH = readRequiredEnv("AUTH_PASSWORD_HASH").trim();

interface SessionPayload extends JWTPayload {
  username: string;
  absoluteExp: number;
}

const verifyPassword = (plainPassword: string, storedHash: string): boolean => {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  let expectedBuffer: Buffer;
  try {
    expectedBuffer = Buffer.from(expectedHash, "hex");
  } catch {
    return false;
  }

  if (expectedBuffer.length === 0) {
    return false;
  }

  let actualBuffer: Buffer;
  try {
    actualBuffer = scryptSync(plainPassword, salt, expectedBuffer.length);
  } catch {
    return false;
  }

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
};

export function authenticateCredentials(username: string, password: string): boolean {
  if (!username || !password) {
    return false;
  }

  if (username.trim() !== AUTH_USERNAME) {
    return false;
  }

  return verifyPassword(password, AUTH_PASSWORD_HASH);
}

export async function encrypt(payload: SessionPayload, expiresAtSeconds: number) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAtSeconds)
    .sign(JWT_SECRET);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, JWT_SECRET, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}

export async function createSession(username: string): Promise<void> {
  const nowMs = Date.now();
  const absoluteExp = Math.floor((nowMs + ABSOLUTE_SESSION_TTL_MS) / 1000);
  const slidingExp = Math.floor((nowMs + SLIDING_SESSION_TTL_MS) / 1000);
  const expiresAt = new Date(slidingExp * 1000);
  const token = await encrypt({ username, absoluteExp }, slidingExp);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });
}

export async function verifySession(): Promise<{ username: string; exp?: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await decrypt(token);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      typeof payload.username === "string" &&
      typeof payload.absoluteExp === "number" &&
      payload.absoluteExp > nowSeconds
    ) {
      return {
        username: payload.username,
        exp: payload.exp,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) return;

  try {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const parsed = await decrypt(session);

    if (typeof parsed.absoluteExp !== "number" || parsed.absoluteExp <= nowSeconds) {
      return;
    }

    const slidingExp = Math.floor((Date.now() + SLIDING_SESSION_TTL_MS) / 1000);
    const nextExpiry = Math.min(slidingExp, parsed.absoluteExp);
    const expires = new Date(nextExpiry * 1000);
    const res = NextResponse.next();
    res.cookies.set({
      name: SESSION_COOKIE,
      value: await encrypt(parsed, nextExpiry),
      httpOnly: true,
      expires: expires,
      sameSite: "strict",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    // Session is invalid or expired, don't refresh
    return;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
