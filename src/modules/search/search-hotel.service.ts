import { Injectable } from "@nestjs/common";
import { SearchCacheService } from "./search-cache.service";
import { SearchHotelCriteriaDto } from "./dto/search-hotel-criteria.dto";
import { HotelItemFormat, HotelOffersCriteria, SearchHotelResponse, HotelsByCityCriteria, HotelsByGeoCriteria } from "./interfaces/search-hotel.interface";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class SearchHotelService {
  constructor(private readonly searchCacheService: SearchCacheService, private readonly httpService: HttpService) { }

  private formatHotelItem(data: any): HotelItemFormat {
    const bestOffer = data.offers.reduce((prev, current) => {
      return prev.price.total < current.price.total ? prev : current;
    });

    return {
      id: data.hotelId,
      name: data.name,
      chainCode: data.chainCode,
      cityCode: data.cityCode,
      // rating: data.rating,
      // numberOfReviews: data.numberOfReviews,
      location: { latitude: data.latitude, longitude: data.longitude },
      // image: data.image || null,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      // images: data.images || [],
      available: data.available,
      room: {
        type: bestOffer.room.type,
        category: bestOffer.room.category,
        beds: bestOffer.room.beds,
        bedType: bestOffer.room.bedType,
        price: {
          currency: bestOffer.price.currency,
          base: bestOffer.price.base,
          total: bestOffer.price.total
        },
      }
    };
  }


  async hotelsByGeo(criteria: HotelsByGeoCriteria) {
    const byGeoApiUrl = `${process.env.BASE_URL}/hotels/by-geocode`;

    const byGeoResults = await firstValueFrom(this.httpService.get(byGeoApiUrl, { params: criteria }));
    console.log('byGeoResults', byGeoResults);
    const hotelsIds = byGeoResults.data.data.hotels.map((result: any) => result.hotelId);

    return hotelsIds;
  }

  async hotelsByCity(criteria: HotelsByCityCriteria) {
    const byCityApiUrl = `${process.env.BASE_URL}/hotels/by-city`;

    const byCityResults = await firstValueFrom(this.httpService.get(byCityApiUrl, { params: { cityCode: criteria } }));
    const hotelsIds = byCityResults.data.data.hotels.map((result: any) => result.hotelId);

    return hotelsIds;
  }

  async getMultiHotellOffers(criteria: HotelOffersCriteria, customerId: string) {
    const hotelOffersApiUrl = `${process.env.BASE_URL}/hotels/offers`;
    const hotelOffersResults = await this.searchCacheService.searchWithCache(
      'search-hotels-offers',
      criteria,
      customerId,
      hotelOffersApiUrl,
    );

    const formattedResults = hotelOffersResults.data.hotels.map((result: any) =>
      this.formatHotelItem(result),
    );

    return { data: formattedResults };
  }


  async searchHotels(
    criteria: SearchHotelCriteriaDto,
    customerId: string,
  ): Promise<SearchHotelResponse> {

    const { hotelIds, cityCode, checkInDate, checkOutDate, adults, children, roomQuantity, radius, radiusUnit, priceRange, currency, bestRateOnly, latitude, longitude } = criteria
    const hotellOffersCriteria: HotelOffersCriteria = {
      hotelIds: hotelIds!,
      checkInDate,
      checkOutDate,
      adults,
      children,
      roomQuantity,
      priceRange,
      currency,
      bestRateOnly,
    };

    let allHotelsIds: string[] = [];
    if (hotelIds) {
      allHotelsIds.push(...hotelIds);
    }
    if (cityCode) {
      const hotelsIds = await this.hotelsByCity({ cityCode, radius, radiusUnit });
      allHotelsIds.push(...hotelsIds);
    }
    if (latitude && longitude) {
      const hotelsIds = await this.hotelsByGeo({ latitude, longitude, radius, radiusUnit });
      allHotelsIds.push(...hotelsIds);
    }
    return this.getMultiHotellOffers({ ...hotellOffersCriteria, hotelIds: [...new Set(allHotelsIds)]?.join(',') }, customerId);
  }
}
