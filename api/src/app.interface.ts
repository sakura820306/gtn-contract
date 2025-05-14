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