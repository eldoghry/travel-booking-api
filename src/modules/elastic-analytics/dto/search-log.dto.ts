import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class SearchLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  query: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsNumber()
  @Min(0)
  durationMs: number;

  @IsBoolean()
  success: boolean;

  @IsEnum(['amadeus', 'cache'])
  source: 'amadeus' | 'cache';
}
