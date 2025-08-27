import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { CouponSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Coupon", schema: CouponSchema },
		]),
		SharedServiceModule
	],
  providers: [CouponService],
	exports: [MongooseModule, CouponService]
})
export class CouponModule {}
