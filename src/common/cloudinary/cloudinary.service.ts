// src/common/cloudinary/cloudinary.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { extname, basename } from 'path';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary environment variables are missing',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: { folder?: string; resourceType?: 'image' | 'raw' },
  ): Promise<UploadApiResponse> {
    const resourceType = options?.resourceType ?? 'image'; // 🔥 default to image

    // For raw files (PDF/DOC/DOCX) Cloudinary does not infer an extension, so
    // the delivered URL ends up extension-less and the browser/OS can't open
    // the file. For raw resources the extension is part of the public_id, so
    // build a unique public_id that keeps the original ".docx"/".pdf" suffix.
    const rawFileOptions =
      resourceType === 'raw'
        ? { public_id: this.buildRawPublicId(file.originalname) }
        : {};

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder ?? 'novo-cars',
          resource_type: resourceType,
          ...rawFileOptions,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));

          resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  /**
   * Build a unique, extension-preserving public_id for a raw upload.
   * e.g. "John Doe CV.docx" -> "John-Doe-CV-3f2c1a9b.docx"
   * Keeping the extension makes the delivered Cloudinary URL end in the
   * correct suffix so browsers/OS open it in the right application.
   */
  private buildRawPublicId(originalname: string): string {
    const ext = extname(originalname); // ".docx"
    const nameWithoutExt = basename(originalname, ext);

    const safeName =
      nameWithoutExt
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'file';

    return `${safeName}-${randomUUID().slice(0, 8)}${ext}`;
  }
}
