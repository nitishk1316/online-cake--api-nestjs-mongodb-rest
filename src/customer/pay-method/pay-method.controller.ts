import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayMethod, User } from 'src/shared/classes';
import { GetUser } from 'src/shared/services';
import { validateCustomerRole } from 'src/shared/util';
import { PMService } from './pay-method.service';

/**
 * Pay Method User Controller
 */
@Controller('/pay-methods')
@UseGuards(AuthGuard('jwt'))
export class PMController {
  /**
   * Constructor
   * @param pmService
	 */
	constructor(
		private readonly pmService: PMService,
	) { }

	@Get("/")
	async getAll(@GetUser() user: User): Promise<PayMethod[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		return await this.pmService.getAllActive();
	}
}