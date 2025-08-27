import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderProductSchema, OrderSchema, UserSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Order", schema: OrderSchema },
			{ name: "OrderProduct", schema: OrderProductSchema },
			{ name: "User", schema: UserSchema },
		]),
		SharedServiceModule
	],
  providers: [OrderService],
	controllers: [OrderController],
	exports: [MongooseModule, OrderService]
})
export class OrderModule {}
