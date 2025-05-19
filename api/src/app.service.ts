import { ConsoleLogger, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FailoverStrategy, Operation, SignatureProvider, TransactionReceipt, createClient, newSignatureProvider } from 'postchain-client';
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
        const signatureProvider: SignatureProvider = newSignatureProvider(0, { privKey: process.env.SIGNER_PRIVKEY });
        const currentDate = new Date();
        const receipt: TransactionReceipt = await client.signAndSendUniqueTransaction(
            payload,
            signatureProvider
        ).on("sent", (receipt: TransactionReceipt) => {
            this.logger.log(`sent tx: ${JSON.stringify(receipt)}`);
        }).catch((err: any) => {
            this.logger.log(`res: ${JSON.stringify(err)}`);
            if (err.shortReason) {
                let errObj = {
                    status: 'reject',
                    massage: err.shortReason
                };
                switch (err.shortReason) {
                    case '案件不存在':
                        throw new HttpException(errObj, HttpStatus.NOT_FOUND);
                    default:
                        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
                };
            } else {
                const statusCodeMatch: string = err.message.match(/Code: (\d+)/);
                let statusCode: number;

                statusCodeMatch && statusCodeMatch[1].length > 1 ? statusCode = parseInt(statusCodeMatch[1]) : this.logger.error(`not massage Code: ${err.message}`);

                const messageMatch = err.message.match(/'text':\s*(.*?)(?=})/);
                const message = messageMatch[1];
                throw new HttpException({ status: 'reject', massage: message }, statusCode);
            };
        });

        this.logger.log(`res: ${JSON.stringify(receipt)}`);
        return {
            status: receipt.status,
            txId: receipt.transactionRid.toString('hex'),
            timestamp: currentDate.getTime(),
        };
    }

    async initBlockchainIssuer(): Promise<chainRes> {
        const client = await this.restClient();
        const payload: Operation = {
            name: 'init',
            args: [],
        };

        return await this.chainOperation(payload);
    }

    getHello(): string {
        return 'Hello World!';
    }
}
