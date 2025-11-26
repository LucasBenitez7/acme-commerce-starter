import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Definimos las páginas para que NextAuth sepa dónde redirigir
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register", // Opcional
  },
  // Estrategia JWT (vital para que funcione Credentials)
  session: { strategy: "jwt" },

  callbacks: {
    // 🛡️ AQUÍ ESTÁ LA MAGIA DEL MIDDLEWARE
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Rutas que queremos proteger
      const isOnAccount = nextUrl.pathname.startsWith("/account");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // Lógica de protección
      if (isOnAccount || isOnAdmin) {
        if (isLoggedIn) return true; // Si está logueado, pasa
        return false; // Si no, redirige automáticamente al login
      }

      // Si está logueado y va al login/register, podríamos redirigirlo al home
      // pero eso ya lo hicimos en los componentes, así que lo dejamos pasar.
      return true;
    },

    // Movemos aquí los callbacks de sesión para tenerlos centralizados
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Se define vacío aquí para satisfacer los tipos
} satisfies NextAuthConfig;
