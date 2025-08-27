import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema } from 'src/shared/models';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Page", schema: PageSchema }
		])
	],
  controllers: [PageController],
  providers: [PageService]
})
export class PageModule {}
