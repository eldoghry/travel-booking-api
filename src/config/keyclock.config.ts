import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  KeycloakConnectOptions,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

const KEYCLOAK_OPTIONS = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): KeycloakConnectOptions => ({
    authServerUrl: config.get<string>('KEYCLOAK_AUTH_URL') as string,
    realm: config.get<string>('KEYCLOAK_REALM') as string,
    clientId: config.get<string>('KEYCLOAK_CLIENT_ID') as string,
    secret: config.get<string>('KEYCLOAK_CLIENT_SECRET') as string,
    tokenValidation: TokenValidation.ONLINE, // Validates tokens on each request.
    // secret: getRSAPublicKey(
    //   config.get<string>('KEYCLOAK_CLIENT_SECRET') as string,
    // ),
    // policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
  }),
};

// function getRSAPublicKey(secret: string) {
//   return `-----BEGIN PUBLIC KEY-----\n${secret}\n-----END PUBLIC KEY-----`;
// }

export default KEYCLOAK_OPTIONS;
