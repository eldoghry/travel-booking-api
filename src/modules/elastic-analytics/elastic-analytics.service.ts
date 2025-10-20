import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchLogDto } from './dto/search-log.dto';

@Injectable()
export class ElasticAnalyticsService implements OnModuleInit {
    private readonly logger = new Logger(ElasticAnalyticsService.name);
    private readonly indexName = 'analytics-search-logs';

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    // Runs automatically when the module initializes
    async onModuleInit() {
        await this.ensureIndex();
    }

    // Ensure that the index exists with the correct mapping
    private async ensureIndex() {
        try {
            const exists = await this.elasticsearchService.indices.exists({
                index: this.indexName,
            });

            if (!exists) {
                this.logger.log(`Creating Elasticsearch index: ${this.indexName}`);

                await this.elasticsearchService.indices.create({
                    index: this.indexName,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                    },
                    mappings: {
                        properties: {
                            '@timestamp': { type: 'date' },
                            'event.type': { type: 'keyword' },
                            'service.name': { type: 'keyword' },
                            'user.id': { type: 'keyword' },
                            'search.query': { type: 'text' },
                            'search.filters': { type: 'object', enabled: false },
                            'search.duration_ms': { type: 'float' },
                            'search.success': { type: 'boolean' },
                            'search.source': { type: 'keyword' },
                            'message': { type: 'text' },
                        },
                    },

                });

                this.logger.log(`Index "${this.indexName}" created successfully.`);
            } else {
                this.logger.log(`Index "${this.indexName}" already exists.`);
            }
        } catch (err) {
            this.logger.error('Failed to ensure Elasticsearch index', err.message);
            this.logger.error(`Stack trace: ${err.stack}`);
            console.log(`logger error:`,JSON.stringify(err,null,2));

        }
    }

    // Log search analytics event
    async logSearch(data: SearchLogDto) {
        try {
            await this.elasticsearchService.index({
                index: this.indexName,
                document: {
                    '@timestamp': new Date(),
                    event: { type: 'user_search' },
                    service: { name: 'search-service' },
                    user: { id: data.userId ?? 'guest' },
                    search: {
                        query: data.query,
                        filters: data.filters,
                        duration_ms: data.durationMs,
                        success: data.success,
                        source: data.source,
                    },
                    message: `User ${data.userId ?? 'guest'} searched for ${data.query}`,
                },
            });
        } catch (err) {
            this.logger.error('Failed to index search log', err.message);
            this.logger.error(`Stack trace: ${err.stack}`);
        }
    }
}
