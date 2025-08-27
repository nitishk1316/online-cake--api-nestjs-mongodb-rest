import { Module } from '@nestjs/common';
import { PageAdminService } from './page.service';
import { PageAdminController } from './page.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { PageSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Page", schema: PageSchema }
		]),
		SharedServiceModule
	],
  providers: [PageAdminService],
  controllers: [PageAdminController]
})
export class PageAdminModule {}
