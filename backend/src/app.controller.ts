import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import {} from "./app.interface";
import { ChainService } from "./postchain/chain.service";
import { HttpService } from "@nestjs/axios";

@Controller()
export class AppController {
  getHello(): any {
    throw new Error("Method not implemented.");
  }
  constructor(
    private readonly appService: AppService,
    private readonly chainService: ChainService,
    private readonly httpService: HttpService
  ) {}

  @ApiTags("健康狀態")
  @Get("health")
  @ApiResponse({ status: 200, description: "ok", type: "" })
  async checkHealth(): Promise<string> {
    return await this.chainService.healthQueryObject();
  }
}
