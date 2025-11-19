import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('MONGO_URL');

        if (url) {
          console.log('✅ Connecting to MongoDB...');
          console.log(`🔗 Connection string: ${url}`);
        } else {
          console.error(
            ' Failed to connect MONGO_URL is not defined in your file',
          );
        }

        return {
          uri: url,
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
  ],
})
export class AppModule {}
