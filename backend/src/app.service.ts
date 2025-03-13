import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {} from "./app.interface";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
