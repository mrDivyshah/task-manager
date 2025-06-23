
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

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        // Return a plain object, not a Mongoose document
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          gender: user.gender,
          role: user.role,
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
            await User.create({
              email: user.email,
              name: user.name || user.email.split('@')[0], 
              image: user.image,
            });
          }
          return true; 
        } catch (error) {
          console.error("Error during Google sign-in user check/creation:", error);
          return false;
        }
      }
      return true; 
    },
    async jwt({ token, user, trigger, session }) {
      if (user) { // This block runs on initial sign-in
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.gender = dbUser.gender;
          token.notificationSoundEnabled = dbUser.notificationSoundEnabled;
          token.notificationStyle = dbUser.notificationStyle;
          token.advancedFeaturesEnabled = dbUser.advancedFeaturesEnabled;
          token.role = dbUser.role;
        }
      }
      
      if (trigger === "update" && session?.user) {
        // This block runs when `update({ ... })` is called from the client
        if (session.user.name) token.name = session.user.name;
        if (session.user.image) token.picture = session.user.image;
        if (session.user.gender) token.gender = session.user.gender;
        if (session.user.notificationSoundEnabled !== undefined) token.notificationSoundEnabled = session.user.notificationSoundEnabled;
        if (session.user.notificationStyle) token.notificationStyle = session.user.notificationStyle;
        if (session.user.advancedFeaturesEnabled !== undefined) token.advancedFeaturesEnabled = session.user.advancedFeaturesEnabled;
        if (session.user.role) token.role = session.user.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | undefined;
        session.user.gender = token.gender;
        session.user.notificationSoundEnabled = token.notificationSoundEnabled;
        session.user.notificationStyle = token.notificationStyle as 'dock' | 'float' | undefined;
        session.user.advancedFeaturesEnabled = token.advancedFeaturesEnabled;

        session.user.role = token.role as string;
>>>>>>> master
      }
      return session;
    },
  },
  pages: {
    signIn: '/', 
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
