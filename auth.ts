import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"


export const {auth, handlers, signIn, signOut} = NextAuth({});