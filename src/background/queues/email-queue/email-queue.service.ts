import {
  IForgotPasswordEmailJob,
  IVerifyEmailJob,
} from '@/common/interfaces/job.interface';
import { MailService } from '@/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private readonly mailService: MailService) {}

  async sendEmailVerification(data: IVerifyEmailJob): Promise<void> {
    this.logger.debug(`Sending email verification to ${data.email}`);
    await this.mailService.sendEmailVerification(data.email, data.token);
  }

  async sendEmailForgotPassword(data: IForgotPasswordEmailJob): Promise<void> {
    this.logger.debug(`Sending email forgot password to ${data.email}`);
    await this.mailService.sendEmailForgotPassword(data.email, data.token);
  }
}
