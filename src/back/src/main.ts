import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthModule} from './auth/auth.module';
import { AuthService } from './auth/auth.service';


declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3333); 

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  let authService = app.select(AuthModule).get(AuthService);

  // authService.getToken()
  //   .then((token: any) => {
  //     console.log(token);
  //   });
}

bootstrap();
