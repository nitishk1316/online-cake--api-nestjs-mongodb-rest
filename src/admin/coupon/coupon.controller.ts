import {
	Controller,
	Get,
	Post,
	Put,
	Param,
	Body,
	Query,
	Delete,
	UsePipes,
	ValidationPipe,
	NotFoundException,
	BadRequestException,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	User,
	CouponAdminList,
	CouponAdmin,
	CouponAdminPayload,
	Message,
	StatusPayload,
	CouponType,
	CouponAdminSearch
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { CouponAdminService } from './coupon.service';

/**
 * Coupon Admin Controller
 */
@Controller('/admin/coupons')
@UseGuards(AuthGuard('jwt'))
export class CouponAdminController {
   /**
	* Constructor
	* @param couponService
	* @param localeService
	*/
	constructor(
		private readonly couponService: CouponAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: CouponAdminSearch): Promise<CouponAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.couponService.validateAdminQuery(query);
		const coupon = await Promise.all([
			this.couponService.getAll(querySearch),
			this.couponService.countAll(querySearch)
		]);
		const data = coupon[0];
		const total = coupon[1];
		return { data, total };
	}

	/**
	 * Get by id
	 * @param user
	 * @param couponId
	 * @returns
	 */
	@Get("/:couponId")
	async getById(@GetUser() user: User, @Param("couponId") couponId: number): Promise<CouponAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const coupon = await this.couponService.getById(couponId);
		if (!coupon) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return coupon;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: CouponAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		payload = await this.validateCoupon(payload);
		const coupon = await this.couponService.create(payload);

		if (coupon && coupon._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param couponId
	 * @param payload
	 * @returns
	 */
	@Put("/:couponId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("couponId") couponId: number, @Body() payload: CouponAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		payload = await this.validateCoupon(payload);
		const couponInfo = await this.couponService.getById(couponId);
		if (!couponInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const coupon = await this.couponService.update(couponId, payload);
		if (coupon.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param couponId
	 * @returns
	 */
	@Delete("/:couponId")
	private async delete(@GetUser() user: User, @Param("couponId") couponId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const couponInfo = await this.couponService.getById(couponId);
		if (!couponInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const coupon = await this.couponService.delete(couponId);
		if (coupon.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param couponId
	 * @param payload
	 * @returns
	 */
	@Put("/:couponId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('couponId') couponId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const couponInfo = await this.couponService.getById(couponId);
		if (!couponInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.couponService.updateStatus(couponId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	* Validate Coupon Type with ites required fields
	* @param payload
	* @return CouponAdminPayload
	*/
	private async validateCoupon(payload: CouponAdminPayload): Promise<CouponAdminPayload> {
		if (payload.couponType === CouponType.PERCENTAGE) {
			if (payload.discount > 100)
				throw new BadRequestException(this.localeService.get('MSG_PERCENTAGE_LESS_100'));
		} else
			payload.couponType === CouponType.AMOUNT;

		if (payload.startDate > payload.endDate)
			throw new BadRequestException(this.localeService.get('MSG_ENDDATE_GREATER_STARTDATE'));

		return payload;
	}
}