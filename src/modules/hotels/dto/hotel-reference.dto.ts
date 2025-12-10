import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsIataCode } from '../../../validators/is-iataCode.validator';

export class HotelsByHotelsDto {
  @ApiProperty({ type: [String], example: ['ACPAR419', 'MCLONGHM'] })
  @IsArray()
  @IsString({ each: true })
  hotelIds: string[];
}

export class HotelsByCityDto {
  @ApiProperty({ example: 'PAR' })
  @IsNotEmpty()
  @IsIataCode()
  cityCode: string;
}

export class HotelsByGeocodeDto {
  @ApiProperty({ example: 48.85306 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 2.34654 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional({ enum: ['KM', 'MILE'], example: 'KM' })
  @IsOptional()
  @IsEnum(['KM', 'MILE'])
  radiusUnit?: 'KM' | 'MILE';
}

export class HotelGeoCodeDto {
  @ApiProperty({ example: 51.50988 })
  latitude: number;

  @ApiProperty({ example: -0.15509 })
  longitude: number;
}

export class HotelDistanceDto {
  @ApiProperty({ example: 0.92 })
  value: number;

  @ApiProperty({ example: 'KM' })
  unit: string;
}

export class HotelAddressDto {
  @ApiProperty({ example: 'FR' })
  countryCode: string;
}

export class HotelReferenceItemDto {
  @ApiProperty({ example: 'ACPAR419' })
  hotelId: string;

  @ApiProperty({ example: 'AC' })
  chainCode: string;

  @ApiProperty({ example: 'LE NOTRE DAME' })
  name: string;

  @ApiProperty({ example: 'PAR' })
  iataCode?: string;

  @ApiProperty({ type: HotelGeoCodeDto })
  geoCode?: HotelGeoCodeDto;

  @ApiProperty({ type: HotelAddressDto })
  address?: HotelAddressDto;

  @ApiProperty({ type: HotelDistanceDto })
  distance?: HotelDistanceDto;
}

export class HotelsReferenceResponseDto {
  @ApiProperty({ type: [HotelReferenceItemDto] })
  hotels: HotelReferenceItemDto[];
}
