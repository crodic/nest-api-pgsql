import { EmailLogEntity } from '@/api/email/entities/email-log.entity';
import {
  IAdminSendEmailJob,
  IForgotPasswordEmailJob,
  IVerifyEmailJob,
} from '@/common/interfaces/job.interface';
import { AllConfigType } from '@/config/config.type';
import { EEmailLogSource, EEmailLogStatus } from '@/constants/entity.enum';
import { JobName } from '@/constants/job.constant';
import { MailService } from '@/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(EmailLogEntity)
    private readonly emailLogRepository: Repository<EmailLogEntity>,
  ) {}

  async sendEmailVerification(data: IVerifyEmailJob): Promise<void> {
    this.logger.debug(`Sending email verification to ${data.email}`);
    const renderedBody = this.mailService.renderEmailVerification(
      data.email,
      data.token,
    );
    const log = await this.createSystemLog({
      to: [data.email],
      subject: 'Email Verification',
      jobName: JobName.EMAIL_VERIFICATION,
      templateName: 'email-verification',
      body: renderedBody,
      renderedBody,
    });

    try {
      await this.mailService.sendEmailVerification(
        data.email,
        data.token,
        renderedBody,
      );
      await this.markSent(log, renderedBody);
    } catch (error) {
      await this.markFailed(log, error);
      throw error;
    }
  }

  async sendEmailForgotPassword(data: IForgotPasswordEmailJob): Promise<void> {
    this.logger.debug(`Sending email forgot password to ${data.email}`);
    const renderedBody = this.mailService.renderEmailForgotPassword(
      data.email,
      data.token,
    );
    const log = await this.createSystemLog({
      to: [data.email],
      subject: 'Email Reset Password',
      jobName: JobName.EMAIL_FORGOT_PASSWORD,
      templateName: 'email-reset-password',
      body: renderedBody,
      renderedBody,
    });

    try {
      await this.mailService.sendEmailForgotPassword(
        data.email,
        data.token,
        renderedBody,
      );
      await this.markSent(log, renderedBody);
    } catch (error) {
      await this.markFailed(log, error);
      throw error;
    }
  }

  async sendAdminEmail(data: IAdminSendEmailJob): Promise<void> {
    const emailLog = await this.emailLogRepository.findOneBy({
      id: data.emailLogId,
    });

    if (!emailLog || emailLog.status === EEmailLogStatus.CANCELLED) {
      return;
    }

    try {
      const renderedBody = this.mailService.renderAdminEmail({
        subject: emailLog.subject,
        body: emailLog.body ?? '',
      });
      emailLog.renderedBody = renderedBody;
      await this.emailLogRepository.save(emailLog);
      await this.mailService.sendAdminEmail({
        to: emailLog.to,
        cc: emailLog.cc,
        bcc: emailLog.bcc,
        subject: emailLog.subject,
        body: emailLog.body ?? '',
        renderedHtml: renderedBody,
      });
      await this.markSent(emailLog, renderedBody);
    } catch (error) {
      await this.markFailed(emailLog, error);
      throw error;
    }
  }

  private async createSystemLog(params: {
    to: string[];
    subject: string;
    jobName: JobName;
    templateName: string;
    body?: string;
    renderedBody?: string;
  }): Promise<EmailLogEntity | undefined> {
    try {
      const log = this.emailLogRepository.create({
        source: EEmailLogSource.SYSTEM,
        status: EEmailLogStatus.SCHEDULED,
        from: this.getDefaultFrom(),
        to: params.to,
        subject: params.subject,
        jobName: params.jobName,
        templateName: params.templateName,
        body: params.body,
        renderedBody: params.renderedBody,
      });

      return await this.emailLogRepository.save(log);
    } catch (error) {
      this.logger.warn(`Failed to create system email log: ${error}`);
      return undefined;
    }
  }

  private async markSent(
    emailLog?: EmailLogEntity,
    renderedBody?: string,
  ): Promise<void> {
    if (!emailLog) {
      return;
    }

    try {
      emailLog.status = EEmailLogStatus.SENT;
      emailLog.sentAt = new Date();
      emailLog.errorMessage = null;
      emailLog.failedAt = null;
      if (renderedBody) {
        emailLog.renderedBody = renderedBody;
      }
      emailLog.attempts = (emailLog.attempts ?? 0) + 1;
      await this.emailLogRepository.save(emailLog);
    } catch (error) {
      this.logger.warn(`Failed to update sent email log: ${error}`);
    }
  }

  private async markFailed(
    emailLog: EmailLogEntity | undefined,
    error: unknown,
  ): Promise<void> {
    if (!emailLog) {
      return;
    }

    try {
      emailLog.status = EEmailLogStatus.FAILED;
      emailLog.failedAt = new Date();
      emailLog.errorMessage =
        error instanceof Error ? error.message : String(error);
      emailLog.attempts = (emailLog.attempts ?? 0) + 1;
      await this.emailLogRepository.save(emailLog);
    } catch (updateError) {
      this.logger.warn(`Failed to update failed email log: ${updateError}`);
    }
  }

  private getDefaultFrom(): string {
    const name = this.configService.get('mail.defaultName', { infer: true });
    const email = this.configService.get('mail.defaultEmail', { infer: true });

    return name ? `"${name}" <${email}>` : email;
  }
}
