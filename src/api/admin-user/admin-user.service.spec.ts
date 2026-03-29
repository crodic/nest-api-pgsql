import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { Repository } from 'typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { SettingsService } from '../settings/settings.service';
import { AdminUserService } from './admin-user.service';
import { AdminUserEntity } from './entities/admin-user.entity';

describe('AdminUserService', () => {
  let service: AdminUserService;

  let adminRepoMock: Partial<
    Record<keyof Repository<AdminUserEntity>, jest.Mock>
  >;
  let roleRepoMock: Partial<Record<keyof Repository<RoleEntity>, jest.Mock>>;

  beforeAll(async () => {
    adminRepoMock = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      findOneByOrFail: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    roleRepoMock = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: adminRepoMock,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: roleRepoMock,
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            get: jest.fn(),
            all: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminUserService>(AdminUserService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
