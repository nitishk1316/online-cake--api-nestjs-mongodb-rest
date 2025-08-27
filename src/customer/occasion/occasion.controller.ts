import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ImageTag, Occasion } from 'src/shared/classes';
import { LocaleService } from 'src/shared/services';
import { resizeImage } from 'src/shared/util';
import { OccasionService } from "./occasion.service";

/**
 * Occasion Controller
 */
@Controller('/occasions')
export class OccasionController {
  /**
   * Constructor
   * @param occasionService
	 */
	constructor(
		private readonly occasionService: OccasionService,
		private readonly localeService: LocaleService,
	) { }

	@Get("/")
	async getAll(): Promise<Occasion[]> {
		const data = await this.occasionService.getAll();
		let occasions = data as Occasion[];
		occasions.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return occasions;
	}

	@Get("/popular")
	async getAllPopular(): Promise<Occasion[]> {
		const occasions = await this.occasionService.getAllPopular();
		let data = occasions as Occasion[];
		data.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return data;
	}

	@Get("/:occasionId")
	async getById(@Param("occasionId") occasionId: number): Promise<Occasion> {
		const occasion = await this.occasionService.getById(occasionId);
		if (!occasion) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return occasion;
	}
}