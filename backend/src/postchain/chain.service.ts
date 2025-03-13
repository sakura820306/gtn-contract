import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FailoverStrategy, Operation, QueryObject, SignatureProvider, createClient, newSignatureProvider, gtv, gtx, Transaction, StatusObject, ResponseStatus, TransactionReceipt, UnexpectedStatusError, TxRejectedError } from 'postchain-client';
import { amountsDetail, chainRes } from 'src/app.interface';

@Injectable()
export class ChainService {
    constructor() { }

    private readonly logger = new Logger(ChainService.name);

    async restClient() {
        const nodeUrl: string[] = process.env.BLOCLCHAIN_API_URL.split(',');
        const client = await createClient({
            nodeUrlPool: nodeUrl,
            // directoryNodeUrlPool: nodeUrl, // 要有目錄鏈
            blockchainRid: process.env.BLOCKCHAIN_RID,
            blockchainIid: 0,
            statusPollInterval: 300,
            statusPollCount: 10,
            failOverConfig: {
                strategy: FailoverStrategy.TryNextOnError,
                attemptsPerEndpoint: 3,
                attemptInterval: 1000,
                unreachableDuration: 180000,
            }
        });
        this.logger.debug(`client: ${JSON.stringify(client)}`);
        return client;
    };

    async chainOperation(payload: Operation): Promise<chainRes> {
        const client = await this.restClient();
        const signatureProvider: SignatureProvider = newSignatureProvider({ privKey: process.env.SIGNER_PRIVKEY });
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
                    case '案件已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '案件已結束，請確認是否有其他已在續約中的案件':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '資料已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '事件已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '案件已解約':
                        throw new HttpException(errObj, 423);
                    case '案件不存在':
                        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
                    case '案件已解約':
                        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
                    case 'token 不存在':
                        throw new HttpException(errObj, HttpStatus.UNAUTHORIZED);
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
            timestamp: currentDate.getTime()
        };
    };

    async chainOperations(payload: Operation[]): Promise<chainRes> {
        const client = await this.restClient();
        const signatureProvider: SignatureProvider = newSignatureProvider({ privKey: process.env.SIGNER_PRIVKEY });
        const currentDate = new Date();
        const receipt: TransactionReceipt = await client.signAndSendUniqueTransaction(
            {
                operations: payload,
                signers: [signatureProvider.pubKey]
            },
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
                    case '案件已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '案件已結束，請確認是否有其他已在續約中的案件':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '資料已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '事件已存在':
                        throw new HttpException(errObj, HttpStatus.CONFLICT);
                    case '案件已解約':
                        throw new HttpException(errObj, 423);
                    case '案件不存在':
                        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
                    case '案件已解約':
                        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
                    case 'token 不存在':
                        throw new HttpException(errObj, HttpStatus.UNAUTHORIZED);
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
            timestamp: currentDate.getTime()
        };
    };

    async healthQueryObject(): Promise<string> {
        const queryBody: QueryObject<string> = {
            name: "health",
            args: undefined
        };
        
        const client = await this.restClient();
        const result = await client.query(queryBody);

        this.logger.debug(`result: ${result}`);
        return result;
    }

    async auth(email: string, pincode: string) {
        let data = JSON.stringify({
            "email": email,
            "pincode": pincode,
            "privKey": process.env.SIGNER_PRIVKEY,
            "pubKey": process.env.SIGNER_PUBKEY
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.BLOCKCHAIN_MANAGER_API_URL + 'auth',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };

        const res = await axios.request(config)
        .then((response) => {
            console.log('response: ', JSON.stringify(response.data));
            return {
                status: response.data.status,
                txId: response.data.txId,
                token: response.data.token,
                timestamp: response.data.timestamp
            };
        })
        .catch((error) => {
            console.log('error ', error.response.data.massage);
            throw new HttpException({
                    code: error.status,
                    status: error.response.data.status,
                    message: error.response.data.massage
                }, HttpStatus.NOT_FOUND);
        })
        return res;
    }


    async createCaseOperation(
        token: string,
        address: string,
        landNo: string,
        buildingNo: string,
        floor: number,
        room: number,
        caseId: string,
        companyId: string,
        rentStartDate: string,
        rentEndDate: string,
        payRentTime: number,
        collectionTime: number,
        isTerminationRent: boolean,
        otherContent: string,
        contentExchange: string,
        createdAt: number,
    ): Promise<chainRes> {
        this.logger.debug(`Call createCaseOperation input param:\n token: ${typeof token} ${token}\n address: ${typeof address} ${address}\n landNo: ${typeof landNo} ${landNo}\n buildingNo: ${typeof buildingNo} ${buildingNo}\n floor: ${typeof floor} ${floor}\n room: ${typeof room} ${room}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n rentStartDate: ${typeof rentStartDate} ${rentStartDate}\n rentEndDate: ${typeof rentEndDate} ${rentEndDate}\n payRentTime: ${typeof payRentTime} ${payRentTime}\n collectionTime: ${typeof collectionTime} ${collectionTime}\n isTerminationRent: ${typeof isTerminationRent} ${isTerminationRent}\n otherContent: ${typeof otherContent} ${otherContent}\n contentExchange: ${typeof contentExchange} ${contentExchange}`);

        const payload: Operation = {
            name: "createCase",
            args: [
                token, address, landNo, buildingNo, floor, room, caseId,
                companyId, rentStartDate, rentEndDate, payRentTime,
                collectionTime, isTerminationRent, otherContent, contentExchange,
                createdAt
            ],
        }; 

        const result = await this.chainOperation(payload);
        return result;
    };
    async updataContractOperation(
        token: string,
        caseId: string,
        companyId: string,
        cid: string
    ): Promise<chainRes> {
        this.logger.debug(`Call uploadContract input param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n cid: ${typeof cid} ${cid}\n`);

        const payload: Operation = {
            name: "uploadContract",
            args: [
                token, 
                caseId,
                companyId, 
                cid,
            ]
        };

        return await this.chainOperation(payload);
    };

    async cacelCaseOperation(
        token: string,
        caseId: string,
        companyId: string,
        cid: string
    ): Promise<chainRes> {
        this.logger.debug(`Call cacelCaseOperation param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n ${typeof cid} ${cid}`);

        const payload: Operation = {
            name: "cacelCase",
            args: [
                token, caseId, companyId, cid
            ],
        };

        return await this.chainOperation(payload);
    };

    async renewCaseOperation(
        token: string,
        oldCaseId: string,
        companyId: string,
        newCaseId: string,
        cid: string
    ): Promise<chainRes> {
        this.logger.debug(`Call renewCaseOperation param:\n token: ${typeof token} ${token}\n ${typeof oldCaseId} ${oldCaseId}\n companyId: ${typeof companyId} ${companyId}\n newCaseId: ${typeof newCaseId} ${newCaseId}\n cid: ${typeof cid} ${cid}`);

        const payload: Operation = {
            name: "renewCase",
            args: [
                token, oldCaseId, companyId, newCaseId, cid
            ],
        };

        return await this.chainOperation(payload);
    };

    async enableCaseOperation(
        token: string,
        caseId: string,
        companyId: string
    ): Promise<chainRes> {
        this.logger.debug('enableCase', `param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}`);

        const payload: Operation = {
            name: "eableCase",
            args: [
                token, caseId, companyId
            ],
        };

        return await this.chainOperation(payload);
    };

    async uploadDataOperation(
        token: string,
        caseId: string,
        companyId: string,
        dataId: string,
        cid: string,
        type: number
    ): Promise<chainRes> {
        this.logger.debug('uploadData', `param: token${typeof token} ${token}\n caseId ${typeof caseId} ${caseId}\n companyId ${typeof companyId} ${companyId}\n dataId ${typeof dataId} ${dataId}\n cid ${typeof cid} ${cid}\n type ${typeof type} ${type}`);

        const payload: Operation = {
            name: "uploadData",
            args: [token, caseId, companyId, dataId, cid, type],
        };

        return await this.chainOperation(payload);
    };

    async batchCreateRent(
        token: string,
        caseId: string,
        companyId: string,
        amounts: amountsDetail[],
        virtualBankCode: string,
        caseType: number
    ) {
        let payload: Operation[] = [];
        const currentDate = new Date();
        const timestamp = currentDate.getTime().toString();
        for(let amount of amounts) {
            payload.push(
                {
                    name: "createRent",
                    args: [
                        token, 
                        caseId, 
                        companyId, 
                        amount.iid,
                        amount.rentAmount, 
                        amount.elecAmount, 
                        amount.waterAmount, 
                        amount.subsidyAmount, 
                        amount.netAmount, 
                        amount.associationAmount,
                        amount.parkingAmount, 
                        amount.othersAmount,
                        virtualBankCode, 
                        caseType,
                        timestamp
                    ],
                }
            );
        }
        return await this.chainOperations(payload);
    }
    
    async createRentOperation(
        token: string,
        caseId: string,
        companyId: string,
        iid: string,
        rentAmount: number,
        elecAmount: number,
        waterAmount: number,
        subsidyAmount: number,
        netAmount: number,
        associationAmount: number,
        parkingAmount: number,
        othersAmount: number,
        virtualBankCode: string,
        caseType: number
    ): Promise<chainRes> {
        // this.logger.debug('createRent', `param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n totalAmount: ${typeof totalAmount} ${totalAmount}\n rentAmount: ${typeof rentAmount} ${rentAmount}\n associationAmount: ${typeof associationAmount} ${associationAmount}\n waterAmount: ${typeof waterAmount} ${waterAmount}\n elecAmount: ${typeof elecAmount} ${elecAmount}\n gasAmount: ${typeof gasAmount} ${gasAmount}\n netAmount: ${typeof netAmount} ${netAmount}\n parkingAmount: ${typeof parkingAmount} ${parkingAmount}\n othersAmount: ${typeof othersAmount} ${othersAmount}\n subsidyAmount: ${typeof subsidyAmount} ${subsidyAmount}\n lReceivedAmount: ${typeof lReceivedAmount} ${lReceivedAmount}\n lChargedAmount: ${typeof lChargedAmount} ${lChargedAmount}\n virtualBankCode: ${typeof virtualBankCode} ${virtualBankCode}\n caseType: ${typeof caseType} ${caseType}`);
        this.logger.debug('createRent', `param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n rentAmount: ${typeof rentAmount} ${rentAmount}\n associationAmount: ${typeof associationAmount} ${associationAmount}\n waterAmount: ${typeof waterAmount} ${waterAmount}\n elecAmount: ${typeof elecAmount} ${elecAmount}\n \n netAmount: ${typeof netAmount} ${netAmount}\n parkingAmount: ${typeof parkingAmount} ${parkingAmount}\n othersAmount: ${typeof othersAmount} ${othersAmount}\n subsidyAmount: ${typeof subsidyAmount}virtualBankCode: ${typeof virtualBankCode} ${virtualBankCode}\n caseType: ${typeof caseType} ${caseType}`);
        const currentDate = new Date();

        const payload: Operation = {
            name: "createRent",
            args: [
                token, 
                caseId, 
                companyId,
                iid, 
                rentAmount, 
                elecAmount, 
                waterAmount, 
                subsidyAmount, 
                netAmount, 
                associationAmount,
                parkingAmount, 
                othersAmount, 
                virtualBankCode, 
                caseType,
                currentDate.getTime().toString()
            ],
        };

        return await this.chainOperation(payload);
    };

    async updateRentOperation(
        token: string,
        caseId: string,
        companyId: string,
        iid: string,
        rentAmount: number,
        elecAmount: number,
        waterAmount: number,
        subsidyAmount: number,
        netAmount: number,
        associationAmount: number,
        parkingAmount: number,
        othersAmount: number,
    ): Promise<chainRes> {
        const payload: Operation = {
            name: "updateRent",
            args: [
                token, 
                caseId, 
                companyId, 
                iid,
                rentAmount, 
                elecAmount, 
                waterAmount, 
                subsidyAmount, 
                netAmount, 
                associationAmount,
                parkingAmount, 
                othersAmount
            ],
        };

        return await this.chainOperation(payload);
    };

    async createRentRecordOperation(
        token: string,
        caseId: string,
        companyId: string,
        epId: number,
        virtualBankCode: string,
        bankCode: string,
        branchCode: string,
        bankNumber: string,
        subsidyAmount: number,
        totalAmount: number,
        rentAmount: number,
        subAmount: number,
        subAmountSign: number,
        txDate: string,
        statusCode: number,
        createdAt: string
    ): Promise<chainRes> {
        this.logger.debug('createRent', `param:\n token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n epId: ${typeof epId} ${epId}\n virtualBankCode: ${typeof virtualBankCode} ${virtualBankCode}\n bankCode: ${typeof bankCode} ${bankCode}\n branchCode: ${typeof branchCode} ${branchCode}\n bankNumber: ${typeof bankNumber} ${bankNumber}\n subsidyAmount: ${typeof subsidyAmount} ${subsidyAmount}\n totalAmount: ${typeof totalAmount} ${totalAmount}\n rentAmount: ${typeof rentAmount} ${rentAmount}\n rentAmount: ${typeof rentAmount} ${rentAmount}\n subAmount: ${typeof subAmount} ${subAmount}\n subAmountSign: ${typeof subAmountSign} ${subAmountSign}\n txDate: ${typeof txDate} ${txDate}\n statusCode: ${typeof statusCode} ${statusCode}\n createdAt: ${typeof createdAt} ${createdAt}`);

        const payload: Operation = {
            name: "createRentRecord",
            args: [
                token, caseId, companyId, epId, virtualBankCode, bankCode,
                branchCode, bankNumber, subsidyAmount, totalAmount, rentAmount, subAmount, subAmountSign,
                txDate, statusCode, createdAt
            ],
        };

        return await this.chainOperation(payload);
    };

    async createEventLogOperation(
        token: string,
        caseId: string,
        companyId: string,
        eventId: string,
        eventType: string,
        eventContent: string,
        createdAt: string
    ): Promise<chainRes> {
        this.logger.debug('createEventLog', `param: token: ${typeof token} ${token}\n caseId: ${typeof caseId} ${caseId}\n companyId: ${typeof companyId} ${companyId}\n eventId: ${typeof eventId} ${eventId}\n eventType: ${typeof eventType} ${eventType}\n eventContent: ${typeof eventContent} ${eventContent}\n createdAt: ${typeof createdAt} ${createdAt}`);

        const payload: Operation = {
            name: "createEventLog",
            args: [token, caseId, companyId, eventId, eventType, eventContent, createdAt],
        };

        return await this.chainOperation(payload);
    };

    async updateCaseAnchoredTxStatus(
        token: string,
        hash: Buffer
    ): Promise<chainRes> {
        const payload: Operation = {
            name: "updateCaseAnchoredTxStatus",
            args: [token, hash],
        };

        return await this.chainOperation(payload);
    };

    async getCasePayloadHash(caseId: string, companyId: string) {
        type ReturnType = { txIid: number, txHash: Buffer };
        const client = await this.restClient();
        const queryObject: QueryObject<ReturnType> = {
            name: "getCasePayloadHash",
            args: { caseId: caseId, companyId: companyId},
        };
        const res: any = await client.query(queryObject).then((result) => {
            this.logger.log(`query result: ${JSON.stringify(result)}`);
            return result;
        }).catch((err) => {
            this.logger.log(`error: ${err}`);
            return err;
        });
        return res;
    };
}
