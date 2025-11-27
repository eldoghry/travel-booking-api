import { Module } from '@nestjs/common';
import { AxiosModule } from '../axios/axios.module';
import { AmadeusAxiosService } from './amadeus-axios.service';

@Module({
  imports: [AxiosModule],
  providers: [AmadeusAxiosService],
  exports: [AmadeusAxiosService],
})
export class AmadeusModule {}
