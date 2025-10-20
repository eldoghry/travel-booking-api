import { Controller } from "@nestjs/common";
import { ElasticAnalyticsService } from "./elastic-analytics.service";

@Controller('analytics')
export class ElasticAnalyticsController { 
    constructor(private readonly analyticsService: ElasticAnalyticsService) { }
}