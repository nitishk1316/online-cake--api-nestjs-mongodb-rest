import {
	Controller,
	Get,
	Put,
	Param,
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	User,
	PageAdminList,
	PageAdmin,
	PagePayload,
	Message,
	StatusPayload
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { PageAdminService } from './page.service';

/**
 * Page Admin Controller
 */
@Controller('/admin/pages')
@UseGuards(AuthGuard('jwt'))
export class PageAdminController {
  /**
	 * Constructor
	 * @param pageService
	 * @param localeService
	 */
	constructor(
		private readonly pageService: PageAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get all
	 * @param user
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User): Promise<PageAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const page = await this.pageService.getAll();
		return { data: page, total: page.length };
	}

	/**
	 * Get by id
	 * @param user
	 * @param pageId
	 * @returns
	 */
	@Get("/:pageId")
	async getById(@GetUser() user: User, @Param("pageId") pageId: string): Promise<PageAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const page = await this.pageService.getById(pageId);
		if (!page) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return page;
	}

	/**
	 * Update
	 * @param user
	 * @param pageId
	 * @param payload
	 * @returns
	 */
	@Put("/:pageId")
  @UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("pageId") pageId: string, @Body() payload: PagePayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const pageInfo = await this.pageService.getById(pageId);
		if (!pageInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const page = await this.pageService.update(pageId, payload);
		if (page.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param pageId
	 * @param payload
	 * @returns
	 */
	@Put("/:pageId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('pageId') pageId: string, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const pageInfo = await this.pageService.getById(pageId);
		if (!pageInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.pageService.updateStatus(pageId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}