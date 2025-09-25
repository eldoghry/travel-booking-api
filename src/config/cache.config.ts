import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis, { KeyvRedisOptions } from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

const redisOptions: KeyvRedisOptions = {
  throwOnConnectError: true,
  throwOnErrors: true,
};

const CACHE_CONFIG: CacheModuleOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],

  useFactory: async (config: ConfigService) => {
    return {
      stores: [
        new Keyv({
          store: new CacheableMemory({ ttl: 3000, lruSize: 5000 }),
        }),
        // cache on redis
        // new KeyvRedis(config.get('REDIS_URL'), redisOptions),
      ],
      ttl: 10000, // 10 sec
    };
  },
};

export default CACHE_CONFIG;
