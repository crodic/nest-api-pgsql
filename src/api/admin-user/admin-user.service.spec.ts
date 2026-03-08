// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { ClsService } from 'nestjs-cls';
// import { Repository } from 'typeorm';
// import { AdminUserService } from './admin-user.service';
// import { AdminUserEntity } from './entities/admin-user.entity';

// describe('AdminUserService', () => {
//   let service: AdminUserService;
//   let userRepositoryValue: Partial<
//     Record<keyof Repository<AdminUserEntity>, jest.Mock>
//   >;

//   beforeAll(async () => {
//     userRepositoryValue = {
//       findOne: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AdminUserService,
//         {
//           provide: getRepositoryToken(AdminUserEntity),
//           useValue: userRepositoryValue,
//         },
//         {
//           provide: ClsService,
//           useValue: {
//             get: jest.fn(),
//             set: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AdminUserService>(AdminUserService);
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
