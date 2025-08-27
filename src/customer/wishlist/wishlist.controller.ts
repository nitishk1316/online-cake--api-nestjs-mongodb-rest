import {
	Controller,
	Get,
	Put,
	Param,
	Delete,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, LocaleService } from 'src/shared/services';
import { ImageTag, Message, Product, User, Wishlist } from 'src/shared/classes';
import { resizeImage, validateCustomerRole } from 'src/shared/util';
import { ProductService } from '../product/product.service';
import { WishlistService } from "./wishlist.service";

/**
 * Wishlist Controller
 */
@Controller('/wishlist')
@UseGuards(AuthGuard('jwt'))
export class WishlistController {
  /**
	 * Constructor
	 * @param wishlistService
	 * @param productService
	 * @param localeService
	 */
	constructor(
		private readonly wishlistService: WishlistService,
		private readonly productService: ProductService,
		private readonly localeService: LocaleService
	) { }



	@Get("/")
	async getWishlistProducts(@GetUser() user: User): Promise<Product[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const wishlist =  await this.wishlistService.getAllById(user._id);
		const wishlistPrducts = wishlist.map(m => m.productId);

		let products: Product[] = [];

		if (wishlistPrducts.length > 0) {
			products = await this.productService.getByIds(wishlistPrducts);
			products = products.filter(p => p.active == true)
			products.forEach(b => {
				b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail);
			});
		}
		return products;
	}

	@Get("/:productId")
	async isWishlist(@GetUser() user: User, @Param('productId') productId: number): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const wishlist = await this.wishlistService.validateInWishlist(user._id, productId);
		if (wishlist && wishlist.productId) return { status: true, message: "YES" };
		else return { status: false, message: "NO" };

	}

	@Put("/:productId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Param('productId') productId: number): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		await this.wishlistService.add(user._id, productId);
		return { message: this.localeService.get('MSG_WISHLIST_ADDED') };
	}

	@Delete("/:productId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async delete(@GetUser() user: User, @Param('productId') productId: number): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		await this.wishlistService.remove(user._id, productId);
		return { message: this.localeService.get('MSG_WISHLIST_REMOVED') };
	}
}