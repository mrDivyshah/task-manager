
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      gender?: string;
      notificationSoundEnabled?: boolean;
      notificationStyle?: 'dock' | 'float';
      advancedFeaturesEnabled?: boolean;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    gender?: string;
    notificationSoundEnabled?: boolean;
    notificationStyle?: 'dock' | 'float';
    advancedFeaturesEnabled?: boolean;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    gender?: string;
    notificationSoundEnabled?: boolean;
    notificationStyle?: 'dock' | 'float';
    advancedFeaturesEnabled?: boolean;
    role?: string;
  }
}
