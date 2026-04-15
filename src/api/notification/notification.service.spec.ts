import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationRecipientEntity } from './entities/notification-recipient.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NotificationRecipientEntity),
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            sendToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
