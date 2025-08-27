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
import {
	CustomerAdmin,
	CustomerAdminList,
	CustomerAdminSearch,
	Message,
	StatusPayload,
	User
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { getDate, Roles, validateAdminRole } from 'src/shared/util';
import { CustomerAdminService } from './customer.service';

/**
 * Customer Admin Controller
 */
@Controller('/admin/customers')
@UseGuards(AuthGuard('jwt'))
export class CustomerAdminController {
    /**
	 * Constructor
	 * @param customerService
	 * @param localeService
	 */
	constructor(
		private readonly customerService: CustomerAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Gat all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async me(@GetUser() user: User, @Query() query: CustomerAdminSearch): Promise<CustomerAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.customerService.validateAdminQuery(query);
		const userTotal = await Promise.all([
			this.customerService.getAll(querySearch, Roles.CUSTOMER),
			this.customerService.countAll(querySearch, Roles.CUSTOMER)
		]);

		let users = JSON.parse(JSON.stringify(userTotal[0]));
		if (users) {
			users.forEach((u: CustomerAdmin) => {
				u.createdAt = getDate(u.createdAt)
			})
		}
		const total = userTotal[1];
		return { data: users, total };
	}

	/**
	 * Get by id
	 * @param user
	 * @param customerId
	 * @returns
	 */
	@Get("/:customerId")
	async getById(@GetUser() user: User, @Param("customerId") customerId: number): Promise<CustomerAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const userInfo = await this.customerService.getById(customerId);
		if (!userInfo) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return userInfo;
	}

	/**
	 * Block customer
	 * @param user
	 * @param customerId
	 * @param payload
	 * @returns
	 */
	@Put("/:customerId/block")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('customerId') customerId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const userInfo = await this.customerService.getCustomerById(customerId);
		if (!userInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.customerService.updateStatus(customerId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param customerId
	 * @returns
	 */
	@Delete("/:customerId")
	private async delete(@GetUser() user: User, @Param("customerId") customerId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const userInfo = await this.customerService.getCustomerById(customerId);
		if (!userInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (userInfo.orderPurchased > 0)
			throw new BadRequestException(this.localeService.get('MSG_USER_CANNOT_DELETE'));

		const userDelete = await this.customerService.delete(customerId);
		if (userDelete.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}
}
