import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { AmadeusAxiosService } from 'src/common/amadeus/amadeus-axios.service';
import { AmadeusEndpoints } from 'src/common/amadeus/amadeus-request';
import { formatDateToYMD } from 'src/common/utils/helper';
import { HotelProvider } from '../interfaces/hotel-provider.interface';

@Injectable()
export class AmadeusHotelProvider implements HotelProvider {
  private readonly axios: AxiosInstance;
  providerName: string;

  constructor(private readonly amadeusAxiosService: AmadeusAxiosService) {
    this.axios = this.amadeusAxiosService.axiosInstance;
    this.providerName = 'amadeus';
  }

  async getHotelsByHotels(hotelIds: string[]): Promise<any> {
    return this.axios.get(AmadeusEndpoints.HOTEL_REFERENCE_BY_HOTELS, {
      params: { hotelIds: hotelIds.join(',') },
    });
  }

  async getHotelsByCity(cityCode: string): Promise<any> {
    return this.axios.get(AmadeusEndpoints.HOTEL_REFERENCE_BY_CITY, {
      params: { cityCode },
    });
  }

  async getHotelsByGeocode(
    latitude: number,
    longitude: number,
    radius?: number,
    radiusUnit?: string,
  ): Promise<any> {
    return this.axios.get(AmadeusEndpoints.HOTEL_REFERENCE_BY_GEOCODE, {
      params: { latitude, longitude, radius, radiusUnit },
    });
  }

  async listHotelOffers(params: Record<string, any>): Promise<any> {
    // Ensure dates formatted
    if (params.checkInDate instanceof Date)
      params.checkInDate = formatDateToYMD(params.checkInDate);
    if (params.checkOutDate instanceof Date)
      params.checkOutDate = formatDateToYMD(params.checkOutDate);
    try {
      const response = await this.axios.get(AmadeusEndpoints.HOTEL_OFFERS_LIST, { params });
      return response;
    } catch (error) {
      const amadeusError = error?.response?.data?.errors?.[0];

      if (amadeusError?.title === 'NO ROOMS AVAILABLE AT REQUESTED PROPERTY' || amadeusError?.title === 'INVALID PROPERTY CODE') {
        return null
      }
      throw error;
    }
  }

  async getHotelOfferDetails(offerId: string): Promise<any> {
    const url = AmadeusEndpoints.HOTEL_OFFER_DETAILS.replace('{offerId}', offerId);
    return this.axios.get(url);
  }

  async bookHotelOrder(payload: any): Promise<any> {
    const body = {
      data: {
        type: 'hotel-order',
        guests: [
          {
            tid: 1,
            title: payload.guest?.title,
            firstName: payload.guest?.firstName,
            lastName: payload.guest?.lastName,
            phone: payload.guest?.phone,
            email: payload.guest?.email,
          },
        ],
        travelAgent: {
          contact: {
            email: payload.travelAgent?.contact?.email || payload.guest?.email,
          },
        },
        roomAssociations: [
          {
            hotelOfferId: payload.offerId,
            guestReferences: [{ guestReference: '1' }],
          },
        ],
        payment: {
          method: payload.payment?.method || 'CREDIT_CARD',
          paymentCard: {
            paymentCardInfo: {
              vendorCode: payload.payment?.paymentCard?.paymentCardInfo?.vendorCode,
              cardNumber: payload.payment?.paymentCard?.paymentCardInfo?.cardNumber,
              expiryDate: payload.payment?.paymentCard?.paymentCardInfo?.expiryDate,
              holderName: payload.payment?.paymentCard?.paymentCardInfo?.holderName,
            },
          },
        },
      },
    };

    return this.axios.post(AmadeusEndpoints.HOTEL_ORDER_BOOKING, body, { timeout: 100000 });
  }

  // --- Normalization helpers ---
  mapReferenceHotelsToResponse(response: any): { hotels: any[] } {
    const items = response?.data || [];
    const hotels = items.map((h: any) => ({
      hotelId: h.hotelId || h?.hotel?.hotelId,
      chainCode: h.chainCode || h?.hotel?.chainCode,
      name: h.name || h?.hotel?.name,
      iataCode: h.iataCode || h?.hotel?.iataCode || h?.cityCode,
      geoCode:
        h.geoCode ||
        (h?.hotel ? { latitude: h.hotel.latitude, longitude: h.hotel.longitude } : undefined),
      address: h.address ? { countryCode: h.address.countryCode } : undefined,
      distance: h.distance,
    }));
    return { hotels };
  }

