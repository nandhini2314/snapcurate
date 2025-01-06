// Import necessary modules and types from NextAuth and other dependencies
import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import { prisma } from "./db";  // Import Prisma client instance for database interaction
import { PrismaAdapter } from "@next-auth/prisma-adapter";  // Adapter to integrate NextAuth with Prisma
import GoogleProvider from "next-auth/providers/google";  // Google OAuth provider for authentication

// Extend the default Session interface to include `id` and `credits` fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;  // User ID
      credits: number;  // Credits associated with the user
    } & DefaultSession["user"];  // Include other default user fields like name, email, image
  }
}

// Extend the JWT interface to include `id` and `credits` fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string;  // User ID
    credits: number;  // Credits associated with the user
  }
}

// Define authentication options for NextAuth
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",  // Use JSON Web Tokens (JWT) for session management
  },
  callbacks: {
    // JWT callback to customize the JWT token before it is issued
    jwt: async ({ token }) => {
      // Fetch the user from the database based on their email
      const db_user = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });
      // If the user exists in the database, add their ID and credits to the JWT
      if (db_user) {
        token.id = db_user.id;
        token.credits = db_user.credits;
      }
      return token;  // Return the modified token
    },
    // Session callback to customize the session object before it is returned to the client
    session: ({ session, token }) => {
      if (token) {
        // Assign JWT properties to the session user object
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.credits = token.credits;
      }
      return session;  // Return the modified session
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,  // Secret for signing JWT tokens
  adapter: PrismaAdapter(prisma),  // Use Prisma adapter for database interaction
  providers: [
    // Configure Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};

// Utility function to get the current session on the server side
export const getAuthSession = () => {
  return getServerSession(authOptions);
};
