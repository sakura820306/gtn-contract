import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 載入 ConfigService
  // 這裡的 ConfigService 是從 @nestjs/config 套件中引入的
  // 它提供了一個方便的方式來讀取環境變數
  // 這裡的 app.get(ConfigService) 是從 NestJS 的 DI 容器中獲取 ConfigService 的實例
  // 這樣就可以使用 ConfigService 提供的方法來讀取環境變數
  // 例如：configService.get<string>('SERVER_API_URL') 就是讀取環境變數 SERVER_API_URL 的值
  const configService = app.get(ConfigService);
  const SERVER_API_URL = configService.get<string>('SERVER_API_URL');
  const SERVER_PORT = configService.get<number>('SERVER_PORT');

  const config = new DocumentBuilder()
      .setTitle('猜數字小遊戲 API')
      .setDescription('提供前端介接')
      .setVersion('1.0')
      .addServer(`${SERVER_API_URL}:${SERVER_PORT}/api`)
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidoc', app, document);

  app.enableCors();
  app.setGlobalPrefix('api');

  await app.listen(SERVER_PORT);

  console.log(
    '\napidoc: ', 
    `${SERVER_API_URL}:${SERVER_PORT}/apidoc`
  );
  console.log(
    'api_url: ', 
    `${SERVER_API_URL}:${SERVER_PORT}/api`
  );
}
bootstrap();
