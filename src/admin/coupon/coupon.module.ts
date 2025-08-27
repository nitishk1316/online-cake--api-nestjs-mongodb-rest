import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponSchema, SequenceSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { CouponAdminController } from './coupon.controller';
import { CouponAdminService } from './coupon.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Coupon", schema: CouponSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule
	],
  controllers: [CouponAdminController],
  providers: [CouponAdminService]
})
export class CouponAdminModule {}
