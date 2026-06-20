import { EmailLogEntity } from '@/api/email/entities/email-log.entity';
import { MailService } from '@/mail/mail.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailQueueService } from './email-queue.service';

describe('EmailQueueService', () => {
  let service: EmailQueueService;
  let mailServiceValue: Partial<Record<keyof MailService, jest.Mock>>;
  let emailLogRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
  };

  beforeAll(async () => {
    mailServiceValue = {
      sendEmailVerification: jest.fn(),
      sendEmailForgotPassword: jest.fn(),
      sendAdminEmail: jest.fn(),
      renderEmailVerification: jest.fn(),
      renderEmailForgotPassword: jest.fn(),
      renderAdminEmail: jest.fn(),
    };
    emailLogRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailQueueService,
        {
          provide: MailService,
          useValue: mailServiceValue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'mail.defaultName') return 'Crodic';
              if (key === 'mail.defaultEmail') return 'noreply@example.com';

              return undefined;
            }),
          },
        },
        {
          provide: getRepositoryToken(EmailLogEntity),
          useValue: emailLogRepository,
        },
        {
          provide: getQueueToken('email'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailQueueService>(EmailQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('logs the full rendered verification email body', async () => {
    mailServiceValue.renderEmailVerification.mockReturnValue(
      '<html>Verify account</html>',
    );
    mailServiceValue.sendEmailVerification.mockResolvedValue(
      '<html>Verify account</html>',
    );

    await service.sendEmailVerification({
      email: 'admin@example.com',
      token: 'verify-token',
    });

    expect(emailLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: '<html>Verify account</html>',
        renderedBody: '<html>Verify account</html>',
      }),
    );
    expect(emailLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'sent',
        renderedBody: '<html>Verify account</html>',
      }),
    );
  });
});
