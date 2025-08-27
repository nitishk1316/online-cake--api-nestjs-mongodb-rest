import { Module } from '@nestjs/common';
import { BannerAdminController } from './banner.controller';
import { BannerAdminService } from './banner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerSchema, SequenceSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';

@Module({
	imports: [
			MongooseModule.forFeature([
			{ name: "Banner", schema: BannerSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule
	],
  controllers: [BannerAdminController],
  providers: [BannerAdminService,]
})
export class BannerAdminModule {}
