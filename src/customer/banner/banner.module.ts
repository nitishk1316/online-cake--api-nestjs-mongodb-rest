import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { BannerSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Banner", schema: BannerSchema },
		]),
		SharedServiceModule
	],
  providers: [BannerService],
  controllers: [BannerController]
})
export class BannerModule {}
