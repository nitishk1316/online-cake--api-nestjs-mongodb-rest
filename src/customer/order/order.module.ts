import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderProductSchema, OrderSchema, SequenceSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { ProfileModule } from 'src/profile/profile.module';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Order", schema: OrderSchema },
			{ name: "OrderProduct", schema: OrderProductSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule,
		ProfileModule,
		ProductModule,
	],
  providers: [OrderService],
	controllers: [OrderController],
	exports: [MongooseModule, OrderService]
})
export class OrderModule {}
