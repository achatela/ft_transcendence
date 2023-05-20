import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthModule} from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.enableCors();
  await app.listen(3333);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
