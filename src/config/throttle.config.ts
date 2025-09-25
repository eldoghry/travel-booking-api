import { ThrottlerModuleOptions } from '@nestjs/throttler';

const THROTTLE_CONFIG: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000,
      limit: 10,
    },
  ],
};

export default THROTTLE_CONFIG;
