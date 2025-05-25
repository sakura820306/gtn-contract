import { ApiProperty } from '@nestjs/swagger';

const currentTime = new Date().getTime();

export class chainRes {
    @ApiProperty({
        example: 201,
        type: String,
        description: '狀態碼',
        required: true,
    })
    status: string;

    @ApiProperty({
        example: '',
        type: String,
        description: '交易 ID',
        required: true,
    })
    txId: string;

    @ApiProperty({
        example: currentTime,
        type: String,
        description: '時間戳',
        required: true,
    })
    timestamp: number;
}

export class issuerRes {
    @ApiProperty({
        example: '發行商 ID',
        type: String,
        description: '發行商 ID',
        required: true,
    })
    id: string;

    @ApiProperty({
        example: '發行商名稱',
        type: String,
        description: '發行商名稱',
        required: true,
    })
    name: string;

    @ApiProperty({
        example: 100,
        type: Number,
        description: '點數',
        required: true,
    })
    point: number;
}

export class register {
    // userId: string, userName: string
    @ApiProperty({
        example: '使用者 ID',
        type: String,
        description: '使用者 ID',
        required: true,
    })
    userId: string;

    @ApiProperty({
        example: '使用者名稱',
        type: String,
        description: '使用者名稱',
        required: true,
    })
    userName: string;
}

export class getUserRes {
    @ApiProperty({
        example: '使用者 ID',
        type: String,
        description: '使用者 ID',
        required: true,
    })
    id: string;

    @ApiProperty({
        example: '使用者名稱',
        type: String,
        description: '使用者名稱',
        required: true,
    })
    name: string;

    @ApiProperty({
        example: 100,
        type: Number,
        description: '點數',
        required: true,
    })
    point: number;

    @ApiProperty({
        example: currentTime,
        type: Number,
        description: '創建時間',
        required: true,
    })
    createdAt: number;

    @ApiProperty({
        example: currentTime,
        type: Number,
        description: '更新時間',
        required: true,
    })
    updatedAt: number;
}

export class getPoint {
    // userId: string, userName: string
    @ApiProperty({
        example: '使用者 ID',
        type: String,
        description: '使用者 ID',
        required: true,
    })
    userId: string;
}

export class createChannel {
    // channelId: text, channelName: text
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    channelId: string;

    @ApiProperty({
        example: '頻道名稱',
        type: String,
        description: '頻道名稱',
        required: true,
    })
    channelName: string;
}

export class getChannel {
    // channelId: text
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    channelId: string;
}

export class getChannelList {
    // channelId: text
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    channelId: string;

    // chanelName
    @ApiProperty({
        example: '頻道名稱',
        type: String,
        description: '頻道名稱',
        required: false,
    })
    channelName: string;
}

export class getChannelRes {
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    id: string;

    @ApiProperty({
        example: '頻道名稱',
        type: String,
        description: '頻道名稱',
        required: true,
    })
    name: string;

    @ApiProperty({
        example: true,
        type: Boolean,
        description: '是否開放',
        required: true,
    })
    isOpen: boolean;

    @ApiProperty({
        example: 100,
        type: Number,
        description: '點數',
        required: true,
    })
    point: number;

    @ApiProperty({
        example: 100,
        type: Number,
        description: '猜測次數',
        required: true,
    })
    guessCount: number;

    @ApiProperty({
        example: currentTime,
        type: Number,
        description: '創建時間',
        required: true,
    })
    createdAt: number;
}

export class guessNumber {
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    channelId: string;

    @ApiProperty({
        example: 42,
        type: Number,
        description: '猜測的數字',
        required: true,
    })
    guessNumber: number;

    @ApiProperty({
        example: '使用者 ID',
        type: String,
        description: '使用者 ID',
        required: true,
    })
    userId: string;
}

export class getHistoryRes {
    @ApiProperty({
        example: '頻道 ID',
        type: String,
        description: '頻道 ID',
        required: true,
    })
    channelId: string;

    @ApiProperty({
        example: '使用者 ID',
        type: String,
        description: '使用者 ID',
        required: true,
    })
    userId: string;

    @ApiProperty({
        example: 100,
        type: Number,
        description: '從多少點數開始',
        required: true,
    })
    from: number;

    @ApiProperty({
        example: 50,
        type: Number,
        description: '到多少點數結束',
        required: true,
    })
    to: number;

    @ApiProperty({
        example: 42,
        type: Number,
        description: '猜測的數字',
        required: true,
    })
    guessNumber: number;

    @ApiProperty({
        example: 50,
        type: Number,
        description: '支付的點數',
        required: true,
    })
    payPoint: number;

    @ApiProperty({
        example: '備註',
        type: String,
        description: '備註',
        required: false,
    })
    memo: string;

    @ApiProperty({
        example: currentTime,
        type: Number,
        description: '創建時間',
        required: true,
    })
    createdAt: number;

    @ApiProperty({
        example: currentTime,
        type: Number,
        description: '更新時間',
        required: true,
    })
    updatedAt: number;
}