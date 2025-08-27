import { Module } from '@nestjs/common';
import { BannerAdminModule } from './banner/banner.module';
import { CouponAdminModule } from './coupon/coupon.module';
import { DealAdminModule } from './deal/deal.module';
import { DCAdminModule } from './delivery-coverage/delivery-coverage.module';
import { DeliverySlotAdminModule } from './delivery-slot/delivery-slot.module';
import { NotificationAdminModule } from './notification/notification.module';
import { OrderAdminModule } from './order/order.module';
import { PageAdminModule } from './page/page.module';
import { PayMethodAdminModule } from './pay-method/pay-method.module';
import { ProductAdminModule } from './product/product.module';
import { ReportAdminModule } from './report/report.module';
import { SettingAdminModule } from './setting/setting.module';
import { CustomerAdminModule } from './customer/customer.module';
import { FlavourAdminModule } from './flavour/flavour.module';
import { OccasionAdminModule } from './occasion/occasion.module';
import { TypeAdminModule } from './type/type.module';

@Module({
	imports: [
		BannerAdminModule,
	  CouponAdminModule,
		DealAdminModule,
		DCAdminModule,
		DeliverySlotAdminModule,
		NotificationAdminModule,
		OrderAdminModule,
		PageAdminModule,
		PayMethodAdminModule,
		ProductAdminModule,
		SettingAdminModule,
		CustomerAdminModule,
		ReportAdminModule,
		FlavourAdminModule,
		OccasionAdminModule,
		TypeAdminModule
	],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
