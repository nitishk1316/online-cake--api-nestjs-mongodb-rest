import {
	Controller,
	Get,
	Query,
	Put,
	UseGuards,
	Body,
	UsePipes,
	ValidationPipe,
	Param,
	NotFoundException,
	BadRequestException,
	Delete,
	Post
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/authentication/auth.service';
import {
	DeliveryAdmin,
	DeliveryAdminList,
	DeliveryAdminSearch,
	DeliveryPayload,
	Message,
	StatusPayload,
	User
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { getDate, Roles, validateAdminRole, validateEmail } from 'src/shared/util';
import { CustomerAdminService } from './customer.service';

/**
 * Delivery Admin Controller
 */
@Controller('/admin/delivery')
@UseGuards(AuthGuard('jwt'))
export class DeliveryAdminController {
    /**
	 * Constructor
	 * @param customerService
	 * @param localeService
	 * @param authService
	 */
	constructor(
		private readonly customerService: CustomerAdminService,
		private readonly localeService: LocaleService,
		private readonly authService: AuthService,
	) { }

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async me(@GetUser() user: User, @Query() query: DeliveryAdminSearch): Promise<DeliveryAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.customerService.validateAdminQuery(query);
		const userTotal = await Promise.all([
			this.customerService.getAll(querySearch, Roles.DELIVERY),
			this.customerService.countAll(querySearch, Roles.DELIVERY)
		]);

		let users = JSON.parse(JSON.stringify(userTotal[0]));
		if (users) {
			users.forEach((u: DeliveryAdmin) => {
				u.createdAt = getDate(u.createdAt)
			})
		}
		const total = userTotal[1];
		return { data: users, total };
	}

	/**
	 * Get delivery list
	 * @param user
	 * @returns
	 */
	@Get("/list")
	async list(@GetUser() user: User): Promise<DeliveryAdmin[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return await this.customerService.getDeliveryList();
	}

	/**
	 * Get by id
	 * @param user
	 * @param deliveryId
	 * @returns
	 */
	@Get("/:deliveryId")
	async getById(@GetUser() user: User, @Param("deliveryId") deliveryId: number): Promise<DeliveryAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const userInfo = await this.customerService.getDeliveryById(deliveryId);
		if (userInfo) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return userInfo;
	}

	/**
	 * Create delivery
	 * @param payload
	 * @returns
	 */
	@Post('/create')
	@UsePipes(new ValidationPipe({ whitelist: true }))
  public async register(@Body() payload: DeliveryPayload): Promise<Message> {
		if (payload.email == '') payload.email = null;

		if(payload.email && !validateEmail(payload.email))
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_EMAIL_FORMAT'));

		if(payload.mobileNumber && isNaN(parseInt(payload.mobileNumber)))
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_MOBILE_FORMAT'));

		const checkUser = await this.customerService.getByEmailOrMobile(payload.email, payload.mobileNumber);
		let message: string;

		if (checkUser && checkUser.active) {
			if (checkUser.email == payload.email)
				message = this.localeService.get('MSG_AUTH_EMAIL_ALREADY');
			else if (checkUser.mobileNumber == payload.mobileNumber)
				message = this.localeService.get('MSG_AUTH_MOBILE_ALREADY');
			throw new BadRequestException(message);
		} else {
			const { salt, hashedPassword } = await this.authService.hashPassword(payload.password);
			const user = await this.customerService.createDelivery(payload);
			if (!user)
				throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));

			return { status: true, message: this.localeService.get('MSG_CREATE_SUCCESS') } as Message;
		}
	}

	/**
	 * Block delivery
	 * @param user
	 * @param deliveryId
	 * @param payload
	 * @returns
	 */
	@Put("/:deliveryId/block")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('deliveryId') deliveryId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const userInfo = await this.customerService.getDeliveryById(deliveryId);
		if (!userInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.customerService.updateStatus(deliveryId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete delivery
	 * @param user
	 * @param deliveryId
	 * @returns
	 */
	@Delete("/:deliveryId")
	private async delete(@GetUser() user: User, @Param("deliveryId") deliveryId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const userInfo = await this.customerService.getDeliveryById(deliveryId);
		if (!userInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (userInfo.orderDelivered > 0)
			throw new BadRequestException(this.localeService.get('MSG_USER_CANNOT_DELETE'));

		const coupon = await this.customerService.delete(deliveryId);
		if (coupon.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}
}
