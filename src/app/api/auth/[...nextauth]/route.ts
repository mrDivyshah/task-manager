
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        // IMPORTANT: This is mocked authentication.
        // In a real application, you would validate credentials against a database.
        // Ensure you hash passwords and compare hashed values.
        if (credentials.email === "user@example.com" && credentials.password === "password123") {
          return { id: "creds-user-1", name: "Test User", email: "user@example.com", image: null };
        }
        
        // If credentials are not valid, return null.
        // next-auth will then set result.error on the client to "CredentialsSignin" or similar.
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    // You can specify custom pages here if needed, e.g., signIn: '/auth/signin'
    // For now, we are handling login UI directly on the main page.
  },
  // You can add callbacks here if you need to customize the session or JWT
  // callbacks: {
  //   async jwt({ token, account, user }) { // user is only passed on first sign-in with CredentialsProvider
  //     // Persist the OAuth access_token or user id to the token right after signin
  //     if (account) { // For OAuth providers
  //       token.accessToken = account.access_token
  //       token.id = account.providerAccountId 
  //     }
  //     if (user) { // For Credentials provider, user is available on first login
  //        token.id = user.id // Add user id to token
  //     }
  //     return token
  //   },
  //   async session({ session, token }) {
  //     // Send properties to the client, like an access_token or user id from a provider.
  //     session.accessToken = token.accessToken as string | undefined;
  //     if (token.id) {
  //       (session.user as any).id = token.id; // Cast to any if id is not on default User type
  //     }
  //     return session
  //   }
  // }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
