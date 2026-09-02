import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller.js';
import { EmailService } from './email.service.js';

@Module({
  controllers: [NotificationsController],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}

