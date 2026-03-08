import { QueueName } from '@/constants/job.constant';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobWatcher } from 'nestlens';

@Injectable()
export class EmailQueueWatcherService implements OnModuleInit {
  constructor(
    @InjectQueue(QueueName.EMAIL) private emailQueue: Queue,
    private jobWatcher: JobWatcher,
  ) {}

  onModuleInit() {
    this.jobWatcher.setupQueue(this.emailQueue, QueueName.EMAIL);
  }
}
