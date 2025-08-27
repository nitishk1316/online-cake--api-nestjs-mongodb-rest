import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CartProduct, Coupon, CouponType } from 'src/shared/classes';
import { ICoupon } from 'src/shared/models';
import { LocaleService } from 'src/shared/services';
import { getCurrentDate } from 'src/shared/util';

/**
 * Coupon Service
 */
@Injectable()
export class CouponService {
	/**
   * Constructor
	 * @param couponModel
   */
  constructor(
		@InjectModel("Coupon") private readonly couponModel: Model<ICoupon>,
		private readonly localeService: LocaleService,
	) {}

	/**
	 *
	 * @param code
	 * @returns
	 */
	async verifyCode(code: string): Promise<Coupon> {
		const coupon = await this.couponModel.findOne({ code: code.toLowerCase() }).exec();
		if (!coupon)
			throw new BadRequestException(this.localeService.get('MSG_INVALID_COUPON_CODE'));

		const currentTime = getCurrentDate().toDate();
		if (coupon.startDate < currentTime && coupon.endDate > currentTime)
			return coupon;
		else
			throw new BadRequestException(this.localeService.get('MSG_COUPON_EXPIRED'));
	}

	async calculateDiscount(code: string, products: CartProduct[]): Promise<number> {
		const coupon = await this.verifyCode(code);
		const typeProducts =  products.filter(p => p.type == coupon.type);
		let subTotal = 0;
		let discount = 0;
		typeProducts.map(p => subTotal += p.total);

		if (coupon.minAmount > subTotal)
			throw new BadRequestException(this.localeService.get('MSG_COUPON_NOT_APPLICABLE'));

		if (coupon.couponType === CouponType.PERCENTAGE) {
			discount = Number((subTotal * (coupon.discount / 100)).toFixed(2));
			if (discount > coupon.maxDiscount) discount = coupon.maxDiscount;
		}
		else if (coupon.couponType === CouponType.AMOUNT) {
			discount = Number(coupon.discount);
			if (discount > subTotal) discount = subTotal;
		}
		return discount;
	}
}
