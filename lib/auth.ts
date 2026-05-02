import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleConfigured = Boolean(googleClientId && googleClientSecret);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
    Credentials({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email !== "demo@arbitask.app" ||
          credentials?.password !== "demo1234"
        ) return null;

        const user = await db.user.upsert({
          where: { email: "demo@arbitask.app" },
          update: {},
          create: {
            email: "demo@arbitask.app",
            name: "Demo User",
            emailVerified: new Date(),
          },
        });
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
