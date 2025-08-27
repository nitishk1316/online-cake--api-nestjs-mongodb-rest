import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';
import { BannerModule } from './banner/banner.module';
import { DealModule } from './deal/deal.module';
import { DeliverySlotModule } from './delivery-slot/delivery-slot.module';
import { PageModule } from './page/page.module';
import { PayMethodModule } from './pay-method/pay-method.module';
import { ProductModule } from './product/product.module';
import { SettingModule } from './setting/setting.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { LocaleService } from 'src/shared/services';
import { FlavourModule } from './flavour/flavour.module';
import { OccasionModule } from './occasion/occasion.module';
import { TypeModule } from './type/type.module';

@Module({
	imports: [
		AddressModule,
		BannerModule,
		DealModule,
		DeliverySlotModule,
		PageModule,
		PayMethodModule,
		ProductModule,
		SettingModule,
		WishlistModule,
		CartModule,
		OrderModule,
		FlavourModule,
		OccasionModule,
		TypeModule
	],
  controllers: [],
  providers: [LocaleService],
  exports: [],
})
export class CustomerModule {}