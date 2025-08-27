import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { NotificationAdminController } from './notification.controller';
import { NotificationAdminService } from './notification.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Notification", schema: NotificationSchema },
		]),
		SharedServiceModule
	],
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService]
})
export class NotificationAdminModule {}
