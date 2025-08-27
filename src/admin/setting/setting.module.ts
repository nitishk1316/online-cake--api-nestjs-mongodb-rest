import { Module } from '@nestjs/common';
import { SettingAdminService } from './setting.service';
import { SettingAdminController } from './setting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { SettingSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Setting", schema: SettingSchema },
		]),
		SharedServiceModule
	],
  providers: [SettingAdminService],
  controllers: [SettingAdminController],
	exports: [SettingAdminService, MongooseModule]
})
export class SettingAdminModule {}
