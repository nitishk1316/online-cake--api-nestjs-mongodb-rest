import { Controller, Get, Param } from '@nestjs/common';
import { Page } from 'src/shared/classes';
import { PageService } from "./page.service";


/**
 * Page Controller
 */
@Controller('/pages')
export class PageController {
  /**
	 * Constructor
	 * @param pageService 
	 */
	constructor(
		private readonly pageService: PageService,
	) { }
	
	@Get("/:url")
	async getById(@Param("url") url: string): Promise<Page> {
		return await this.pageService.getByUrl(url);
	}
}
