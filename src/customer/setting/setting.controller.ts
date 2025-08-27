import { Controller, Get } from '@nestjs/common';
import { Setting } from 'src/shared/classes';
import { SettingService } from "./setting.service";

/**
 * Setting Controller
 */
@Controller('/settings')
export class SettingController {
  /**
   * Constructor
   * @param settingService
	 */
	constructor(
		private readonly settingService: SettingService,
	) { }
	
	@Get("/")
	async getAll(): Promise<Setting> {
		return await this.settingService.getForUser();
	}
}
