import {
	Controller,
	Get,
	Post,
	Put,
	Body,
	UsePipes,
	ValidationPipe,
	NotFoundException,
	UseGuards,
	Param,
	Query,
	BadRequestException,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	User,
	StoreAdmin,
	StoreAdminPayload,
	Message,
	DeliveryTaxAdmin,
	DeliveryTaxAdminPayload,
	CurrencyAdmin,
	ImageUpload
} from 'src/shared/classes';
import { GetUser, LocaleService, UploadService } from 'src/shared/services';
import { validateAdminRole, CurrencyList } from 'src/shared/util';
import { SettingAdminService } from './setting.service';

/**
 * Setting Admin Controller
 */
@Controller('/admin/settings')
@UseGuards(AuthGuard('jwt'))
export class SettingAdminController {
  /**
	 * Constructor
	 * @param settingService
	 * @param localeService
	 * @param uploadService
	 */
	constructor(
		private readonly settingService: SettingAdminService,
		private readonly localeService: LocaleService,
		private readonly uploadService: UploadService,
	) { }

	/**
	 * Get store
	 * @param user
	 * @returns
	 */
	@Get("/store")
	async get(@GetUser() user: User): Promise<StoreAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return await this.settingService.getStore();
	}

	/**
	 * Update store
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Put("/store")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Body() payload: StoreAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const setting = await this.settingService.updateStore(payload);
		if (setting.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Get delivery tax
	 * @param user
	 * @returns
	 */
	@Get("/delivery-tax")
		async getDeliveryTax(@GetUser() user: User): Promise<DeliveryTaxAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return await this.settingService.getDeliveryTax();
	}

	/**
	 * Update delivery tax
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Put("/delivery-tax")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async updateDeliveryTax(@GetUser() user: User, @Body() payload: DeliveryTaxAdminPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const setting = await this.settingService.updateDeliveryTax(payload);
		if (setting.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Get currency list
	 */
	@Get("/currencies/list")
	async list(@GetUser() user: User): Promise<CurrencyAdmin[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		return CurrencyList;
	}

	/**
	 * Get currency
	 * @param user
	 * @returns
	 */
	@Get("/currencies")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async getCurrency(@GetUser() user: User): Promise<CurrencyAdmin> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const data =  await this.settingService.getCurrency();
		return data.currency;
	}

	/**
	 * Update currency
	 * @param user
	 * @param currencyCode
	 * @returns
	 */
	@Put("/currencies/:currencyCode")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async currenyUpdate(@GetUser() user: User, @Param("currencyCode") currencyCode: string): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const selectedCurrency = CurrencyList.find(c => c.code === currencyCode);
		if (!selectedCurrency)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const currency = await this.settingService.updateCurrency({ code : selectedCurrency.code, symbol: selectedCurrency.symbol });
		if (currency.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Upload images
	 * @param user
	 * @param files
	 * @returns
	 */
	@Post('/upload')
	@UseInterceptors(FilesInterceptor("files"))
	public async imageUpload(@GetUser() user: User, @UploadedFiles() files): Promise<ImageUpload[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const response: ImageUpload[] = [];
		for(let i = 0; i < files.length; i++) {
			const file = files[i];
			const upload = await this.uploadService.uploadImage(file.buffer, file.originalname);
			response.push(upload);
		}
		return response;
	}
}