import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { DEFAULT_LOGIN_REDIRECT } from "./route";

const logAuthPayload = (scope: string, payload: unknown) => {
  if (payload instanceof Error) {
    console.error(`[auth][${scope}] ${payload.message}`, payload.stack);
    return;
  }

  if (Array.isArray(payload)) {
    console.error(`[auth][${scope}]`, ...payload);
    return;
  }

  try {
    console.error(`[auth][${scope}]`, JSON.stringify(payload, null, 2));
  } catch {
    console.error(`[auth][${scope}]`, payload);
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  debug: true,
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account) return false;
      if (!user.email) return false;

      // Clean malformed OAuth account rows left by older failed signup attempts.
      // These rows can violate unique constraints and block first-time account linking.
      try {
        await db.$runCommandRaw({
          delete: "Account",
          deletes: [
            {
              q: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                $or: [
                  { user_id: null },
                  { user_id: { $exists: false } },
                  { user_id: "" },
                  { userId: null },
                  { userId: { $exists: false } },
                  { userId: "" },
                ],
              },
              limit: 0,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to clean malformed accounts", error);
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      // Keep token populated even when DB reads fail during OAuth callback.
      if (trigger === "signIn" && user) {
        token.name = user.name;
        token.email = user.email;
      }

      if (!token.sub) return token;

      try {
        const existingUser = await db.user.findUnique({
          where: { id: token.sub },
        });
        if (!existingUser) return token;

        token.name = existingUser.name;
        token.email = existingUser.email;
        token.role = existingUser.role;
      } catch (error) {
        logAuthPayload("callbacks.jwt.db", {
          message: "Failed to fetch user in jwt callback",
          tokenSub: token.sub,
          trigger,
          error,
        });
      }

      return token;
    },
    async session({ session, token }) {
      try {
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }

        if (session.user) {
          session.user.role = token.role;
        }
      } catch (error) {
        logAuthPayload("callbacks.session", {
          message: "Failed to shape session",
          tokenSub: token.sub,
          error,
        });
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;

      return `${baseUrl}${DEFAULT_LOGIN_REDIRECT}`;
    },
  },
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  logger: {
    error(...args) {
      logAuthPayload("logger.error.raw", args);
    },
    warn(...args) {
      logAuthPayload("logger.warn.raw", args);
    },
    debug(...args) {
      logAuthPayload("logger.debug.raw", args);
    },
  },
  ...authConfig,
});
