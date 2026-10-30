import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { loginSchema } from "@/schemas/auth.schema";
import { getClientIp } from "@/lib/ip";

// Pre-computed dummy hash with cost 12 to equalize comparison timing on non-existent users
const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Extract client IP using trusted helper
        let clientIp = "127.0.0.1";
        if (request && "headers" in request && request.headers) {
          clientIp = getClientIp(request.headers as unknown as Headers);
        }

        // Throttle failed attempts per email and per IP (5 attempts per 15 mins)
        const emailRateKey = `login:email:${normalizedEmail}`;
        const ipRateKey = `login:ip:${clientIp}`;

        const emailCheck = await rateLimiter.limit(emailRateKey, 5, 15 * 60 * 1000);
        const ipCheck = await rateLimiter.limit(ipRateKey, 5, 15 * 60 * 1000);

        if (!emailCheck.success || !ipCheck.success) {
          throw new Error("Too many failed attempts. Please try again in 15 minutes.");
        }

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          // Constant-time dummy comparison to prevent user enumeration via timing attack
          await bcrypt.compare(password, DUMMY_HASH);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Reset rate limiter on successful authentication
        await rateLimiter.reset(emailRateKey);
        await rateLimiter.reset(ipRateKey);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
