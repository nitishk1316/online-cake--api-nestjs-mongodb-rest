import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliverySlotSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { DeliverySlotController } from './delivery-slot.controller';
import { DeliverySlotService } from './delivery-slot.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "DeliverySlot", schema: DeliverySlotSchema }
		]),
		SharedServiceModule
	],
  controllers: [DeliverySlotController],
	providers: [DeliverySlotService],
	exports: [MongooseModule, DeliverySlotService]
})
export class DeliverySlotModule {}
