import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from 'src/profile/profile.module';
import { OrderSchema, OrderProductSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { CustomerAdminModule } from '../customer/customer.module';
import { ProductAdminModule } from '../product/product.module';
import { OrderAdminController } from './order.controller';
import { OrderAdminService } from './order.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Order", schema: OrderSchema },
			{ name: "OrderProduct", schema: OrderProductSchema },
		]),
		CustomerAdminModule,
		ProductAdminModule,
		SharedServiceModule,
		ProfileModule
	],
  controllers: [OrderAdminController],
  providers: [OrderAdminService],
	exports: [MongooseModule, OrderAdminService,]
})
export class OrderAdminModule {}
