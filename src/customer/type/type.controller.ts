import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Type, ImageTag } from 'src/shared/classes';
import { LocaleService } from 'src/shared/services';
import { resizeImage } from 'src/shared/util';
import { TypeService } from "./type.service";

/**
 * Type Controller
 */
@Controller('/types')
export class TypeController {
  /**
   * Constructor
   * @param typeService
	 */
	constructor(
		private readonly typeService: TypeService,
		private readonly localeService: LocaleService,
	) { }

	@Get("/")
	async getAll(): Promise<Type[]> {
		const data = await this.typeService.getAll();
		let types = data as Type[];
		types.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return types;
	}

	@Get("/popular")
	async getAllPopular(): Promise<Type[]> {
		const types = await this.typeService.getAllPopular();
		let data = types as Type[];
		data.forEach(b => b['image'] = resizeImage(ImageTag.TYPE, b.image));
		return data;
	}

	@Get("/:typeId")
	async getById(@Param("typeId") typeId: number): Promise<Type> {
		const type = await this.typeService.getById(typeId);
		if (!type) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return type;
	}
}