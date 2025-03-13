import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChainModule } from './postchain/chain.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
        }),
        ChainModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
