import { Module } from '@nestjs/common';
import { ReportAdminController } from './report.controller';
import { SharedServiceModule } from 'src/shared/services';
import { OrderAdminModule } from '../order/order.module';
import { SettingAdminModule } from '../setting/setting.module';
import { ProductAdminModule } from '../product/product.module';
import { TypeAdminModule } from '../type/type.module';

@Module({
	imports: [
		SettingAdminModule,
		ProductAdminModule,
		OrderAdminModule,
		TypeAdminModule,
		SharedServiceModule
	],
  providers: [],
  controllers: [ReportAdminController]
})
export class ReportAdminModule {}
