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
	TypeAdminSearch,
	TypeAdminList,
	TypeAdmin,
	TypeAdminPayload,
	Message,
	StatusPayload,
	TypeAdminDropdown
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { TypeAdminService } from './type.service';

/**
 * Type Admin Controller
 */
@Controller('/admin/types')
@UseGuards(AuthGuard('jwt'))
export class TypeAdminController {
  /**
	 * Constructor
	 * @param typeService
	 * @param localeService
	 */
	constructor(
		private readonly typeService: TypeAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get all type
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: TypeAdminSearch): Promise<TypeAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.typeService.validateAdminQuery(query);

		const type = await Promise.all([
			this.typeService.getAll(querySearch),
			this.typeService.countAll(querySearch)
		]);
		const data = type[0];
		const total = type[1];
		return { data, total };
	}

	/**
	 * Get type dropdown
	 * @param user
	 * @returns
	 */
	@Get("/dropdown")
	async getAllList(@GetUser() user: User): Promise<TypeAdminDropdown[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return this.typeService.getAllList();
	}

	/**
	 * Get type detail by id
	 * @param user
	 * @param typeId
	 * @returns
	 */
	@Get("/:typeId")
	async getById(@GetUser() user: User, @Param("typeId") typeId: number): Promise<TypeAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const type = await this.typeService.getById(typeId);
		if (!type) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		return type;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
  @UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: TypeAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const type = await this.typeService.create(payload);

		if (type && type._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param typeId
	 * @param payload
	 * @returns
	 */
	@Put("/:typeId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("typeId") typeId: number, @Body() payload: TypeAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const typeInfo = await this.typeService.getById(typeId);
		if (!typeInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const type = await this.typeService.update(typeId, payload);
		if (type.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param typeId
	 * @returns
	 */
	@Delete("/:typeId")
	private async delete(@GetUser() user: User, @Param("typeId") typeId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const typeInfo = await this.typeService.getById(typeId);
		if (!typeInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const type = await this.typeService.delete(typeId);
		if (type.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param typeId
	 * @param payload
	 * @returns
	 */
	@Put("/:typeId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('typeId') typeId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const typeInfo = await this.typeService.getById(typeId);
		if (!typeInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.typeService.updateStatus(typeId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}