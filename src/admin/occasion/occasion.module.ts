import { Module } from '@nestjs/common';
import { OccasionAdminService } from './occasion.service';
import { OccasionAdminController } from './occasion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { OccasionSchema, SequenceSchema } from 'src/shared/models';

@Module({
	imports: [
			MongooseModule.forFeature([
			{ name: "Occasion", schema: OccasionSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule,
	],
  providers: [OccasionAdminService],
  controllers: [OccasionAdminController],
	exports: [OccasionAdminService, MongooseModule]
})
export class OccasionAdminModule {}
