import { Module } from '@nestjs/common';
import { OccasionService } from './occasion.service';
import { OccasionController } from './occasion.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { OccasionSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Occasion", schema: OccasionSchema },
		]),
		SharedServiceModule
	],
  providers: [OccasionService],
  controllers: [OccasionController]
})
export class OccasionModule {}
