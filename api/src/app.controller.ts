import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import {
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    chainRes,
    createChannel,
    getChannel,
    getChannelList,
    getChannelRes,
    getHistoryRes,
    getPoint,
    getUserRes,
    guessNumber,
    issuerRes,
    register,
} from './app.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiTags('發行商')
    @Post('issuer/init')
    @ApiOperation({ summary: '初始化' })
    @ApiResponse({ status: 201, type: chainRes })
    async tproofVerifySignature() {
        return await this.appService.initBlockchainIssuer();
    }

    @ApiTags('發行商')
    @ApiOperation({ summary: '詳細資訊' })
    @Get('issuer/details')
    @ApiResponse({
        status: 200,
        description: '交易已成功上鏈',
        type: issuerRes,
    })
    async getIssuer(): Promise<any> {
        return await this.appService.getIssuer();
    }

    @ApiTags('玩家')
    @Post('user')
    @ApiOperation({ summary: '建立' })
    @ApiBody({ type: register })
    @ApiResponse({ status: 201, type: chainRes })
    async registerUser(@Body() body: register): Promise<chainRes> {
        return await this.appService.registerUser(body.userId, body.userName);
    }

    @ApiTags('玩家')
    @ApiOperation({ summary: '詳細資訊' })
    @Get('user/details')
    @ApiQuery({
        name: 'userId',
        required: true,
        type: String,
        example: '80835488-FF2C-4B03-B63C-A0FDB321DB4F',
    })
    @ApiResponse({
        status: 200,
        description: '交易已成功上鏈',
        type: getUserRes,
    })
    async getUser(@Query() data): Promise<getUserRes> {
        const { userId } = data;
        return await this.appService.getUser(userId);
    }

    @ApiTags('玩家')
    @ApiOperation({ summary: '列表' })
    @Get('user/list')
    @ApiResponse({
        status: 200,
        type: [getUserRes],
    })
    async getUserList(): Promise<getUserRes> {
        return await this.appService.getUserList();
    }

    @ApiTags('點數')
    @Post('point')
    @ApiOperation({ summary: '取得 Point' })
    @ApiBody({ type: getPoint })
    @ApiResponse({ status: 201, type: chainRes })
    async getPoint(@Body() body: getPoint): Promise<chainRes> {
        return await this.appService.getPoint(body.userId);
    }

    @ApiTags('遊戲頻道')
    @Post('channel')
    @ApiOperation({ summary: '建立頻道' })
    @ApiBody({ type: createChannel })
    @ApiResponse({ status: 201, type: chainRes })
    async createChannel(@Body() body: createChannel): Promise<chainRes> {
        let { channelId, channelName } = body;
        return await this.appService.createChannel(channelId, channelName);
    }

    @ApiTags('遊戲頻道')
    @ApiOperation({ summary: '詳細資訊' })
    @Get('channel')
    @ApiResponse({
        status: 200,
        type: getChannelRes,
    })
    async getChannel(@Query() data: getChannel): Promise<getChannelRes> {
        return await this.appService.getChannel(data.channelId);
    }

    @ApiTags('遊戲頻道')
    @ApiOperation({ summary: '列表' })
    @Get('channels')
    @ApiResponse({
        status: 200,
        type: [getChannelRes],
    })
    async getChannelList(): Promise<[getChannelRes]> {
        return await this.appService.getChannelList();
    }

    @ApiTags('遊戲頻道')
    @Post('channel/guess')
    @ApiOperation({ summary: '猜數字' })
    @ApiBody({ type: guessNumber })
    @ApiResponse({ status: 201, type: chainRes })
    async guessNumber(@Body() body: guessNumber): Promise<chainRes> {
        let { channelId, userId, guessNumber } = body;
        return await this.appService.guessNumber(
            channelId,
            userId,
            guessNumber,
        );
    }

    @ApiTags('歷程')
    @ApiOperation({ summary: '使用者歷程' })
    @Get('history/user')
    @ApiQuery({
        name: 'userId',
        required: true,
        type: String,
        example: '使用者 ID',
    })
    @ApiResponse({
        status: 200,
        type: [getHistoryRes],
    })
    async getHistory(
        @Query() data: { userId: string },
    ): Promise<[getHistoryRes]> {
        return await this.appService.getHistory(data.userId);
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
