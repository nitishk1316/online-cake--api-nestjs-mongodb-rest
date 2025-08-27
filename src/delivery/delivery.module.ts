import { Module } from '@nestjs/common';
import { LocaleService } from 'src/shared/services';
import { OrderModule } from './order/order.module';

@Module({
	imports: [
		OrderModule
	],
  controllers: [],
  providers: [LocaleService],
  exports: [],
})
export class DeliveryModule {}