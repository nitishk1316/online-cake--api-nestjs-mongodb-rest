import {
	Controller,
	Get,
	Put,
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, DCAdmin, DCAdminPayload, Message, Geometry } from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateAdminRole } from 'src/shared/util';
import { DCAdminService } from './delivery-coverage.service';

/**
 * Delivery Coverage Admin Controller
 */
@Controller('/admin/delivery-coverage')
@UseGuards(AuthGuard('jwt'))
export class DCAdminController {
  /**
   * Constructor
   * @param dcService
	 * @param localeService
	 */
	constructor(
		private readonly dcService: DCAdminService,
		private readonly localeService: LocaleService,
	) {
	}

	/**
	 * Get
	 * @param user
	 * @returns
	 */
	@Get("/")
	async getById(@GetUser() user: User): Promise<DCAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const deliveryCoverage = await this.dcService.getById();
		if (!deliveryCoverage) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		let response: DCAdmin = {
			_id: deliveryCoverage._id,
			name: deliveryCoverage.name,
			coordinates: []
		};
		let geometry = deliveryCoverage.geometry.coordinates[0];
		geometry.forEach(p => {
			response.coordinates.push({ latitude: p[1], longitude: p[0] });
		});
		return response;
	}

	/**
	 * Update
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Put("/")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Body() payload: DCAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		let coordinates = [];
		coordinates[0] = [];
		payload.coordinates.forEach(p => {
			coordinates[0].push([p.longitude, p.latitude]);
		});
		const deliveryCoverage = await this.dcService.update({ type: 'Polygon', coordinates: coordinates } as Geometry);
		if (deliveryCoverage.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}