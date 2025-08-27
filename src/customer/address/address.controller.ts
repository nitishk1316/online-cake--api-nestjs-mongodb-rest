import {
	Controller,
	Get,
	Post,
	Put,
	Param,
	Body,
	Delete,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';
import { AddressService } from "./address.service";
import { AuthGuard } from '@nestjs/passport';
import { Address, User, AddressPayload, Message } from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import { validateCustomerRole } from 'src/shared/util';

/**
 * Address Controller
 */
@Controller('/address')
@UseGuards(AuthGuard('jwt'))
export class AddressController {
  /**
	 * Constructor
	 * @param addressService
	 * @param localeService
	 */
	constructor(
		private readonly addressService: AddressService,
		private readonly localeService: LocaleService,
	) { }

	@Get("/")
	async getAll(@GetUser() user: User): Promise<Address[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		return await this.addressService.getAll(user._id);
	}

	@Get("/:addressId")
	async getById(@GetUser() user: User, @Param("addressId") addressId: number): Promise<Address> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const address = await this.addressService.getById(user._id, addressId);
		if (!address)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		return address;
	}

	@Post("/")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: AddressPayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const isDeliver = await this.addressService.validateUserLocation(payload.location);
		if (!isDeliver)
		 	throw new BadRequestException(this.localeService.get('MSG_DELIVERY_LOCATION_NOT_AVAILABLE'));

		const address = await this.addressService.create(payload, user._id);
		if (!address)
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));

		return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
	}

	@Put("/:addressId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("addressId") addressId: number, @Body() payload: AddressPayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const addressInfo = await this.addressService.getById(user._id, addressId);
		if (!addressInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const isDeliver = await this.addressService.validateUserLocation(payload.location);
		if (!isDeliver)
			throw new BadRequestException(this.localeService.get('MSG_DELIVERY_LOCATION_NOT_AVAILABLE'));

		const address = await this.addressService.update(user._id, addressId, payload);
		if (address.modifiedCount != 1)
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));

			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
	}

	@Delete("/:addressId")
	private async delete(@GetUser() user: User, @Param("addressId") addressId: number): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const addressInfo = await this.addressService.getById(user._id, addressId);
		if (!addressInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const address = await this.addressService.delete(user._id, addressId);
		if (address.deletedCount != 1)
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));

		return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
	}
}