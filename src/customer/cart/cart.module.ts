import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from '../product/product.service';
import { SettingService } from '../setting/setting.service';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { AddressModule } from '../address/address.module';
import { DeliverySlotModule } from '../delivery-slot/delivery-slot.module';
import { LocaleService, SharedServiceModule } from 'src/shared/services';
import { CartSchema } from 'src/shared/models';
import { ProfileModule } from 'src/profile/profile.module';
import { CouponModule } from '../coupon/coupon.module';
import { SettingModule } from '../setting/setting.module';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Cart", schema: CartSchema },
		]),
		AddressModule,
		DeliverySlotModule,
		NotificationModule,
		OrderModule,
		ProfileModule,
		CouponModule,
		ProductModule,
		SettingModule,
		SharedServiceModule
	],
  providers: [
		CartService,
		ProductService,
		SettingService,
		LocaleService,
	],
	controllers: [CartController],
	exports: [MongooseModule, CartService]
})
export class CartModule {}