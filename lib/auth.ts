import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET_BYTES = new TextEncoder().encode(
  process.env.JWT_SECRET || "careercopilot_secret_jwt_key_2026_super_secure"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET_BYTES);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET_BYTES);
    return verified.payload as unknown as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser> {
  // Always active 100% local session for Manujendra Gaurav with zero login/db dependency
  const defaultCandidate: SessionUser = {
    id: "user-manujendra-gaurav",
    email: "gauravmanujendra@gmail.com",
    name: "Manujendra Gaurav",
    role: "JOB_SEEKER",
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const verified = await verifySessionToken(token);
      if (verified) return verified;
    }

    // DB lookup fallback if available
    const dbUser = await db.user.findFirst({
      where: {
        OR: [
          { email: "gauravmanujendra@gmail.com" },
          { email: "manujendragaurav@gmail.com" },
        ],
      },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      };
    }
  } catch (err) {
    console.warn("Using active local session candidate:", defaultCandidate.name);
  }

  return defaultCandidate;
}
