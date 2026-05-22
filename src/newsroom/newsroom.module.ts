// src/newsroom/newsroom.module.ts
// Wires up the Newsroom feature module
// Imports CloudinaryModule so the service can upload images

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsroom, NewsroomSchema } from './schema/newsroom.schema';
import { NewsroomService } from './newsroom.service';
import { NewsroomController } from './newsroom.controller';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    // Register the Newsroom Mongoose model
    MongooseModule.forFeature([
      { name: Newsroom.name, schema: NewsroomSchema },
    ]),
    // Provides CloudinaryService for image uploads
    CloudinaryModule,
  ],
  controllers: [NewsroomController],
  providers: [NewsroomService],
})
export class NewsroomModule {}
