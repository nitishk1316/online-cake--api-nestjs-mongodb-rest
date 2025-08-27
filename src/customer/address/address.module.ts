import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchema, DeliveryCoverageSchema, SequenceSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Address", schema: AddressSchema },
			{ name: "DeliveryCoverage", schema: DeliveryCoverageSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule
	],
	controllers: [AddressController],
	providers: [AddressService],
	exports: [MongooseModule, AddressService],
})
export class AddressModule {}