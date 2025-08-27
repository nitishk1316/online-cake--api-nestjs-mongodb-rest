import { Module } from '@nestjs/common';
import { DealAdminService } from './deal.service';
import { DealAdminController } from './deal.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { DealSchema, SequenceSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Deal", schema: DealSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule
	],
  providers: [DealAdminService],
  controllers: [DealAdminController]
})
export class DealAdminModule {}
