import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";

const requiredAuthEnv = [
  "AUTH_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "GOOGLE_ID",
  "GOOGLE_SECRET",
] as const;

const missingAuthEnv = requiredAuthEnv.filter(
  (key) => !process.env[key] || process.env[key]?.trim() === "",
);

if (missingAuthEnv.length > 0) {
  console.error(
    `[auth][config] Missing auth env vars: ${missingAuthEnv.join(", ")}`,
  );
}

export default {
  trustHost: true,
  providers: [
    Github({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
} satisfies NextAuthConfig;
