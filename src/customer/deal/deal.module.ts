import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealSchema } from 'src/shared/models';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Deal", schema: DealSchema },
		])
	],
  providers: [DealService],
	controllers: [DealController],
	exports: [MongooseModule, DealService]
})
export class DealModule {}
