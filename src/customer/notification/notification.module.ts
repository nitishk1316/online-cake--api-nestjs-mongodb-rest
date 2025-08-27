import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { NotificationService } from './notification.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Notification", schema: NotificationSchema },
		]),
		SharedServiceModule
	],
  controllers: [],
	providers: [NotificationService],
	exports: [MongooseModule, NotificationService]
})
export class NotificationModule {}
