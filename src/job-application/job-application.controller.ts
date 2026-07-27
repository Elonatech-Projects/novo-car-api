import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JobApplicationsService } from './job-application.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JwtAdminGuard } from '../admin/guards/jwt-auth.guard';

export const allowedCvMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const isAllowedCvFile = (
  file: Pick<Express.Multer.File, 'mimetype' | 'originalname'>,
): boolean => {
  const hasAllowedMimeType = allowedCvMimeTypes.includes(file.mimetype);
  const hasAllowedExtension = /\.(pdf|doc|docx)$/i.test(file.originalname);

  return hasAllowedMimeType && hasAllowedExtension;
};

@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly service: JobApplicationsService) {}

  @Post('apply')
  @UseInterceptors(
    FileInterceptor('cv', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_, file, cb) => {
        if (!isAllowedCvFile(file)) {
          return cb(
            new BadRequestException(
              'Only PDF, DOC, or DOCX files are allowed for CV upload',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async apply(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .addFileTypeValidator({
          fileType: new RegExp(`^(${allowedCvMimeTypes.join('|')})$`),
          // NestJS 11 validates magic numbers via the `file-type` package by
          // default. A .docx is a ZIP archive, so it is often detected as
          // `application/zip`, failing this check and rejecting the upload
          // before it reaches Cloudinary. The FileInterceptor `fileFilter`
          // above already validates mimetype + extension, so match the
          // declared mimetype instead of sniffing the buffer.
          skipMagicNumbersValidation: true,
        })
        .build({
          errorHttpStatusCode: 422,
          fileIsRequired: false,
        }),
    )
    cv: Express.Multer.File | undefined,
    @Body() dto: CreateJobApplicationDto,
  ): Promise<{ success: boolean; message: string }> {
    // If a file was provided it will be uploaded by the service; if not,
    // the service will use dto.cvUrl (in case a URL was provided instead).
    await this.service.create(dto, cv);
    return { success: true, message: 'Job application submitted successfully' };
  }

  @Get()
  @UseGuards(JwtAdminGuard)
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/download')
  @UseGuards(JwtAdminGuard)
  async getCvDownloadLink(@Param('id') id: string): Promise<{
    cvUrl?: string;
    cvFileName?: string;
  }> {
    return await this.service.getCvDownloadLink(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAdminGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
