import { Storage } from '@/constants/app.constant';
import {
  applyFormat,
  extractExt,
  fullDiskPath,
  relativeDiskPath,
  storagePath,
} from '@/utils/filesystem';
import { ImageTransformer } from '@/utils/transformers/image.transformer';
import { StorageService } from '@codebrew/nestjs-storage';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync, rmSync } from 'fs';
import path, { join } from 'path';
import sharp from 'sharp';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { FileResDto } from './dto/file.res.dto';
import { FileEntity } from './entities/file.entity';
import { TransformationParser } from './parsers/transformation.parser';
import { UploadFileOptions, UploadImageOptions } from './types/upload.types';
import { FileValidator } from './validators/file.validator';

@Injectable()
export class FileService {
  private readonly disk: Storage = Storage.PUBLIC;

  private readonly logger = new Logger(FileService.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly parser: TransformationParser,
    private readonly imageTransformer: ImageTransformer,
    private readonly fileValidator: FileValidator,
    private readonly storage: StorageService,
  ) {}

  async original(
    resourceType: string,
    publicId: string,
    ext: string,
  ): Promise<string> {
    const media = await this.fileRepository.findOneByOrFail({
      public_id: publicId,
    });

    if (media.resource_type !== resourceType) {
      throw new HttpException('Invalid resource type', HttpStatus.NOT_FOUND);
    }

    const actualExt = media.path.split('.').pop();
    if (actualExt !== ext) {
      throw new HttpException('Extension mismatch', HttpStatus.NOT_FOUND);
    }

    const absPath = fullDiskPath(this.disk, media.path);

    if (!existsSync(absPath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return absPath;
  }

  detectResourceType(mime: string): string {
    if (mime.includes('image')) return 'image';
    if (mime.includes('video')) return 'video';
    return 'raw';
  }

  /**
   * Uploads a file to the disk and creates a new file entity.
   *
   * @param file The file to upload.
   * @param folder Optional folder to store the file in.
   *
   * @throws {HttpException} If the file is not provided or if the file is not an image.
   *
   * @returns A {@link FileResDto} containing information about the uploaded file.
   */
  async upload(file: Express.Multer.File, folder?: string) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    this.fileValidator.validateImage(file, {
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['jpeg', 'png', 'webp'],
    });

    const mime = file.mimetype;
    const resourceType = this.detectResourceType(mime);
    const publicId = uuidv4().replace(/-/g, '').slice(0, 20);

    const ext = file.originalname.split('.').pop();
    const folderPath = folder ? join(resourceType, folder) : join(resourceType);

    const storedPath = join(folderPath, `${publicId}.${ext}`);

    this.storage.getDisk(this.disk).put(storedPath, file.buffer);

    const size = file.size;
    const originalName = file.originalname;
    const hash = this.generateHash();

    let width: number | null = null;
    let height: number | null = null;
    const duration: number | null = null;

    if (resourceType === 'image') {
      try {
        const meta = await sharp(file.buffer).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
      } catch (err) {
        console.warn('Failed to read image metadata:', err);
      }
    }

    const media = this.fileRepository.create({
      public_id: publicId,
      folder,
      original_name: originalName,
      path: storedPath,
      hash,
      mime,
      size,
      width,
      height,
      duration,
      resource_type: resourceType,
      status: 'active',
    });

    await this.fileRepository.save(media);

    return plainToInstance(FileResDto, media, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Builds a cache path from the given resource type, public ID, and transformation parameters.
   * @param resourceType The resource type (e.g. 'image', 'video', etc.)
   * @param publicId The public ID of the file.
   * @param params The transformation parameters as a string.
   * @returns The cache path as a string.
   */
  buildCachePath(resourceType: string, publicId: string, params: string) {
    const hash = createHash('md5').update(params).digest('hex');
    return join('cache', resourceType, publicId, hash);
  }

  /**
   * Generates a unique hash for the given media.
   * The hash is based on a combination of the current timestamp, a random UUID, and a random number.
   * @returns A unique hash as a string.
   */
  private generateHash(): string {
    const now = Date.now().toString();
    const rand = uuidv4();
    return createHash('sha256')
      .update(rand + now + Math.random().toString())
      .digest('hex');
  }

  /**
   * Deletes a file from the disk and database.
   * @param publicId The public ID of the file to delete.
   * @returns A promise resolving to an object containing a success message.
   * @throws {HttpException} If the file is not found.
   */
  async delete(publicId: string): Promise<{ message: string }> {
    const media = await this.fileRepository.findOneByOrFail({
      public_id: publicId,
    });

    await this.storage.getDisk(this.disk).delete(media.path);

    this.deleteCacheFiles(media);

    await this.fileRepository.delete({ public_id: publicId });
    return {
      message: 'Successfully deleted',
    };
  }

  /**
   * Deletes all cache files associated with the given media.
   * @param {FileEntity} media The media entity to delete cache files for.
   */
  protected deleteCacheFiles(media: FileEntity): void {
    const cacheBase = join('cache', media.resource_type, media.public_id);
    const cacheFullPath = fullDiskPath(this.disk, cacheBase);

    if (!existsSync(cacheFullPath)) return;

    rmSync(cacheFullPath, { recursive: true, force: true });
  }

  /**
   * Transforms an image according to the given transformation parameters.
   * @param resourceType The resource type (e.g. 'image', 'video', etc.).
   * @param publicId The public ID of the file to transform.
   * @param params The transformation parameters as a string.
   * @param ext The desired file extension (e.g. 'jpeg', 'png', etc.).
   * @returns A promise resolving to the full path of the transformed image.
   * @throws {BadRequestException} If the transformation type is not supported.
   * @throws {NotFoundException} If the file is not found.
   */
  public async transform(
    resourceType: string,
    publicId: string,
    params: string,
    ext: string,
  ): Promise<string> {
    if (resourceType !== 'image') {
      throw new BadRequestException('Transformation type not supported.');
    }

    const uploadsRoot = join(relativeDiskPath(this.disk), resourceType);
    let found: string | null = null;

    // Try: storage/public/<resourceType>/*/<publicId>.*
    const level2 = readdirSync(uploadsRoot, { withFileTypes: true });

    for (const dir of level2) {
      if (dir.isDirectory()) {
        const folderPath = path.join(uploadsRoot, dir.name);
        const files = readdirSync(folderPath);
        const match = files.find((f) => f.startsWith(publicId + '.' + ext));
        if (match) {
          found = path.join(folderPath, match);
          break;
        }
      }
    }

    // Try: storage/public/<resourceType>/<publicId>.*
    if (!found) {
      const files = readdirSync(uploadsRoot);
      const match = files.find((f) => f.startsWith(publicId + '.' + ext));
      if (match) {
        found = path.join(uploadsRoot, match);
      }
    }

    if (!found) {
      throw new NotFoundException('File not found');
    }

    const origFullPath = path.join(process.cwd(), found);
    const origExt = path.extname(found).replace('.', '');

    const parsed = this.parser.parse(params);
    const format = parsed.format ?? origExt;

    const cacheBasePath = this.buildCachePath(resourceType, publicId, params);
    const cacheFullPath = fullDiskPath(this.disk, cacheBasePath + '.' + format);

    // Cache hit
    if (existsSync(cacheFullPath)) {
      return cacheFullPath;
    }

    const buffer = readFileSync(origFullPath);

    const expressFile = {
      buffer,
      originalname: path.basename(origFullPath),
      fieldname: 'file',
    } as Express.Multer.File;

    const result = await this.imageTransformer.transform(expressFile, parsed);

    await this.storage
      .getDisk(this.disk)
      .put(cacheBasePath + '.' + format, result.buffer);

    return cacheFullPath;
  }

  async uploadImage(
    file: Express.Multer.File,
    options: UploadImageOptions = {},
  ) {
    const {
      folder,
      format,
      quality = 80,
      compress = true,
      withName,
      sizes = [],
      generateThumbnail = false,
      thumbnailWidth = 300,
    } = options;

    this.fileValidator.validateImage(file, options);

    const detectedExt = extractExt(file.mimetype);

    const baseName = withName ?? file.originalname.replace(/\.[^.]+$/, '');
    const ext = format ?? detectedExt;
    const filename = `${Date.now()}-${baseName}.${ext}`;

    let img = sharp(file.buffer);

    if (format) {
      img = applyFormat(img, format, quality);
    } else if (compress) {
      img = img.webp({ quality });
    }

    const buffer = await img.toBuffer();
    const targetPath = folder ? `${folder}/${filename}` : filename;
    await this.storage.getDisk('public').put(targetPath, buffer);

    const result = {
      original: storagePath(this.disk, targetPath),
      sizes: {} as Record<string, string>,
      thumbnail: null as string | null,
    };

    // Process multi-size
    for (const size of sizes) {
      const resizedFolder = folder ? `${folder}/${size.name}` : size.name;

      const resizedName = `${Date.now()}-${baseName}-${size.name}.${ext}`;

      const sizeBuffer = await sharp(file.buffer).resize(size.width).toBuffer();

      await this.storage
        .getDisk('public')
        .put(`${resizedFolder}/${resizedName}`, sizeBuffer);

      result.sizes[size.name] = storagePath(
        this.disk,
        `${resizedFolder}/${resizedName}`,
      );
    }

    // Thumbnail
    if (generateThumbnail) {
      const thumbFolder = folder ? `${folder}/thumb` : 'thumb';
      const thumbName = `${Date.now()}-${baseName}-thumb.${ext}`;

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(thumbnailWidth)
        .toBuffer();

      await this.storage
        .getDisk(this.disk)
        .put(`${thumbFolder}/${thumbName}`, thumbnailBuffer);

      result.thumbnail = storagePath(this.disk, `${thumbFolder}/${thumbName}`);
    }

    return result;
  }

  async uploadImages(
    files: Express.Multer.File[],
    options: UploadImageOptions = {},
  ) {
    if (!files || files.length === 0) throw new Error('No files provided');

    return Promise.all(files.map((file) => this.uploadImage(file, options)));
  }

  async uploadFile(file: Express.Multer.File, options: UploadFileOptions = {}) {
    const { folder = 'files', rename = true } = options;

    this.fileValidator.validateFile(file, options);

    const ext = file.originalname.split('.').pop();
    const base = file.originalname.replace(/\.[^.]+$/, '');

    const filename = rename
      ? `${Date.now()}-${base}.${ext}`
      : file.originalname;

    await this.storage
      .getDisk(this.disk)
      .put(`${folder}/${filename}`, file.buffer);

    return {
      path: storagePath(this.disk, `${folder}/${filename}`),
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadFileOptions = {},
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    return Promise.all(files.map((f) => this.uploadFile(f, options)));
  }
}
