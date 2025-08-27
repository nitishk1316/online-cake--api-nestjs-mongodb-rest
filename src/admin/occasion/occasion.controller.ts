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
	UseGuards,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	User,
	OccasionAdminSearch,
	OccasionAdminList,
	OccasionAdmin,
	OccasionAdminPayload,
	Message,
	StatusPayload,
	OccasionAdminDropdown
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { OccasionAdminService } from './occasion.service';

/**
 * Occasion Admin Controller
 */
@Controller('/admin/occasions')
@UseGuards(AuthGuard('jwt'))
export class OccasionAdminController {
  /**
	 * Constructor
	 * @param occasionService
	 * @param localeService
	 */
	constructor(
		private readonly occasionService: OccasionAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get all occasion
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: OccasionAdminSearch): Promise<OccasionAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.occasionService.validateAdminQuery(query);

		const occasion = await Promise.all([
			this.occasionService.getAll(querySearch),
			this.occasionService.countAll(querySearch)
		]);
		const data = occasion[0];
		const total = occasion[1];
		return { data, total };
	}

	/**
	 * Get occasion dropdown
	 * @param user
	 * @returns
	 */
	@Get("/dropdown")
	async getAllList(@GetUser() user: User): Promise<OccasionAdminDropdown[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return this.occasionService.getAllList();
	}

	/**
	 * Get occasion detail by id
	 * @param user
	 * @param occasionId
	 * @returns
	 */
	@Get("/:occasionId")
	async getById(@GetUser() user: User, @Param("occasionId") occasionId: number): Promise<OccasionAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const occasion = await this.occasionService.getById(occasionId);
		if (!occasion) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		return occasion;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
  @UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: OccasionAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const occasion = await this.occasionService.create(payload);

		if (occasion && occasion._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param occasionId
	 * @param payload
	 * @returns
	 */
	@Put("/:occasionId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("occasionId") occasionId: number, @Body() payload: OccasionAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const occasionInfo = await this.occasionService.getById(occasionId);
		if (!occasionInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const occasion = await this.occasionService.update(occasionId, payload);
		if (occasion.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param occasionId
	 * @returns
	 */
	@Delete("/:occasionId")
	private async delete(@GetUser() user: User, @Param("occasionId") occasionId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const occasionInfo = await this.occasionService.getById(occasionId);
		if (!occasionInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const occasion = await this.occasionService.delete(occasionId);
		if (occasion.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param occasionId
	 * @param payload
	 * @returns
	 */
	@Put("/:occasionId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('occasionId') occasionId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const occasionInfo = await this.occasionService.getById(occasionId);
		if (!occasionInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.occasionService.updateStatus(occasionId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}