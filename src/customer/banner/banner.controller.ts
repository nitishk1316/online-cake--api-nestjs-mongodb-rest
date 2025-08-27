import { Controller, Get } from '@nestjs/common';
import { Banner, ImageTag } from 'src/shared/classes';
import { resizeImage } from 'src/shared/util';
import { BannerService } from "./banner.service";

/**
 * Banner Controller
 */
@Controller('/banners')
export class BannerController {
  /**
   * Constructor
   * @param bannerService
	 */
	constructor(
		private readonly bannerService: BannerService,
	) { }
	
	@Get("/")
	async getAll(): Promise<Banner[]> {
		const data = await this.bannerService.getAllForUser();
		let banners = data as Banner[];
		banners.forEach(b => b['image'] = resizeImage(ImageTag.BANNER, b.image));
		return banners;
	}
}