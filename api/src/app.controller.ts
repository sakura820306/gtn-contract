import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { chainRes } from './app.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiTags('初始化')
    @Post('blockchain/issuer/init')
    @ApiResponse({ status: 201, type: chainRes })
    async tproofVerifySignature() {
        return await this.appService.initBlockchainIssuer();
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
