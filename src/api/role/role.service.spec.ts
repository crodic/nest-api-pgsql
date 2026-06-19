import { CacheKey } from '@/constants/cache.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  const roleRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneByOrFail: jest.fn(),
    count: jest.fn(),
    softRemove: jest.fn(),
    create: jest.fn((data) => new RoleEntity(data)),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
    })),
  };
  const permissionRepository = {
    findBy: jest.fn(),
  };
  const cacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,

        // Mock Repository
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: roleRepository,
        },
        {
          provide: getRepositoryToken(PermissionEntity),
          useValue: permissionRepository,
        },

        // Mock Cache Manager
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasRole', () => {
    it('returns the cached value when present', async () => {
      cacheManager.get.mockResolvedValue(false);

      await expect(service.hasRole()).resolves.toBe(false);

      expect(roleRepository.count).not.toHaveBeenCalled();
    });

    it('counts roles and caches the result on cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      roleRepository.count.mockResolvedValue(2);

      await expect(service.hasRole()).resolves.toBe(true);

      expect(cacheManager.set).toHaveBeenCalledWith(
        CacheKey.SYSTEM_HAS_ROLE,
        true,
        60000,
      );
    });
  });

  describe('create', () => {
    it('creates a role with resolved permissions', async () => {
      const permissions = [
        new PermissionEntity({ id: '1' as any, key: 'read:User' }),
        new PermissionEntity({ id: '2' as any, key: 'create:User' }),
      ];
      const savedRole = new RoleEntity({
        id: '10' as any,
        name: 'Manager',
        permissionEntities: permissions,
      });

      permissionRepository.findBy.mockResolvedValue(permissions);
      roleRepository.save.mockResolvedValue(savedRole);

      const result = await service.create({
        name: 'Manager',
        description: 'Can manage users',
        permissionIds: ['1', '2'],
      });

      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Manager',
          isSystem: false,
          permissionEntities: permissions,
        }),
      );
      expect(result).toEqual(expect.objectContaining({ name: 'Manager' }));
    });

    it('throws when a permission id cannot be resolved', async () => {
      permissionRepository.findBy.mockResolvedValue([
        new PermissionEntity({ id: '1' as any }),
      ]);

      await expect(
        service.create({ name: 'Manager', permissionIds: ['1', '2'] }),
      ).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E002 },
      });

      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('does not remove system roles', async () => {
      roleRepository.findOneByOrFail.mockResolvedValue(
        new RoleEntity({ id: '1' as any, isSystem: true }),
      );

      await expect(service.remove('1' as any)).rejects.toMatchObject({
        response: { errorCode: ErrorCode.V003 },
      });
      expect(roleRepository.softRemove).not.toHaveBeenCalled();
    });

    it('soft removes non-system roles', async () => {
      const role = new RoleEntity({ id: '1' as any, isSystem: false });
      roleRepository.findOneByOrFail.mockResolvedValue(role);

      await service.remove('1' as any);

      expect(roleRepository.softRemove).toHaveBeenCalledWith(role);
    });
  });
});
