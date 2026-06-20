import { AllConfigType } from '@/config/config.type';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly mailerService: MailerService,
  ) {}

  renderEmailVerification(email: string, token: string): string {
    // Please replace the URL with your own frontend URL
    const url = `${this.configService.get('app.url', { infer: true })}/api/v1/auth/verify/email?token=${token}`;

    return this.renderTemplate('email-verification', {
      email,
      url,
    });
  }

  async sendEmailVerification(
    email: string,
    token: string,
    renderedHtml?: string,
  ): Promise<string> {
    const html = renderedHtml ?? this.renderEmailVerification(email, token);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      html,
    });

    return html;
  }

  renderEmailForgotPassword(email: string, token: string): string {
    const portalResetPasswordUrl = this.configService.getOrThrow(
      'auth.portalResetPasswordUrl',
      {
        infer: true,
      },
    );
    const url = `${portalResetPasswordUrl}?token=${token}`;

    return this.renderTemplate('email-reset-password', {
      email,
      url,
    });
  }

  async sendEmailForgotPassword(
    email: string,
    token: string,
    renderedHtml?: string,
  ): Promise<string> {
    const html = renderedHtml ?? this.renderEmailForgotPassword(email, token);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Reset Password',
      html,
    });

    return html;
  }

  renderAdminEmail(params: {
    subject: string;
    body: string;
    logoUrl?: string | null;
  }): string {
    return this.renderTemplate('admin-email', {
      subject: params.subject,
      body: params.body,
      logoUrl: params.logoUrl,
    });
  }

  async sendAdminEmail(params: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    logoUrl?: string | null;
    renderedHtml?: string;
  }): Promise<string> {
    const html = params.renderedHtml ?? this.renderAdminEmail(params);

    await this.mailerService.sendMail({
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
      subject: params.subject,
      html,
    });

    return html;
  }

  private renderTemplate(
    templateName: 'email-verification' | 'email-reset-password' | 'admin-email',
    context: Record<string, unknown>,
  ): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.hbs`);
    const template = readFileSync(templatePath, 'utf8');

    return Handlebars.compile(template, { strict: true })(context);
  }
}
