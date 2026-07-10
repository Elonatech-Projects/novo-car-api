// src/newsroom/newsroom.service.ts
// Business logic for the Newsroom module
// Two-step publish flow: upload image → create article with returned URL
// Articles are identified publicly by a URL slug derived from their title

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsroom, NewsroomDocument } from './schema/newsroom.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateNewsroomDto } from './dto/create-newsroom.dto';
import { UpdateNewsroomDto } from './dto/update-newsroom.dto';

// ─── Slug utility ─────────────────────────────────────────────────────────────
// Converts an article title into a URL-safe hyphenated slug
// e.g. "Novo Cars Expands to 36 States!" → "novo-cars-expands-to-36-states"
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric chars
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

@Injectable()
export class NewsroomService {
  private readonly logger = new Logger(NewsroomService.name);

  constructor(
    @InjectModel(Newsroom.name)
    private readonly newsroomModel: Model<NewsroomDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── STEP 1: Upload cover image to Cloudinary ───────────────────────────────
  // Admin uploads the image first, gets back the Cloudinary URL,
  // then passes that URL to createArticle
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validate MIME type — only accept images
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are accepted.',
      );
    }

    // Max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Image must be smaller than 5 MB');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file, {
        folder: 'novo-cars/newsroom',
        resourceType: 'image',
      });

      return {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      this.logger.error('Cloudinary upload failed', err);
      throw new BadRequestException('Image upload failed. Please try again.');
    }
  }

  // ─── STEP 2: Save article to MongoDB ────────────────────────────────────────
  // Slug is auto-generated from the title; duplicates get a numeric suffix (-2, -3 …)
  async createArticle(dto: CreateNewsroomDto): Promise<{
    message: string;
    success: boolean;
    article: NewsroomDocument;
  }> {
    // Build base slug from the title
    let slug = toSlug(dto.title);

    // Ensure uniqueness — append -2, -3 … if the slug is already taken
    const existing = await this.newsroomModel.findOne({ slug });
    if (existing) {
      let counter = 2;
      while (await this.newsroomModel.findOne({ slug: `${slug}-${counter}` })) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }

    const article = await this.newsroomModel.create({ ...dto, slug });

    this.logger.log(`Newsroom article created: "${article.title}" → /${slug}`);

    return {
      message: 'Article created successfully',
      success: true,
      article,
    };
  }

  // ─── PUBLIC: Fetch all published articles (newest first) ────────────────────
  async getAllArticles(): Promise<{
    message: string;
    success: boolean;
    articles: NewsroomDocument[];
    total: number;
  }> {
    const articles = await this.newsroomModel
      .find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      message: 'Articles fetched',
      success: true,
      articles: articles as unknown as NewsroomDocument[],
      total: articles.length,
    };
  }

  // ─── ADMIN: Fetch every article regardless of publish state ─────────────────
  // getAllArticles() above filters to isPublished:true only, so a drafted /
  // unpublished article would otherwise be invisible to the admin dashboard.
  async getAllArticlesAdmin(): Promise<{
    message: string;
    success: boolean;
    articles: NewsroomDocument[];
    total: number;
  }> {
    const articles = await this.newsroomModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      message: 'Articles fetched',
      success: true,
      articles: articles as unknown as NewsroomDocument[],
      total: articles.length,
    };
  }

  // ─── PUBLIC: Fetch single article by slug ───────────────────────────────────
  // Used by the frontend dynamic route /newsroom/:slug
  async getArticleBySlug(slug: string): Promise<{
    message: string;
    success: boolean;
    article: NewsroomDocument;
  }> {
    const article = await this.newsroomModel
      .findOne({ slug, isPublished: true })
      .lean()
      .exec();

    if (!article) {
      throw new NotFoundException(`Article not found: "${slug}"`);
    }

    return {
      message: 'Article fetched',
      success: true,
      article: article as unknown as NewsroomDocument,
    };
  }

  // ─── ADMIN: Edit article fields ──────────────────────────────────────────────
  // If title changes, regenerates the slug automatically
  async updateArticle(
    id: string,
    dto: UpdateNewsroomDto,
  ): Promise<{
    message: string;
    success: boolean;
    article: NewsroomDocument;
  }> {
    const article = await this.newsroomModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // If the title is being updated, regenerate the slug
    if (dto.title && dto.title !== article.title) {
      let newSlug = toSlug(dto.title);

      // Handle collision — exclude the current article from uniqueness check
      const conflict = await this.newsroomModel.findOne({
        slug: newSlug,
        _id: { $ne: article._id },
      });

      if (conflict) {
        let counter = 2;
        while (
          await this.newsroomModel.findOne({
            slug: `${newSlug}-${counter}`,
            _id: { $ne: article._id },
          })
        ) {
          counter++;
        }
        newSlug = `${newSlug}-${counter}`;
      }

      (dto as UpdateNewsroomDto & { slug?: string }).slug = newSlug;
    }

    Object.assign(article, dto);
    await article.save();

    this.logger.log(`Newsroom article updated: "${article.title}"`);

    return {
      message: 'Article updated successfully',
      success: true,
      article,
    };
  }

  // ─── ADMIN: Toggle published / draft status ──────────────────────────────────
  async togglePublish(id: string): Promise<{
    message: string;
    success: boolean;
    article: NewsroomDocument;
  }> {
    const article = await this.newsroomModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.isPublished = !article.isPublished;
    await article.save();

    const state = article.isPublished ? 'published' : 'unpublished';
    this.logger.log(`Newsroom article ${state}: "${article.title}"`);

    return {
      message: `Article ${state} successfully`,
      success: true,
      article,
    };
  }

  // ─── ADMIN: Hard delete ──────────────────────────────────────────────────────
  async deleteArticle(
    id: string,
  ): Promise<{ message: string; success: boolean }> {
    const deleted = await this.newsroomModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Article not found');
    }

    this.logger.log(`Newsroom article deleted: "${deleted.title}"`);

    return {
      message: 'Article deleted successfully',
      success: true,
    };
  }
}
