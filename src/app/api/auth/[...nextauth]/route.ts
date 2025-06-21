
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;

        if (!email || !password) {
          return null;
        }

        // IMPORTANT: This is mocked authentication.
        // In a real application, you would validate credentials against a database.
        if (
          (email === "user@example.com" && password === "password123") ||
          (email === "newuser@example.com" && password === "newpassword123")
        ) {
          const name = email === "user@example.com" ? "Test User" : "New User";
          const id = email === "user@example.com" ? "creds-user-1" : "creds-user-2";
          return { id, name, email: email, image: null };
        }
        
        // If credentials are not valid, return null.
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    // signIn: '/auth/signin', // Default is fine
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
