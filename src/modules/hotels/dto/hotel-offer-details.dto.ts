import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class HotelOfferDetailsDto {
  @ApiProperty({ example: 'TSXOJ6LFQ2' })
  @IsString()
  offerId: string;
}

export class HotelOfferDetailsHotelDto {
  @ApiProperty({ example: 'MCLONGHM' })
  hotelId: string;

  @ApiProperty({ example: 'JW MARRIOTT GROSVENOR HOUSE' })
  name: string;

  @ApiProperty({ example: 'MC' })
  chainCode: string;

  @ApiProperty({ example: 'LON' })
  cityCode: string;

  @ApiProperty({ example: 'GB' })
  countryCode: string;

  @ApiProperty({ example: ['CRIBS_AVAILABLE'] })
  amenities?: string[];
}

export class HotelOfferDetailsRoomDto {
  @ApiProperty({ example: 'ELE' })
  type?: string;

  @ApiProperty({ example: 1 })
  beds?: number;

  @ApiProperty({ example: 'DOUBLE' })
  bedType?: string;

  @ApiProperty({ example: 'Prepay Non-refundable Non-changeable, prepay in full' })
  description?: string;
}

export class HotelOfferDetailsPriceDto {
  @ApiProperty({ example: 'GBP' })
  currency: string;

  @ApiProperty({ example: 716 })
  base: number | string;

  @ApiProperty({ example: 716 })
  total: number | string;
}

export class HotelOfferDetailsPoliciesDto {
  @ApiProperty({ example: 'deposit' })
  paymentType?: string;

  @ApiProperty({ example: 'NON-REFUNDABLE RATE' })
  cancellation?: string;
}

export class HotelOfferDetailsItemDto {
  @ApiProperty({ example: 'TSXOJ6LFQ2' })
  offerId: string;

  @ApiProperty({ type: HotelOfferDetailsHotelDto })
  hotel: HotelOfferDetailsHotelDto;

  @ApiProperty({ example: '2023-11-22' })
  checkInDate: string;

  @ApiProperty({ example: '2023-11-23' })
  checkOutDate: string;

  @ApiProperty({ type: HotelOfferDetailsRoomDto })
  room: HotelOfferDetailsRoomDto;

  @ApiProperty({ type: HotelOfferDetailsPriceDto })
  price: HotelOfferDetailsPriceDto;

  @ApiProperty({ type: HotelOfferDetailsPoliciesDto })
  policies?: HotelOfferDetailsPoliciesDto;

  @ApiProperty({ example: 'Executive King Room, ... Non-changeable rate.' })
  description?: string;
}

export class HotelOfferDetailsResponseDto {
  @ApiProperty({ type: HotelOfferDetailsItemDto })
  hotelOffer: HotelOfferDetailsItemDto;
}
