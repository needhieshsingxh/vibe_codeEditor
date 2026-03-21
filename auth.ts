import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !account) return false;
      if (!user.email) return false;

      try {
        await db.$runCommandRaw({
          delete: "Account",
          deletes: [
            {
              q: {
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

      // PrismaAdapter handles user and account persistence for OAuth providers.
      return true;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await db.user.findUnique({
        where: { id: token.sub },
      });
      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.sub && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
