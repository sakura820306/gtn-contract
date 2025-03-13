import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle("猜數字小遊戲 API")
    .setDescription("提供前端介接")
    .setVersion("1.0")
    .addServer(
      process.env.NODE_ENV === "prod"
        ? `${process.env.SERVER_API_URL}/api`
        : `${process.env.SERVER_API_URL}:${process.env.SERVER_PORT}/api`
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("apidoc", app, document);

  app.enableCors();
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
  app.use(bodyParser.text({ limit: "20mb" }));
  app.setGlobalPrefix("api");
  await app.listen(process.env.SERVER_PORT);

  console.log(
    "\napidoc: ",
    `${process.env.SERVER_API_URL}:${process.env.SERVER_PORT}/apidoc`
  );
  console.log(
    "api_url: ",
    `${process.env.SERVER_API_URL}:${process.env.SERVER_PORT}/api`
  );
}
bootstrap();
