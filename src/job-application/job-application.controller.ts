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

  @Get()
  @UseGuards(JwtAdminGuard)
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
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
