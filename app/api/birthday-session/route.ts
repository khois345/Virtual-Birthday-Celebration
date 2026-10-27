import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "birthday-app";
const COLLECTION_NAME = "birthday_sessions";
const DEFAULT_REGARD = "Wish you a wonderful birthday!";
const MAX_SESSIONS_PER_DAY = 5;
const SESSION_EXPIRY_DAYS = 7;
const SESSION_ID_LENGTH = 8;
const SESSION_ID_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_SESSION_ID_ATTEMPTS = 5;

function generateSessionId(): string {
  let id = "";
  for (let i = 0; i < SESSION_ID_LENGTH; i++) {
    id += SESSION_ID_ALPHABET[randomInt(SESSION_ID_ALPHABET.length)];
  }
  return id;
}

// Short IDs keep share links compact; retry on the rare collision
async function generateUniqueSessionId(db: any): Promise<string> {
  for (let attempt = 0; attempt < MAX_SESSION_ID_ATTEMPTS; attempt++) {
    const sessionId = generateSessionId();
    const existing = await db
      .collection(COLLECTION_NAME)
      .findOne({ sessionId }, { projection: { _id: 1 } });

    if (!existing) {
      return sessionId;
    }
  }

  throw new Error("Failed to generate a unique session ID");
}

function getExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
  return expiresAt;
}

function getDeviceId(request: Request): string {
  // Get client IP address from headers (works with proxies/load balancers)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Get user agent
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Create identifier from IP + User-Agent
  return `${ip}:${userAgent}`;
}

async function checkDailySessionLimit(
  db: any,
  deviceId: string
): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const sessionCount = await db
    .collection(COLLECTION_NAME)
    .countDocuments({
      deviceId,
      createdAt: { $gte: oneDayAgo },
    });

  return sessionCount < MAX_SESSIONS_PER_DAY;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const user = await db.collection(COLLECTION_NAME).findOne({ sessionId });

  if (!user || user.expiresAt <= new Date()) {
    if (user) {
      await db.collection(COLLECTION_NAME).deleteOne({ sessionId });
    }

    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      name: user.name,
      age: user.age,
      regard: user.regard,
      sessionId: user.sessionId,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name || "").trim();
  const age = Number(body.age);
  const regard = String(body.regard || DEFAULT_REGARD).trim();

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    return NextResponse.json(
      { error: "Age must be between 1 and 120" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  let deviceId = cookieStore.get("birthday_device_id")?.value;

  // Fallback: generate deviceId from request headers if no cookie exists
  if (!deviceId) {
    deviceId = getDeviceId(request);
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Check if device has exceeded daily session limit
  const canCreateSession = await checkDailySessionLimit(
    db,
    deviceId
  );

  if (!canCreateSession) {
    return NextResponse.json(
      {
        error:
          "Daily session limit (5 per day) reached. Try again tomorrow.",
      },
      { status: 429 }
    );
  }

  // Always generate a new sessionId
  const sessionId = await generateUniqueSessionId(db);
  const expiresAt = getExpiryDate();

  await db.collection(COLLECTION_NAME).insertOne({
    sessionId,
    deviceId,
    name,
    age,
    regard,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const response = NextResponse.json({
    user: {
      name,
      age,
      regard,
      sessionId,
    },
  });

  // Set/refresh cookie with 1 year expiry
  response.cookies.set("birthday_device_id", deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });

  return response;
}