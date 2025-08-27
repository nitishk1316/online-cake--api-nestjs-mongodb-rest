import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliverySlotSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { DSAdminController } from './delivery-slot.controller';
import { DSAdminService } from './delivery-slot.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "DeliverySlot", schema: DeliverySlotSchema }
		]),
		SharedServiceModule
	],
  controllers: [DSAdminController],
  providers: [DSAdminService]
})
export class DeliverySlotAdminModule {}
