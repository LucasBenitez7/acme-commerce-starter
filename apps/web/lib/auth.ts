import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GitHub,
    // Más proveedores en el futuro (Google, Credentials, etc.)
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        // Exponemos el id de usuario en la sesión
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role ?? "user";
      }
      return session;
    },
  },
});
