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
	FlavourAdminSearch,
	FlavourAdminList,
	FlavourAdmin,
	FlavourAdminPayload,
	Message,
	StatusPayload,
	FlavourAdminDropdown
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { FlavourAdminService } from './flavour.service';

/**
 * Flavour Admin Controller
 */
@Controller('/admin/flavours')
@UseGuards(AuthGuard('jwt'))
export class FlavourAdminController {
  /**
	 * Constructor
	 * @param flavourService
	 * @param localeService
	 */
	constructor(
		private readonly flavourService: FlavourAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get all flavour
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: FlavourAdminSearch): Promise<FlavourAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.flavourService.validateAdminQuery(query);

		const flavour = await Promise.all([
			this.flavourService.getAll(querySearch),
			this.flavourService.countAll(querySearch)
		]);
		const data = flavour[0];
		const total = flavour[1];
		return { data, total };
	}

	/**
	 * Get flavour dropdown
	 * @param user
	 * @returns
	 */
	@Get("/dropdown")
	async getAllList(@GetUser() user: User): Promise<FlavourAdminDropdown[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return this.flavourService.getAllList();
	}

	/**
	 * Get flavour detail by id
	 * @param user
	 * @param flavourId
	 * @returns
	 */
	@Get("/:flavourId")
	async getById(@GetUser() user: User, @Param("flavourId") flavourId: number): Promise<FlavourAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const flavour = await this.flavourService.getById(flavourId);
		if (!flavour) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		return flavour;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
  @UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: FlavourAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const flavour = await this.flavourService.create(payload);

		if (flavour && flavour._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param flavourId
	 * @param payload
	 * @returns
	 */
	@Put("/:flavourId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("flavourId") flavourId: number, @Body() payload: FlavourAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const flavourInfo = await this.flavourService.getById(flavourId);
		if (!flavourInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const flavour = await this.flavourService.update(flavourId, payload);
		if (flavour.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param flavourId
	 * @returns
	 */
	@Delete("/:flavourId")
	private async delete(@GetUser() user: User, @Param("flavourId") flavourId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const flavourInfo = await this.flavourService.getById(flavourId);
		if (!flavourInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const flavour = await this.flavourService.delete(flavourId);
		if (flavour.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param flavourId
	 * @param payload
	 * @returns
	 */
	@Put("/:flavourId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('flavourId') flavourId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const flavourInfo = await this.flavourService.getById(flavourId);
		if (!flavourInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.flavourService.updateStatus(flavourId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}