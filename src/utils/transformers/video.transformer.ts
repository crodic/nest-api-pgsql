import { Injectable } from '@nestjs/common';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { VideoTransformOptions } from '../../api/file/types/upload.types';

@Injectable()
export class VideoTransformer {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegPath as string);
  }

  async transformToBuffer(
    inputBuffer: Buffer,
    params: VideoTransformOptions,
  ): Promise<{ buffer: Buffer; format: string }> {
    return new Promise((resolve, reject) => {
      const pass = new PassThrough();
      const chunks: Buffer[] = [];

      const command = ffmpeg().input(pass).inputFormat('mp4'); // hoặc detect từ mimetype

      // CLIP
      if (params.start && params.duration) {
        command.setStartTime(params.start);
        command.setDuration(params.duration);
      }

      // FILTERS
      const vf: string[] = [];

      if (params.width || params.height) {
        const w = params.width ?? -2;
        const h = params.height ?? -2;
        vf.push(`scale=${w}:${h}`);
      }

      if (params.rotate) {
        const angle = String(params.rotate);
        if (angle === '90') vf.push('transpose=1');
        else if (angle === '180') vf.push('transpose=1,transpose=1');
        else if (angle === '270') vf.push('transpose=2');
        else vf.push(`rotate=${angle}*PI/180`);
      }

      if (params.flip === 'horizontal') vf.push('hflip');
      if (params.flip === 'vertical') vf.push('vflip');

      if (vf.length > 0) command.videoFilters(vf.join(','));

      if (params.fps) {
        command.outputOptions(['-r', String(params.fps)]);
      }

      const bitrate = parseInt(String(params.bitrate ?? 1500));
      const formatExt = params.format ?? 'mp4';

      command
        .videoBitrate(`${bitrate}k`)
        .audioCodec('aac')
        .videoCodec('libx264')
        .format(formatExt)
        .on('error', reject)
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, format: formatExt });
        })
        .pipe();

      // Feeding input buffer
      pass.end(inputBuffer);
    });
  }

  async transformWithFile(
    file: Express.Multer.File,
    params: VideoTransformOptions,
  ) {
    const inputBuffer = file.buffer;

    const { buffer, format } = await this.transformToBuffer(
      inputBuffer,
      params,
    );

    return {
      buffer,
      format,
      originalname: file.originalname,
      mimetype: `video/${format}`,
      size: buffer.length,
    };
  }
}
