import { RadiusUnitOption } from "../enums/search-hotel.enum";

export interface HotelItemFormat {    
    id: string;
    name: string;
    cityCode: string;
    chainCode: string;
    rating?: number;
    numberOfReviews?: number;
    location: {
        latitude: number;
        longitude: number;
    };
    image?: string;
    checkInDate: string;
    checkOutDate: string;
    images?: string[];
    available: boolean;
    availableRooms?: number;
    room:{
        type: string;
        category: string;
        bedType: string;
        beds?: number;
        price: {
            currency: string;
            base: string;
            total: string;
        };
    },
    guests?: {
        adults: number;
        children: number;
    },
}

export interface SearchHotelResponse {
    data: HotelItemFormat[];
}
 

export interface HotelsByGeoCriteria {
    latitude: number;
    longitude: number;
    radius?: number;
    radiusUnit?: RadiusUnitOption;
}

export interface HotelsByCityCriteria {
    cityCode: string;
    radius?: number;
    radiusUnit?: RadiusUnitOption;
}

export interface HotelOffersCriteria {
    hotelIds: string | string[];
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children?: number;
    roomQuantity?: number;
    priceRange?: string;
    currency?: string;
    bestRateOnly?: boolean;
}
