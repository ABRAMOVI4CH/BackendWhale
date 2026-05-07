import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_me',
      // Access tokens are intentionally long-lived per product constraint.
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'data/whalescale.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
