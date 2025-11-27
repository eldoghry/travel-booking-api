import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, IsIn } from 'class-validator';

// -------------------- Payment Card DTOs --------------------
export class HotelPaymentCardInfoDto {
  @ApiProperty({ example: 'VI', description: 'Card vendor code (e.g., VI for Visa)' })
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  vendorCode: string;

  @ApiProperty({ example: '4151289722471370' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: '2026-08', description: 'Expiry in YYYY-MM' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  expiryDate: string;

  @ApiProperty({ example: 'BOB SMITH' })
  @IsString()
  holderName: string;
}

export class HotelPaymentCardDto {
  @ApiProperty({ type: () => HotelPaymentCardInfoDto })
  paymentCardInfo: HotelPaymentCardInfoDto;
}

// -------------------- Payment DTO --------------------
export class HotelPaymentDto {
  @ApiProperty({ example: 'CREDIT_CARD' })
  @IsString()
  @IsIn(['CREDIT_CARD'])
  method: 'CREDIT_CARD';

  @ApiProperty({ type: () => HotelPaymentCardDto })
  paymentCard: HotelPaymentCardDto;
}

// -------------------- Guest DTO --------------------
export class HotelGuestDto {
  @ApiProperty({ example: 'MR' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'BOB' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'SMITH' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+33679278416' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'bob.smith@email.com' })
  @IsEmail()
  email: string;
}

// -------------------- Order DTOs --------------------
export class HotelOrderBookingDto {
  @ApiProperty({ example: 'V0g2VFJaLzIwMjQtMDYtMDc=' })
  @IsString()
  offerId: string;

  @ApiProperty({ type: () => HotelGuestDto })
  guest: HotelGuestDto;

  @ApiProperty({ type: () => HotelPaymentDto })
  payment: HotelPaymentDto;
}

export class HotelOrderPriceTaxDto {
  @ApiProperty({ example: 'VALUE_ADDED_TAX' })
  code: string;

  @ApiProperty({ example: 19.55 })
  amount: number;

  @ApiProperty({ example: false })
  included: boolean;
}

export class HotelOrderPriceDto {
  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiProperty({ example: 195.5 })
  base: number | string;

  @ApiProperty({ type: [HotelOrderPriceTaxDto] })
  taxes?: HotelOrderPriceTaxDto[];

  @ApiProperty({ example: 215.05 })
  total: number | string;
}

export class HotelOrderPoliciesDto {
  @ApiProperty({ example: 'GUARANTEE' })
  paymentType: string;

  @ApiProperty({ example: '2024-06-06T23:59:00+02:00' })
  cancellationDeadline?: string;

  @ApiProperty({ example: 215.05 })
  cancellationAmount?: number | string;
}

export class HotelOrderRoomDto {
  @ApiProperty({ example: 'XMI' })
  type?: string;

  @ApiProperty({ example: 'Marriott Senior Discount, includes' })
  description?: string;
}

export class HotelOrderHotelDto {
  @ApiProperty({ example: 'ARMADAIT' })
  hotelId: string;

  @ApiProperty({ example: 'AR' })
  chainCode: string;

  @ApiProperty({ example: 'AC BY MARRIOTT HOTEL AITANA' })
  name: string;
}

export class HotelOrderBookingItemDto {
  @ApiProperty({ example: 'V0g2VFJaLzIwMjQtMDYtMDc=' })
  orderId: string;

  @ApiProperty({ example: 'CONFIRMED' })
  status: string;

  @ApiProperty({ type: () => HotelOrderHotelDto })
  hotel: HotelOrderHotelDto;

  @ApiProperty({ example: '89922710' })
  confirmationNumber: string;

  @ApiProperty({ example: '2024-06-07' })
  checkInDate: string;

  @ApiProperty({ example: '2024-06-08' })
  checkOutDate: string;

  @ApiProperty({ type: () => HotelOrderPriceDto })
  price: HotelOrderPriceDto;

  @ApiProperty({ type: () => HotelOrderRoomDto })
  room: HotelOrderRoomDto;

  @ApiProperty({ type: () => HotelOrderPoliciesDto })
  policies: HotelOrderPoliciesDto;

  @ApiProperty({
    example: {
      title: 'MR',
      firstName: 'BOB',
      lastName: 'SMITH',
      phone: '+33679278416',
      email: 'bob.smith@email.com',
    },
  })
  guest: any;
}

export class HotelOrderBookingResponseDto {
  @ApiProperty({ type: () => HotelOrderBookingItemDto })
  booking: HotelOrderBookingItemDto;
}
