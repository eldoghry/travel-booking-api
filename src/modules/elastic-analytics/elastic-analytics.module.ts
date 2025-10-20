import { Module } from "@nestjs/common";
import { ElasticAnalyticsService } from "./elastic-analytics.service";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { getElasticsearchConfig } from "../../config/elasticsearch.config";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        ElasticsearchModule.registerAsync({ // create elasticsearch client
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => getElasticsearchConfig(configService), // get elasticsearch configuration
        }),
    ],
    // controllers: [ElasticAnalyticsController],
    providers: [ElasticAnalyticsService],
    exports: [ElasticAnalyticsService],
})
export class ElasticAnalyticsModule { }