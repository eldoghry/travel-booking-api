interface AuthAuditMetaBase {
  userId: number | null;
  roles: string[] | null;
  ip: string;
  userAgent: string;
}

/**
 * Login Audit Data
 */
interface LoginAuditMeta extends AuthAuditMetaBase {
  loginMethod: "password" | "otp" | "keycloak";
  keycloakId?: string | null;
}

export interface LoginAuditData {
  before?: null;
  after?: {
    loginSuccess?: boolean;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  metadata: LoginAuditMeta;
}

/**
 * Logout Audit Data
 */
interface LogoutAuditMeta extends AuthAuditMetaBase {}

export interface LogoutAuditData {
  before?: null;
  after?: {
    logoutSuccess?: boolean;
  };
  metadata: LogoutAuditMeta;
}


/**
 *  Deactive User Account
 */

interface DeactiveUserFields {
  isActive: boolean;
}

interface DeactivateUserAccountAuditMeta extends AuthAuditMetaBase {
  table:"user",
  performedBy: "system" | "user";
  reason?: string;
  requestId: string;
  user:{
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  }
}

export interface DeactivateUserAccountAuditData {
  before: DeactiveUserFields;
  after: DeactiveUserFields;
  metadata: DeactivateUserAccountAuditMeta;
}


/**
 * User Updated Profile Audit Data
 */

interface UserProfileFields {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  nationality: string;
  address: string;
}


interface UpdateProfileAuditMeta extends AuthAuditMetaBase {
  table: "customer";
  isUserActive: boolean;
  requestId: string;
  user:{
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  }
}

type ProfileKeys = keyof UserProfileFields;

// T is the union of keys that changed, e.g. "phone" | "firstName"
export interface UserUpdatedProfileAuditData<T extends ProfileKeys> {
  before: Partial<Pick<UserProfileFields, T>>;
  after: Pick<UserProfileFields, T>; // required same keys as T
  metadata: UpdateProfileAuditMeta;
}