import {
  BadRequestException,
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JobApplicationsService } from './job-application.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

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
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only PDF, DOC or DOCX files are allowed for CV upload',
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
          fileType:
            /^(application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: 422,
        }),
    )
    cv: Express.Multer.File,
    @Body() dto: CreateJobApplicationDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.service.create(dto, cv);
    return { success: true, message: 'Job application submitted successfully' };
  }
}
