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
	DealAdminList,
	DealAdmin,
	DealAdminPayload,
	Message,
	StatusPayload,
	DealAdminSearch
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { DealAdminService } from './deal.service';

/**
 * Deal Admin Controller
 */
@Controller('/admin/deals')
@UseGuards(AuthGuard('jwt'))
export class DealAdminController {
  /**
	 * Constructor
	 * @param dealService
	 * @param localeService
	 */
	constructor(
		private readonly dealService: DealAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: DealAdminSearch): Promise<DealAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.dealService.validateAdminQuery(query);
		const deal = await Promise.all([
			this.dealService.getAll(querySearch),
			this.dealService.countAll(querySearch)
		]);
		const data = deal[0];
		const total = deal[1];
		return { data, total };
	}

	/**
	 * Get by id
	 * @param user
	 * @param dealId
	 * @returns
	 */
	@Get("/:dealId")
	async getById(@GetUser() user: User, @Param("dealId") dealId: number): Promise<DealAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const deal = await this.dealService.getById(dealId);
		if (!deal) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return deal;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: DealAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const deal = await this.dealService.create(payload);
		if (deal && deal._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param dealId
	 * @param payload
	 * @returns
	 */
	@Put("/:dealId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("dealId") dealId: number, @Body() payload: DealAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const dealInfo = await this.dealService.getById(dealId);
		if (!dealInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const deal = await this.dealService.update(dealId, payload);
		if (deal.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param dealId
	 * @returns
	 */
	@Delete("/:dealId")
	private async delete(@GetUser() user: User, @Param("dealId") dealId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const dealInfo = await this.dealService.getById(dealId);
		if (!dealInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const deal = await this.dealService.delete(dealId);
		if (deal.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param dealId
	 * @param payload
	 * @returns
	 */
	@Put("/:dealId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('dealId') dealId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const dealInfo = await this.dealService.getById(dealId);
		if (!dealInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.dealService.updateStatus(dealId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}