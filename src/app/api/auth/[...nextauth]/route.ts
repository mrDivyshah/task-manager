
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"
import bcrypt from "bcryptjs"

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          // User might exist from Google sign-in but has no password set
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        // Return user object for NextAuth session
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        await dbConnect();
        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            // This is a new user from Google, create them in the database
            await User.create({
              email: user.email,
              name: user.name || user.email.split('@')[0], // Fallback for name
              image: user.image,
            });
          }
          return true; // Continue sign in
        } catch (error) {
          console.error("Error during Google sign-in user creation:", error);
          return false; // Prevent sign in on DB error
        }
      }
      return true; // For credentials provider, the authorize function handles it
    },
    async jwt({ token, user }) {
      // The `user` object is only passed on the first sign-in.
      // We need to find the user in the database to get their MongoDB _id.
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    // signIn: '/auth/signin', // Default is fine
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
