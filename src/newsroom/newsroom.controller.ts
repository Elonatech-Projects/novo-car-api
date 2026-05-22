// src/newsroom/newsroom.controller.ts
// REST endpoints for the Newsroom feature
//
// PUBLIC  — no guard
//   GET  /newsroom/fetch         → all published articles
//   GET  /newsroom/:id           → single article by ID
//
// ADMIN ONLY — protected by JwtAdminGuard
//   POST   /newsroom/upload-image → upload cover to Cloudinary, returns URL
//   POST   /newsroom/create       → save article (uses URL from step above)
//   PATCH  /newsroom/:id/update   → edit article fields
//   PATCH  /newsroom/:id/toggle   → publish ↔ draft toggle
//   DELETE /newsroom/:id          → hard delete

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NewsroomService } from './newsroom.service';
import { CreateNewsroomDto } from './dto/create-newsroom.dto';
import { UpdateNewsroomDto } from './dto/update-newsroom.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

@Controller('newsroom')
export class NewsroomController {
  constructor(private readonly newsroomService: NewsroomService) {}

  // ── STEP 1: Upload cover image ─────────────────────────────────────────────
  // Admin uploads the image here FIRST, receives the Cloudinary URL,
  // then passes that URL to POST /newsroom/create
  @UseGuards(JwtAdminGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      // Store in memory so we can stream straight to Cloudinary (no disk I/O)
      storage: memoryStorage(),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.newsroomService.uploadImage(file);
  }

  // ── STEP 2: Create article ─────────────────────────────────────────────────
  @UseGuards(JwtAdminGuard)
  @Post('create')
  async createArticle(@Body() dto: CreateNewsroomDto) {
    return this.newsroomService.createArticle(dto);
  }

  // ── PUBLIC: All published articles ────────────────────────────────────────
  @Get('fetch')
  async getAllArticles() {
    return this.newsroomService.getAllArticles();
  }

  // ── PUBLIC: Single article by slug ────────────────────────────────────────
  // e.g. GET /newsroom/orange-driving-school
  @Get(':slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.newsroomService.getArticleBySlug(slug);
  }

  // ── ADMIN: Update article ─────────────────────────────────────────────────
  @UseGuards(JwtAdminGuard)
  @Patch(':id/update')
  async updateArticle(@Param('id') id: string, @Body() dto: UpdateNewsroomDto) {
    return this.newsroomService.updateArticle(id, dto);
  }

  // ── ADMIN: Toggle publish / draft ─────────────────────────────────────────
  @UseGuards(JwtAdminGuard)
  @Patch(':id/toggle')
  async togglePublish(@Param('id') id: string) {
    return this.newsroomService.togglePublish(id);
  }

  // ── ADMIN: Hard delete ─────────────────────────────────────────────────────
  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async deleteArticle(@Param('id') id: string) {
    return this.newsroomService.deleteArticle(id);
  }
}