  mapOffersListToResponse(response: any): { hotels: any[] } {
    const items = response?.data || [];
    const hotels = items.map((item: any) => {
      const hotel = item.hotel || {};
      const offers = (item?.offers || []).map((o: any) => ({
        offerId: o.id,
        checkInDate: o.checkInDate,
        checkOutDate: o.checkOutDate,
        room: {
          category: o.room?.type || o.room?.category,
          beds: o.room?.typeEstimated?.beds,
          bedType: o.room?.typeEstimated?.bedType,
          description: o.room?.description?.text || o.room?.description,
        },
        price: {
          currency: o.price?.currency,
          base: o.price?.base,
          total: o.price?.total,
          averagePerNight: o.price?.variations?.average?.base,
        },
        policies: {
          paymentType: o.policies?.paymentType,
          cancellation: o.policies?.cancellation?.description || o.policies?.cancellation,
        },
      }));

      return {
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        cityCode: hotel.cityCode,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        offers,
      };
    });
    return { hotels };
  }

  mapOfferDetailsToResponse(response: any): { hotelOffer: any } {
    const d = response?.data || {};
    const hotel = d?.hotel || {};
    const offer = Array.isArray(d.offers) && d.offers.length > 0 ? d.offers[0] : {};

    const hotelOffer = {
      offerId: offer.id,
      available: d.available,
      description: offer.description?.text,
      hotel: {
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        cityCode: hotel.cityCode,
        countryCode: hotel.address?.countryCode,
        amenities: hotel.amenities,
      },
      checkInDate: offer.checkInDate,
      checkOutDate: offer.checkOutDate,
      room: {
        type: offer.room?.type || offer.roomInformation?.type,
        beds: offer.room?.typeEstimated?.beds,
        bedType: offer.room?.typeEstimated?.bedType,
        description:
          offer.room?.description?.text ||
          offer.roomInformation?.description ||
          offer.description?.text,
      },
      price: {
        currency: offer.price?.currency,
        base: offer.price?.base,
        total: offer.price?.total,
        taxes: offer.price?.taxes,
        variations: offer.price?.variations,
      },
      policies: {
        paymentType: offer.policies?.paymentType,
        cancellation: offer.policies?.cancellations,
        refundable: offer.policies?.refundable,
      },
    };

    return { hotelOffer };
  }

  mapBookingToResponse(response: any): { booking: any } {
    const root = response?.data || {};
    const d = root?.data || root;
    const bookingItem = Array.isArray(d?.hotelBookings) ? d.hotelBookings[0] : {};
    const offer = bookingItem?.hotelOffer || {};
    const hotel = bookingItem?.hotel || {};
    const providerInfo = Array.isArray(bookingItem?.hotelProviderInformation)
      ? bookingItem.hotelProviderInformation[0]
      : undefined;

    const guest = Array.isArray(d?.guests) && d.guests.length > 0 ? d.guests[0] : undefined;

    const booking = {
      orderId: d?.id,
      status: bookingItem?.bookingStatus || 'CONFIRMED',
      hotel: {
        hotelId: hotel?.hotelId,
        chainCode: hotel?.chainCode,
        name: hotel?.name,
      },
      confirmationNumber: providerInfo?.confirmationNumber,
      checkInDate: offer?.checkInDate,
      checkOutDate: offer?.checkOutDate,
      price: {
        currency: offer?.price?.currency,
        base: offer?.price?.base,
        taxes: offer?.price?.taxes,
        total: offer?.price?.total || offer?.price?.sellingTotal,
      },
      room: {
        type: offer?.room?.type,
        description: offer?.room?.description?.text || offer?.description?.text,
      },
      policies: {
        paymentType: offer?.policies?.paymentType,
        cancellationDeadline: offer?.policies?.cancellations?.[0]?.deadline,
        cancellationAmount: offer?.policies?.cancellations?.[0]?.amount,
      },
      guest: guest
        ? {
          title: guest?.title,
          firstName: guest?.firstName,
          lastName: guest?.lastName,
          phone: guest?.phone,
          email: guest?.email,
        }
        : undefined,
    };
    return { booking };
  }
}
