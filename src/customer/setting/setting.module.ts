import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Setting", schema: SettingSchema },
		])
	],
  providers: [SettingService],
  controllers: [SettingController],
	exports: [MongooseModule, SettingService]
})
export class SettingModule {}
