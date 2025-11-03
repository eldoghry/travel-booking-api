import { Injectable } from "@nestjs/common";
import { SearchBaseService } from "./search-base.service";
import { SearchHotelCriteriaDto, SortByOption } from "./dto/search-hotel-criteria.dto";
import { HotelItemFormat, SearchHotelResponse } from "./interface/search-hotel-response.interface";

@Injectable()
export class SearchHotelService {
  constructor(private readonly searchBaseService: SearchBaseService) {}

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

// private sortHotelItems(items: HotelItemFormat[], sort?: SortByOption) {
// }


  async searchForHotels(
    criteria: SearchHotelCriteriaDto,
    customerId: string,
  ): Promise<SearchHotelResponse> {
    const apiUrl = `${process.env.BASE_URL}/hotels/search`;
    const results = await this.searchBaseService.searchWithCache(
      'search-hotels',
      criteria,
      customerId,
      apiUrl,
    );

    const formattedResults = results.data.providerResult.data.map((result: any) =>
      this.formatHotelItem(result),
    );

    // sorting based on criteria.sort
    // const sortedResults = this.sortHotelItems(formattedResults, criteria.sort as SortByOption);

    return { data: formattedResults };
  }
}
