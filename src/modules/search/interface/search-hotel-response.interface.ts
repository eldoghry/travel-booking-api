export interface HotelItemFormat {    
    id: string;
    name: string;
    city: string;
    rating: number;
    numberOfReviews: number;
    location: {
        latitude: number;
        longitude: number;
    };
    address: string;
    image: string;
    checkInDate: string;
    checkOutDate: string;
    images: string[];
    available: boolean;
    availableRooms: number;
    room:{
        id: string;
        name: string;
        type: string;
        price: {
            currency: string;
            base: string;
            total: string;
        };
    },
    guests: {
        adults: number;
        children: number;
    },
}

export interface SearchHotelResponse {
    data: HotelItemFormat[];
}
 