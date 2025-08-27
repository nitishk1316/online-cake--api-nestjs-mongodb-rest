import {
	Controller,
	Get,
	Put,
	Param,
	Body,
	UsePipes,
	ValidationPipe,
	NotFoundException,
	UseGuards,
	BadGatewayException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, PayAdmin, Message, StatusPayload } from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { PMAdminService } from './pay-method.service';

/**
 * Pay method Admin Controller
 */
@Controller('/admin/pay-methods')
@UseGuards(AuthGuard('jwt'))
export class PMAdminController {
  /**
	 * Constructor
	 * @param pmService
	 * @param localeService
	 */
	constructor(
		private readonly pmService: PMAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Get all
	 * @param user
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User): Promise<PayAdmin[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		return await this.pmService.getAll();
	}

	/**
	 * Update status
	 * @param user
	 * @param method
	 * @param payload
	 * @returns
	 */
	@Put("/:method/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('method') method: string, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const pmInfo = await this.pmService.getByMethod(method);
		if (!pmInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.pmService.updateStatus(method, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadGatewayException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}