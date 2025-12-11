export interface AuthenticatedUser {
  id: number;
  keycloakId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}
