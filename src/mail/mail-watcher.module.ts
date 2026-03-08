import { MailerService } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { NESTLENS_MAILER_SERVICE } from 'nestlens';
import { MailModule } from './mail.module';

@Global()
@Module({
  imports: [MailModule],
  providers: [
    {
      provide: NESTLENS_MAILER_SERVICE,
      useFactory: (mailerService: MailerService) => mailerService,
      inject: [MailerService],
    },
  ],
  exports: [NESTLENS_MAILER_SERVICE],
})
export class MailWatcherModule {}
