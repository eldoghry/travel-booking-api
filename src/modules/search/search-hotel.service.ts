import { Injectable } from "@nestjs/common";
import { SearchCacheService } from "./search-cache.service";
import { SearchHotelCriteriaDto } from "./dto/search-hotel-criteria.dto";
import { HotelItemFormat, SearchHotelResponse } from "./interfaces/search-hotel-response.interface";

@Injectable()
export class SearchHotelService {
  constructor(private readonly searchCacheService: SearchCacheService) {}

  private formatHotelItem(data: any): HotelItemFormat {
    return {
      id: data.id,
      name: data.name,
      city: data.city,
      rating: data.rating,
      numberOfReviews: data.numberOfReviews,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
      address: data.address,
      image: data.image,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      images: data.images,
      available: data.available,
      availableRooms: data.availableRooms,
      room: {
        id: data.room.id,
        name: data.room.name,
        type: data.room.type,
        price: {
          currency: data.room.price.currency,
          base: data.room.price.base,
          total: data.room.price.total,
        },
      },
      guests: data.guests,
    };
  }


  async searchHotels(
    criteria: SearchHotelCriteriaDto,
    customerId: string,
  ): Promise<SearchHotelResponse> {
    const apiUrl = `${process.env.BASE_URL}/hotels/search`;
    const results = await this.searchCacheService.searchWithCache(
      'search-hotels',
      criteria,
      customerId,
      apiUrl,
    );

    const formattedResults = results.data.providerResult.data.map((result: any) =>
      this.formatHotelItem(result),
    );

    return { data: formattedResults };
  }
}
