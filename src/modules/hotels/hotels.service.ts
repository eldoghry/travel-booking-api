import { BadRequestException, Injectable } from '@nestjs/common';
import { HotelProviderManager } from './providers/hotel-provider.manager';
import {
  HotelsByHotelsDto,
  HotelsByCityDto,
  HotelsByGeocodeDto,
  HotelsReferenceResponseDto,
} from './dto/hotel-reference.dto';
import { HotelOffersSearchDto, HotelOffersListResponseDto } from './dto/hotel-offers.dto';
import { HotelOfferDetailsDto, HotelOfferDetailsResponseDto } from './dto/hotel-offer-details.dto';
import { HotelOrderBookingDto, HotelOrderBookingResponseDto } from './dto/hotel-order-book.dto';

@Injectable()
export class HotelsService {
  constructor(private readonly hotelProviderManager: HotelProviderManager) {}

  async getHotelsByHotels(dto: HotelsByHotelsDto): Promise<HotelsReferenceResponseDto> {
    const provider = await this.hotelProviderManager.getProvider();
    const providerResult = await provider.getHotelsByHotels(dto.hotelIds);
    return provider.mapReferenceHotelsToResponse(providerResult);
  }

  async getHotelsByCity(dto: HotelsByCityDto): Promise<HotelsReferenceResponseDto> {
    const provider = await this.hotelProviderManager.getProvider();
    const providerResult = await provider.getHotelsByCity(dto.cityCode);
    return provider.mapReferenceHotelsToResponse(providerResult);
  }

  async getHotelsByGeocode(dto: HotelsByGeocodeDto): Promise<HotelsReferenceResponseDto> {
    const provider = await this.hotelProviderManager.getProvider();
    const providerResult = await provider.getHotelsByGeocode(
      dto.latitude,
      dto.longitude,
      dto.radius,
      dto.radiusUnit,
    );
    return provider.mapReferenceHotelsToResponse(providerResult);
  }

  async listHotelOffers(dto: HotelOffersSearchDto): Promise<HotelOffersListResponseDto> {
    // Validate that at least one search criteria is provided
    const hasHotelIds = Array.isArray(dto.hotelIds) && dto.hotelIds.length > 0;
    const hasCoordinates = typeof dto.latitude === 'number' && typeof dto.longitude === 'number';

    if (!hasHotelIds) {
      throw new BadRequestException('Provide at least one hotel ID');
    }

    const provider = await this.hotelProviderManager.getProvider();

    const params: Record<string, any> = {
      // Dates are strings in format YYYY-MM-DD already from DTO
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,

      // Numbers and simple scalar filters
      adults: dto.adults ?? 1,
      currency: dto.currency,
      countryOfResidence: dto.countryOfResidence,
      roomQuantity: dto.roomQuantity ?? 1,
      priceRange: dto.priceRange,
      paymentPolicy: dto.paymentPolicy ?? 'NONE',
      boardType: dto.boardType,
      includeClosed: dto.includeClosed,
      bestRateOnly: dto.bestRateOnly ?? true,
      lang: dto.lang,
    };

    if (hasHotelIds) {
      // Provider expects comma-separated list
      params.hotelIds = dto.hotelIds.join(',');
    }

    if (hasCoordinates) {
      params.latitude = dto.latitude;
      params.longitude = dto.longitude;
    }

    const providerResult = await provider.listHotelOffers(params);
    return provider.mapOffersListToResponse(providerResult);
  }

  async getHotelOfferDetails(dto: HotelOfferDetailsDto): Promise<HotelOfferDetailsResponseDto> {
    const provider = await this.hotelProviderManager.getProvider();
    const providerResult = await provider.getHotelOfferDetails(dto.offerId);
    return provider.mapOfferDetailsToResponse(providerResult);
  }

  async bookHotel(dto: HotelOrderBookingDto): Promise<HotelOrderBookingResponseDto> {
    const provider = await this.hotelProviderManager.getProvider();
    const providerResult = await provider.bookHotelOrder({
      offerId: dto.offerId,
      guest: dto.guest,
      payment: dto.payment,
    });
    return provider.mapBookingToResponse(providerResult);
  }
}
