import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  isNumber,
} from "class-validator";

const startAt = new Date();
const end = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
const endAt = new Date(end);

export interface Case {
  address: string;
  landNo: string;
  buildingNo: string;
  caseId: string;
}

export class authDto {
  @ApiProperty({
    example: "",
    type: String,
    description: "email",
    required: true,
  })
  email: string;

  @ApiProperty({
    example: "",
    type: String,
    description: "pin 碼",
    required: true,
  })
  pincode: string;
}
