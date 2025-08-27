import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Flavour, ImageTag } from 'src/shared/classes';
import { LocaleService } from 'src/shared/services';
import { resizeImage } from 'src/shared/util';
import { FlavourService } from "./flavour.service";

/**
 * Flavour Controller
 */
@Controller('/flavours')
export class FlavourController {
  /**
   * Constructor
   * @param flavourService
	 */
	constructor(
		private readonly flavourService: FlavourService,
		private readonly localeService: LocaleService,
	) { }

	@Get("/")
	async getAll(): Promise<Flavour[]> {
		const data = await this.flavourService.getAll();
		let flavours = data as Flavour[];
		flavours.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return flavours;
	}

	@Get("/popular")
	async getAllPopular(): Promise<Flavour[]> {
		const flavours = await this.flavourService.getAllPopular();
		let data = flavours as Flavour[];
		data.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return data;
	}

	@Get("/:flavourId")
	async getById(@Param("flavourId") flavourId: number): Promise<Flavour> {
		const flavour = await this.flavourService.getById(flavourId);
		if (!flavour) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return flavour;
	}
}