import { Injectable } from "@nestjs/common";
import { RedisService } from "src/common/redis/redis.service";
import { HttpService } from "@nestjs/axios";
import { SearchHotelResponse } from "./interface/search-hotel-response.interface";

@Injectable()
export class SearchHotelService {
    constructor(private readonly redisService: RedisService, private readonly httpService: HttpService) { }

    private searchHotelResponseFormat(data: any): SearchHotelResponse {
        return data;
    }
}
