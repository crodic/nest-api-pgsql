import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service';

@ApiTags('Medias')
@Controller({ path: 'media' })
export class TransformController {
  constructor(private readonly media: MediaService) {}

  @Get(':resourceType/upload/:publicId.:ext')
  async original(
    @Param('resourceType') resourceType: string,
    @Param('publicId') publicId: string,
    @Param('ext') ext: string,
    @Res() res: Response,
  ) {
    const filePath = await this.media.original(resourceType, publicId, ext);

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.sendFile(filePath);
  }

  @Get(':resourceType/upload/:params/:publicId.:ext')
  async transform(
    @Param('resourceType') resourceType: string,
    @Param('params') params: string,
    @Param('publicId') publicId: string,
    @Param('ext') ext: string,
    @Res() res: Response,
  ) {
    const filePath = await this.media.transform(
      resourceType,
      publicId,
      params,
      ext,
    );

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }
}
