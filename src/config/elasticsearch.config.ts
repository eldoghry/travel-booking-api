import { ConfigService } from '@nestjs/config';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const getElasticsearchConfig = (
  configService: ConfigService,
): ElasticsearchModuleOptions => ({
  node: configService.get<string>('ELASTICSEARCH_NODE') || 'https://localhost:9200',
  // auth: {
  //   username: configService.get<string>('ELASTICSEARCH_USERNAME') || 'elastic',
  //   password: configService.get<string>('ELASTICSEARCH_PASSWORD') || 'elastic',
  // },
  maxRetries: 10,
  requestTimeout: 60000, // 60 sec
  tls: {
    rejectUnauthorized: configService.get<boolean>('ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED') || false, // important for dev certificate
  }
});

