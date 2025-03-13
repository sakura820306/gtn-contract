import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';

@Module({
  imports: [],
  providers: [ChainService],
  exports: [ChainService],
})
export class ChainModule { }
