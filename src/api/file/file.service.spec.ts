import { StorageService } from '@codebrew/nestjs-storage';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileService } from './file.service';
import { TransformationParser } from './parsers/transformation.parser';
import { ImageTransformer } from './transformers/image.transformer';
import { VideoTransformer } from './transformers/video.transformer';
import { FileValidator } from './validators/file.validator';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,

        // Mock repository
        {
          provide: getRepositoryToken(FileEntity),
          useValue: {
            findOneByOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },

        // Mock parser
        {
          provide: TransformationParser,
          useValue: { parse: jest.fn() },
        },

        // Mock transformers
        {
          provide: ImageTransformer,
          useValue: { transform: jest.fn() },
        },
        {
          provide: VideoTransformer,
          useValue: { transform: jest.fn() },
        },

        // Mock validator
        {
          provide: FileValidator,
          useValue: { validateImage: jest.fn(), validateFile: jest.fn() },
        },

        // Mock storage
        {
          provide: StorageService,
          useValue: {
            getDisk: jest.fn().mockReturnValue({
              put: jest.fn(),
              delete: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
