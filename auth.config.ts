import Github from "next-auth/providers/github";

import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  providers: [
    Github({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    {
      id: "google",
      name: "Google",
      type: "oauth",
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          scope: "openid profile email",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
      profile(profile) {
        return {
          id: (profile as { sub?: string; id?: string }).sub ??
            (profile as { sub?: string; id?: string }).id ??
            "",
          name: (profile as { name?: string }).name ?? null,
          email: (profile as { email?: string }).email ?? null,
          image: (profile as { picture?: string; image?: string }).picture ??
            (profile as { picture?: string; image?: string }).image ??
            null,
        };
      },
    },
  ],
} satisfies NextAuthConfig;
