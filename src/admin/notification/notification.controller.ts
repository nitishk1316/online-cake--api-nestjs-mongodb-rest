import {
	Controller,
	Get,
	Put,
	Param,
	Query,
	Delete,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException,
	UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	User,
	QueryParams,
	NotificationAdminList,
	NotificationAdminUnread,
	Message
} from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole, validateQuery } from 'src/shared/util';
import { NotificationAdminService } from './notification.service';


/**
 * Notification Admin Controller
 */
@Controller('/admin/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationAdminController {
  /**
   * Constructor
   * @param notificationService
	 * @param localeService
	 */
	constructor(
		private readonly notificationService: NotificationAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: QueryParams): Promise<NotificationAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const { page, limit } = validateQuery(query);
		const notification = await Promise.all([
			this.notificationService.getAll({ page, limit }),
			this.notificationService.countAll()
		]);
		const data = notification[0];
		const total = notification[1];
		return { data, total };
	}

	/**
	 * Count unread
	 * @param user
	 * @returns
	 */
	@Get("/unread")
	async countUnread(@GetUser() user: User): Promise<NotificationAdminUnread> {
		if (!validateAdminRole(user.role)) throw new UnauthorizedException();
		const count = await this.notificationService.countUnread();
		return { count };
	}

	/**
	 * Update read all
	 * @param user
	 * @returns
	 */
	@Put("/all-read")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async markAllAsRead(@GetUser() user: User): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const markRead = await this.notificationService.markAllRead();
		if (markRead.modifiedCount)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Read notification
	 * @param user
	 * @param id
	 * @returns
	 */
	@Put("/:id/read")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async markRead(@GetUser() user: User, @Param('id') id: string): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const notifyInfo = await this.notificationService.getById(id);
		if (!notifyInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const markRead = await this.notificationService.markRead(id);
		if (markRead.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param id
	 * @returns
	 */
	@Delete("/:id")
	private async delete(@GetUser() user: User, @Param("id") id: string): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const notifyInfo = await this.notificationService.getById(id);
		if (!notifyInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const notify = await this.notificationService.delete(id);
		if (notify.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}
}