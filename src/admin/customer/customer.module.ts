import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/authentication/auth.module';
import { SequenceSchema, UserSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { CustomerAdminController } from './customer.controller';
import { CustomerAdminService } from './customer.service';
import { DeliveryAdminController } from './delivery.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "User", schema: UserSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		AuthModule,
		SharedServiceModule
	],
  controllers: [CustomerAdminController, DeliveryAdminController],
  providers: [CustomerAdminService],
	exports: [MongooseModule, CustomerAdminService]
})
export class CustomerAdminModule {}
