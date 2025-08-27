import { Controller, Get, Param } from '@nestjs/common';
import { Deal, ImageTag } from 'src/shared/classes';
import { IDeal } from 'src/shared/models';
import { resizeImage } from 'src/shared/util';
import { DealService } from './deal.service';

/**
 * Deal Controller
 */
@Controller('/deals')
export class DealController {
	/**
	 * Constructor
	 * @param dealService
	 */
	constructor(
		private readonly dealService: DealService,
	) { }

	@Get("/")
	async getAll(): Promise<Deal[]> {
		const deals = await this.dealService.getAllForUser();
		deals.forEach(b => b['image'] = resizeImage(ImageTag.DEAL, b.image));
		return deals;
	}

	@Get("/:dealId")
	async getById(@Param('dealId') dealId: number): Promise<Deal> {
		const deals = await this.dealService.getByIdInfo(dealId);
		if (deals && deals.length > 0) return deals[0];
		return null;
	}
}
