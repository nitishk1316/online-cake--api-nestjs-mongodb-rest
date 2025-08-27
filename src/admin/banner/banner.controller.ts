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
	BannerAdminList,
	BannerAdmin,
	BannerAdminPayload,
	Message,
	StatusPayload,
	BannerType,
	BannerAdminSearch
} from 'src/shared/classes';
import { IBanner } from 'src/shared/models';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { BannerAdminService } from './banner.service';

/**
 * Banner Admin Controller
 */
@Controller('/admin/banners')
@UseGuards(AuthGuard('jwt'))
export class BannerAdminController {
    /**
	 * Constructor
	 * @param bannerService
	 * @param localeService
	 */
	constructor(
		private readonly bannerService: BannerAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Get all banner
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: BannerAdminSearch): Promise<BannerAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.bannerService.validateAdminQuery(query);
		const banner = await Promise.all([
			this.bannerService.getAll(querySearch),
			this.bannerService.countAll(querySearch)
		]);
		const data = banner[0];
		const total = banner[1];
		return { data, total };
	}

	@Get("/:bannerId")
	async getById(@GetUser() user: User, @Param("bannerId") bannerId: number): Promise<BannerAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const banner = await this.bannerService.getById(bannerId);
		if (!banner) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return banner;
		}

	/**
	 * Create banner
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
	private async create(@GetUser() user: User, @Body() payload: BannerAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		payload = await this.validateBannerType(payload);
		const banner: IBanner = await this.bannerService.create(payload);

		if (banner && banner._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update banner
	 * @param user
	 * @param bannerId
	 * @param payload
	 * @returns
	 */
	@Put("/:bannerId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("bannerId") bannerId: number, @Body() payload: BannerAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		payload = await this.validateBannerType(payload);

		const bannerInfo = await this.bannerService.getById(bannerId);
		if (!bannerInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const banner = await this.bannerService.update(bannerId, payload);
		if (banner.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete banner
	 * @param user
	 * @param bannerId
	 * @returns
	 */
	@Delete("/:bannerId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async delete(@GetUser() user: User, @Param("bannerId") bannerId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const bannerInfo = await this.bannerService.getById(bannerId);
		if (!bannerInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const banner = await this.bannerService.delete(bannerId);
		if (banner.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update banner status
	 * @param user
	 * @param bannerId
	 * @param payload
	 * @returns
	 */
	@Put("/:bannerId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('bannerId') bannerId: number, @Body() payload: StatusPayload): Promise<Message> {
	  if (!validateAdminRole(user.role)) throw new NotFoundException();

		const bannerInfo = await this.bannerService.getById(bannerId);
		if (!bannerInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.bannerService.updateStatus(bannerId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	* Validate Banner Type with ites required fields
	* @param payload
	* @return BannerAdminPayload - Updated payload
	*/
	private async validateBannerType(payload: BannerAdminPayload): Promise<BannerAdminPayload> {
		if (payload.bannerType === BannerType.TYPE && !payload.type)
			throw new BadRequestException(this.localeService.get('MSG_TYPE_MISSING'));
		else if (payload.bannerType === BannerType.EXTERNAL && !payload.link)
			throw new BadRequestException(this.localeService.get('MSG_LINK_MISSING'));

		if (payload.bannerType === BannerType.TYPE)
			payload.link = null;
		else if (payload.bannerType === BannerType.EXTERNAL)
			payload.type = null;
		else {
			payload.bannerType = BannerType.NONE;
			payload.link = null;
			payload.type = null;
		}
		return payload;
	}
}