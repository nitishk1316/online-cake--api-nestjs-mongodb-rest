import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationAdminService } from 'src/admin/notification/notification.service';

@Controller()
export class AppController {
  constructor(
		private readonly appService: AppService,
		private readonly notifyService: NotificationAdminService,
	) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

	/**
	 * Remove export files from server. Keep checking in every 10 minutes
	 */
	 @Cron(CronExpression.EVERY_10_MINUTES)
	 removeExportNotification() {
		 this.notifyService.removeExportFile();
	 }
}
