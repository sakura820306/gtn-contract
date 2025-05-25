import { ConsoleLogger, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
    FailoverStrategy,
    Operation,
    QueryObject,
    SignatureProvider,
    TransactionReceipt,
    createClient,
    newSignatureProvider,
} from 'postchain-client';
import { chainRes } from './app.interface';

@Injectable()
export class AppService {
    constructor() {}
    private readonly logger = new Logger(AppService.name);

    async restClient() {
        const nodeUrl: string[] = process.env.BLOCLCHAIN_API_URL.split(',');
        const rid: string = process.env.BLOCKCHAIN_RID;
        const client = await createClient({
            nodeUrlPool: nodeUrl,
            // directoryNodeUrlPool: nodeUrl, // 要有目錄鏈
            blockchainRid: rid,
            // blockchainIid: 0,
            failOverConfig: {
                strategy: FailoverStrategy.TryNextOnError,
                attemptsPerEndpoint: 3,
                attemptInterval: 1000,
                unreachableDuration: 180000,
            },
            useStickyNode: false,
            merkleHashVersion: 0,
        });
        this.logger.debug(`client: ${JSON.stringify(client)}`);
        return client;
    }

    async chainOperation(payload: Operation): Promise<chainRes> {
        const client = await this.restClient();
        const signatureProvider: SignatureProvider = newSignatureProvider(0, {
            privKey: process.env.SIGNER_PRIVKEY,
        });
        const currentDate = new Date();
        const receipt: TransactionReceipt = await client
            .signAndSendUniqueTransaction(payload, signatureProvider)
            .on('sent', (receipt: TransactionReceipt) => {
                this.logger.log(`sent tx: ${JSON.stringify(receipt)}`);
            })
            .catch((err: any) => {
                this.logger.log(`res: ${JSON.stringify(err)}`);
                if (err.shortReason) {
                    let errObj = {
                        status: 'reject',
                        massage: err.shortReason,
                    };
                    switch (err.shortReason) {
                        case '案件不存在':
                            throw new HttpException(
                                errObj,
                                HttpStatus.NOT_FOUND,
                            );
                        default:
                            throw new HttpException(
                                errObj,
                                HttpStatus.BAD_REQUEST,
                            );
                    }
                } else {
                    const statusCodeMatch: string =
                        err.message.match(/Code: (\d+)/);
                    let statusCode: number;

                    statusCodeMatch && statusCodeMatch[1].length > 1
                        ? (statusCode = parseInt(statusCodeMatch[1]))
                        : this.logger.error(`not massage Code: ${err.message}`);

                    const messageMatch =
                        err.message.match(/'text':\s*(.*?)(?=})/);
                    const message = messageMatch[1];
                    throw new HttpException(
                        { status: 'reject', massage: message },
                        statusCode,
                    );
                }
            });

        this.logger.log(`res: ${JSON.stringify(receipt)}`);
        return {
            status: receipt.status,
            txId: receipt.transactionRid.toString('hex'),
            timestamp: currentDate.getTime(),
        };
    }

    async handleError(err: any): Promise<never> {
        const errorMessage = err.message.match(/Contract\[([^\]]+)\]/);
        if (errorMessage) {
            const contractErrorContent = errorMessage[1];
            this.logger.error(
                `Contract error content: ${contractErrorContent}`,
            );
            throw new HttpException(contractErrorContent, HttpStatus.NOT_FOUND);
        } else {
            this.logger.error(`Unknown error occurred: ${err.message}`);
            throw new HttpException(
                err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async initBlockchainIssuer(): Promise<chainRes> {
        console.log('Service: initBlockchainIssuer');
        const payload: Operation = {
            name: 'init',
            args: [],
        };

        return await this.chainOperation(payload);
    }

    async getIssuer(): Promise<any> {
        const queryBody: QueryObject<string> = {
            name: 'getIssuer',
            args: undefined,
        };
        const resAry: {
            _id: string;
            name: string;
            point: number;
        }[] = [];

        const client: any = await this.restClient();
        const result: {
            _id: string;
            name: string;
            point: number;
        } = await client.query(queryBody);

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async registerUser(userId: string, userName: string): Promise<chainRes> {
        console.log('Service: initBlockchainIssuer');
        const payload: Operation = {
            name: 'registerUser',
            args: [userId, userName],
        };

        return await this.chainOperation(payload);
    }

    async getUser(userId: string): Promise<any> {
        type ReturnType = {
            _id: string;
            name: string;
            point: number;
            createdAt: number;
            updatedAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getUser',
            args: { userId: userId },
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async getUserList(): Promise<any> {
        type ReturnType = {
            _id: string;
            name: string;
            point: number;
            createdAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getUserList',
            args: undefined,
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async getPoint(userId: string): Promise<chainRes> {
        console.log('Service: getPoint');
        const payload: Operation = {
            name: 'get_point',
            args: [userId],
        };

        return await this.chainOperation(payload);
    }

    async createChannel(
        channelId: string,
        channelName: string,
    ): Promise<chainRes> {
        console.log('Service: createChannel');
        const payload: Operation = {
            name: 'createChannel',
            args: [channelId, channelName],
        };

        return await this.chainOperation(payload);
    }

    async getChannel(channelId: string): Promise<any> {
        type ReturnType = {
            _id: string;
            name: string;
            isOpen: boolean;
            point: number;
            guessCount: number;
            createdAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getChannel',
            args: { channelId: channelId },
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async getChannelList(): Promise<any> {
        type ReturnType = {
            _id: string;
            name: string;
            isOpen: boolean;
            point: number;
            guessCount: number;
            createdAt: number;
            updatedAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getChannelList',
            args: undefined,
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async guessNumber(
        channelId: string,
        userId: string,
        guessNumber: number,
    ): Promise<chainRes> {
        console.log('Service: createChannel');
        const payload: Operation = {
            name: 'guessNumber',
            args: [channelId, userId, guessNumber],
        };

        return await this.chainOperation(payload);
    }

    async getHistory(userId: string): Promise<any> {
        type ReturnType = {
            channel: string;
            userId: string;
            from: string;
            to: string;
            guessNumber: number;
            payPoint: number;
            memo: string;
            createdAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getHistory',
            args: { userId: userId },
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async getChannelHistory(channelId: string): Promise<any> {
        type ReturnType = {
            channel: string;
            userId: string;
            from: string;
            to: string;
            guessNumber: number;
            payPoint: number;
            memo: string;
            createdAt: number;
        };

        const client: any = await this.restClient();
        const queryBody: QueryObject<ReturnType> = {
            name: 'getChannelHistory',
            args: { channelId: channelId },
        };

        const result: any = await client
            .query(queryBody)
            .then((result) => {
                this.logger.log(`query result: ${JSON.stringify(result)}`);
                return result;
            })
            .catch((err) => this.handleError(err));

        this.logger.debug(`result: ${result}`);
        return result;
    }

    getHello(): string {
        return 'Hello World!';
    }
}
