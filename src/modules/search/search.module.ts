import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchFlightService } from "./search-flight.service";
import { GuestIdMiddleware } from "../../middleware/guest-id.middleware";
import { HttpModule } from "@nestjs/axios";
import { SearchBaseService } from "./search-base.service";
import { SearchHotelService } from "./search-hotel.service";

@Module({
    imports: [HttpModule],
    controllers: [SearchController],
    providers: [SearchBaseService, SearchFlightService, SearchHotelService],
    exports: [],
})

export class SearchModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply guest id middleware to search routes
        consumer.apply(GuestIdMiddleware).forRoutes(SearchController);
    }
}