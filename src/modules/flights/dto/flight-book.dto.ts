import {
  IsString,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlightDetailsDto } from './flight-details.dto';
import { ApiProperty } from '@nestjs/swagger';
import type { FlightBookingSummary } from '../interfaces/flight-booking-summary.interface';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum DeviceTypeEnum {
  MOBILE = 'MOBILE',
  LANDLINE = 'LANDLINE',
}

export enum DocumentTypeEnum {
  PASSPORT = 'PASSPORT',
  ID_CARD = 'ID_CARD',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
}
export class NameDto {
  @ApiProperty({ example: 'JORGE' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'GONZALES' })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class PhoneDto {
  @ApiProperty({ enum: DeviceTypeEnum, example: DeviceTypeEnum.MOBILE })
  @IsEnum(DeviceTypeEnum)
  deviceType: DeviceTypeEnum;

  @ApiProperty({ example: '34' })
  @IsString()
  @IsNotEmpty()
  countryCallingCode: string;

  @ApiProperty({ example: '480080076' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

export class ContactDto {
  @ApiProperty({ example: 'jorge.gonzales833@telefonica.es' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ type: [PhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones: PhoneDto[];
}

export class DocumentDto {
  @ApiProperty({ enum: DocumentTypeEnum, example: DocumentTypeEnum.PASSPORT })
  @IsEnum(DocumentTypeEnum)
  documentType: DocumentTypeEnum;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  birthPlace: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  issuanceLocation: string;

  @ApiProperty({ example: '2015-04-14' })
  @IsDateString()
  issuanceDate: string;

  @ApiProperty({ example: '00000000' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: '2025-04-14' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  @IsNotEmpty()
  issuanceCountry: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  @IsNotEmpty()
  validityCountry: string;

  @ApiProperty({ example: 'ES' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  holder: boolean;
}

export class PassengerDto {
  @ApiProperty({ example: '1982-01-16' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ type: NameDto })
  @ValidateNested()
  @Type(() => NameDto)
  name: NameDto;

  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE })
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({ type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({ type: [DocumentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}

export class FlightBookingDto extends FlightDetailsDto {
  @ApiProperty()
  @IsString()
  offerPriceId: string;

  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  travelers: PassengerDto[];
}

export class FlightBookingResponseDto {
  @ApiProperty()
  flightBookingSummary: FlightBookingSummary;

  @ApiProperty()
  providerResult: any;
}
