import {
	Controller,
	Post,
	Put,
	Param,
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException,
	Headers,
	Get,
	Delete,
	Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from 'src/profile/profile.service';
import {
	User,
	Cart,
	CartPayload,
	Message,
	TaxType,
	CartProduct,
	PaymentType,
	Product,
	CartPlacePayload,
	Variant,
	OrderProduct,
	CakeMessagePayload,
} from 'src/shared/classes';
import { ICart } from 'src/shared/models';
import {
	GetUser,
	LocaleService,
	OptionalJwtAuthGuard,
	PaymentService,
	PushService,
} from 'src/shared/services';
import {
	validateCustomerRole,
} from 'src/shared/util';
import { AddressService } from '../address/address.service';
import { CouponService } from '../coupon/coupon.service';
import { DeliverySlotService } from '../delivery-slot/delivery-slot.service';
import { NotificationService } from '../notification/notification.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { SettingService } from '../setting/setting.service';
import { CartService } from './cart.service';

@Controller('/carts')
export class CartController {
	/**
	 *
	 * @param cartService
	 * @param localeService
	 * @param settingService
	 * @param productService
	 * @param addressService
	 * @param paymentService
	 * @param dsService
	 * @param orderService
	 * @param profileService
	 * @param notifyService
	 * @param couponService
	 * @param pushService
	 */
	constructor(
		private readonly cartService: CartService,
		private readonly localeService: LocaleService,
		private readonly settingService: SettingService,
		private readonly productService: ProductService,
		private readonly addressService: AddressService,
		private readonly paymentService: PaymentService,
		private readonly dsService: DeliverySlotService,
		private readonly orderService: OrderService,
		private readonly profileService: ProfileService,
		private readonly notifyService: NotificationService,
		private readonly couponService: CouponService,
		private readonly pushService: PushService,
	) { }

	/**
	 * Get cart
	 * @param user
	 * @param anonymousId
	 */
	@Get("/")
	@UseGuards(OptionalJwtAuthGuard)
	async getCart(@GetUser() user: User, @Headers('anonymousId') anonymousId: string): Promise<any> {

		let cartInfo: Cart = await this._getMyCart(user, anonymousId);
		if (cartInfo.products.length > 0) {
			const cp = await this._verifyAvailability(cartInfo.products);
			cartInfo.products = cp.products;
		}

		cartInfo = await this._calculatePrice(cartInfo);
		await this.cartService.update(cartInfo._id, cartInfo);
		return cartInfo;
	}

	/**
	 * Get or Update cart item
	 * @param user
	 * @param payload
	 * @param anonymousId
	 */
	@Post("/")
	@UseGuards(OptionalJwtAuthGuard)
	async updateCart(@GetUser() user: User, @Body() payload: CartPayload, @Headers('anonymousId') anonymousId: string): Promise<any> {
		const product = await this.productService.getById(payload._id);
		if (!product) throw new BadRequestException(this.localeService.get('MSG_OUT_OF_STOCK'));

		const variant = product.variants.find(v => v.sku == payload.sku);
		if (!variant) throw new BadRequestException(this.localeService.get('MSG_OUT_OF_STOCK'));

		const stockStatus = this._verifyStock(product, variant, payload.quantity);
		if (!stockStatus)
			throw new BadRequestException(this.localeService.get('MSG_ONLY_LEFT', { name: product.title, stock: variant.stock }));

		let cartInfo: Cart = await this._getMyCart(user, anonymousId);
		const productIndex = cartInfo.products.findIndex(val => val.sku == payload.sku);

		if (productIndex != -1)
			cartInfo.products[productIndex] = this._updateCartProduct(cartInfo.products[productIndex], variant, payload.quantity);
		else
			cartInfo.products.push(this._createCartProduct(product, variant, payload.quantity, payload.eggless));

		cartInfo.products = cartInfo.products.filter(p => p.quantity > 0);

		cartInfo.isWalletUsed = false;
		cartInfo.walletAmount = 0;
		cartInfo.coupon.code = null;
		cartInfo.coupon.discount = 0;

		cartInfo = await this._calculatePrice(cartInfo);
		await this.cartService.update(cartInfo._id, cartInfo);
		return cartInfo;
	}

	/**
	 * Check cart
	 * @param user
	 * @param anonymousId
	 */
	 @Get("/check")
	 @UseGuards(AuthGuard('jwt'))
	 async checkCart(@GetUser() user: User, @Headers('anonymousId') anonymousId: string): Promise<any> {
		if (!anonymousId) throw new BadRequestException('NO anonymousId');

		let cartInfo: Cart = await this.cartService.getByAnonymousId(anonymousId);
		let mergedProducts = {};
		if (cartInfo)
			cartInfo.products.forEach(p => mergedProducts[p._id] = p);

		let userCartInfo: Cart = await this.cartService.getByUser(user._id);
		if (!userCartInfo) userCartInfo = await this._getMyCart(user, null);

		userCartInfo.products.forEach(p => mergedProducts[p._id] = p);

		userCartInfo.products = Object.values(mergedProducts);
		userCartInfo = await this._calculatePrice(userCartInfo);

		this.cartService.deleteCartByAnonymousId(anonymousId);
		await this.cartService.update(userCartInfo._id, userCartInfo);
		return userCartInfo;
	}

	/**
	 * Add address in cart
	 * @param user
	 * @param addressId
	 */
	@Put("/address/:addressId")
	@UseGuards(AuthGuard('jwt'))
	private async applyAddress(@GetUser() user: User, @Param('addressId') addressId: number): Promise<Message> {
		let cart = await this._verifyUserAndCart(user);

		const address = await this.addressService.getById(user._id, addressId);
		if (!address) throw new BadRequestException(this.localeService.get('MSG_CART_ADDRESS_NOT_AVAILABLE'));

		await this.cartService.updateAddress(cart._id, address._id);
		return { message: this.localeService.get('MSG_CART_ADDRESS_UPDATE_SUCCESS') };
	}

	/**
	 * Update Delivery Slot
	 * @param user
	 * @param slotId
	 */
	@Put("/delivery-slots/:slotId")
	@UseGuards(AuthGuard('jwt'))
	private async applyDS(@GetUser() user: User, @Param('slotId') slotId: string): Promise<Message> {
		let cart = await this._verifyUserAndCart(user);

		const slot = await this.dsService.verifySlot(slotId);
		if (!slot.key) throw new BadRequestException(this.localeService.get('MSG_SLOT_NOT_AVAILABLE'));

		await this.cartService.updateSlot(cart._id, slot.key);
		return { message: this.localeService.get('MSG_CART_SLOT_UPDATE_SUCCESS') };
	}

	/**
	 * Add coupon
	 * @param user
	 * @param couponCode
	 */
	@Put("/coupon/:couponCode")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	@UseGuards(AuthGuard('jwt'))
	private async applyCoupon(@GetUser() user: User, @Param('couponCode') couponCode: string): Promise<Cart> {
		let cartInfo = await this._verifyUserAndCart(user);
		const discount = await this.couponService.calculateDiscount(couponCode, cartInfo.products);

		cartInfo.coupon.code = couponCode;
		cartInfo.coupon.discount = discount;
		if (discount > cartInfo.payTotal) {
			cartInfo.coupon.discount = cartInfo.payTotal;
		}

		cartInfo = await this._calculatePrice(cartInfo);

		await this.cartService.update(cartInfo._id, cartInfo);
		cartInfo.message = this.localeService.get('MSG_CART_COUPON_APPLIED');

		return cartInfo;
	}

	/**
	 * Remove coupon
	 * @param user
	 */
	@Delete("/coupon")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	@UseGuards(AuthGuard('jwt'))
	private async removeCoupon(@GetUser() user: User): Promise<Cart> {
		let cart = await this._verifyUserAndCart(user);

		cart.coupon.code = null;
		cart.coupon.discount = 0;
		cart = await this._calculatePrice(cart);

		await this.cartService.update(cart._id, cart);
		cart.message = this.localeService.get('MSG_CART_COUPON_REMOVED');

		return cart;
	}

	/**
	 * Appy wallet in cart
	 * @param user
	 */
	@Put("/wallet/apply")
	@UseGuards(AuthGuard('jwt'))
	private async applyWallet(@GetUser() user: User): Promise<Cart> {
		let cart = await this._verifyUserAndCart(user);

		const userInfo = await this.profileService.getById(user._id);
		cart.isWalletUsed = true;
		cart.walletAmount = userInfo.walletAmount;
		if (userInfo.walletAmount >= cart.grandTotal) cart.walletAmount = cart.grandTotal;

		cart = await this._calculatePrice(cart);

		await this.cartService.update(cart._id, cart);
		cart.message = this.localeService.get('MSG_CART_WALLET_APPLIED');

		return cart;
	}

	/**
	 * Remove wallet in cart
	 * @param user
	 */
	 @Put("/wallet/remove")
	 @UseGuards(AuthGuard('jwt'))
	 private async removeWallet(@GetUser() user: User): Promise<Cart> {
		let cart = await this._verifyUserAndCart(user);

		cart.isWalletUsed = false;
		cart.walletAmount = 0;

		cart = await this._calculatePrice(cart);

		await this.cartService.update(cart._id, cart);
		cart.message = this.localeService.get('MSG_CART_WALLET_REMOVED');

		return cart;
	}

	/**
	 * Add message
	 * @param user
	 * @param file
	 * @returns
	 */
	 @Post('/:sku/message')
	 @UseGuards(AuthGuard('jwt'))
	 public async imageUpload(@GetUser() user: User, @Param('sku') sku: string, @Body() payload: CakeMessagePayload): Promise<Message> {
		let cartInfo = await this._verifyUserAndCart(user);

		const productIndex = cartInfo.products.findIndex(val => val.sku == sku);
		if (productIndex == -1)
			throw new BadRequestException(this.localeService.get('MSG_NOT_FOUND'));

		const product = cartInfo.products[productIndex];

		await this.cartService.updateMessage(cartInfo._id, product.sku, payload.message);
		return { message: this.localeService.get('MSG_CART_MESSAGE_UPDATE_SUCCESS') };
	}

	/**
	 * Order place
	 * @param user
	 * @param payload
	 */
	@Put("/place")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	@UseGuards(AuthGuard('jwt'))
	private async placeOrder(@GetUser() user: User, @Body() payload: CartPlacePayload, @Query('isWeb') isWeb: boolean): Promise<any> {
		let cart = await this._verifyUserAndCart(user);
		const checkout = await this._verifyAvailability(cart.products);
		if (!checkout.status) throw new BadRequestException(this.localeService.get('MSG_CART_PRODUCT_UNAVAILABLE'));

		const address = await this.addressService.getById(user._id, cart.address);
		if (!address) throw new BadRequestException(this.localeService.get('MSG_CART_ADDRESS_NOT_AVAILABLE'));

		const slot = await this.dsService.verifySlot(cart.slot);
		if (!slot.key) throw new BadRequestException(this.localeService.get('MSG_SLOT_NOT_AVAILABLE'));

		if (cart.coupon.code) await this.couponService.verifyCode(cart.coupon.code);

		const userInfo = await this.profileService.getById(user._id);
		if (cart.isWalletUsed || cart.walletAmount > 0) {
			if (cart.walletAmount > userInfo.walletAmount) throw new BadRequestException('MSG_INSUFFICIENT_WALLET_BALANCE');
		}

		let method = payload.method;
		if (!(payload.method == PaymentType.COD || payload.method == PaymentType.CARD))
			method = PaymentType.COD;

		const { order, orderProducts } = await this.orderService.create(userInfo, address, cart, slot, method);
		if (order && orderProducts) {
			if (cart.isWalletUsed) {
				this.profileService.creditToWallet({
					user: userInfo._id,
					order: order._id,
					amount: cart.walletAmount
				});
			}
			await this.cartService.delete(cart._id);
			this.notifyService.createOrder({ orderId: order._id });

			this.profileService.updatePurchased(user._id);
			orderProducts.forEach((p: OrderProduct) => {
				this.productService.decrementStock(p.productId, p.sku, p.quantity);
			});

			if (user.playerId) {
				this.pushService.sendToCustomer(
					this.localeService.get('MSG_CUSTOMER_NOTIFY_ORDER_PLACED_TITLE'),
					this.localeService.get('MSG_CUSTOMER_NOTIFY_ORDER_PLACED_DESC', { orderId: order._id.toString() }),
					user.playerId
				);
			}

			if (method == PaymentType.CARD) {
				const amount = Number((cart.payTotal * 100).toFixed(0));
				if (isWeb) {
					const session = await this.paymentService.createSession(amount, cart.currency.code, order._id, userInfo._id);
					await this.orderService.updatePaymentId(order._id, session['id'], isWeb);
					return { status: true, id: session['id'] };
				} else {
					const paymentDeatil = await this.paymentService.makePayment({
						amount: amount,
						currency: cart.currency.code,
						description: 'Cake - user id: ' + user._id
					}, user, address);
					if (!paymentDeatil.status) throw new BadRequestException(paymentDeatil.message);
					await this.orderService.updatePaymentId(order._id, paymentDeatil.intent.client_secret, false);
					return { status: true, id: paymentDeatil.intent.client_secret };
				}
			} else {
				return { status: true, id: order._id };
			}
		}
		return { status: false };
	}

	/**
	 * Verify user logged in and get user cart id
	 * @param user - user detail
	 * @return Cart
	 */
	private async _verifyUserAndCart(user: User): Promise<Cart> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const cart = await this.cartService.getByUser(user._id);
		if (!cart)
			throw new BadRequestException(this.localeService.get('MSG_NOT_FOUND'));

		if (cart.products.length == 0)
			throw new BadRequestException(this.localeService.get("MSG_CART_PRODUCT_UNAVAILABLE"));
		return cart.toObject();
	}

	/**
	 * Verify cart product availablity
	 * @param itemList
	 * @return Checkout
	 */
	private async _verifyAvailability(itemList: CartProduct[]): Promise<{ status: boolean, products: CartProduct[]}> {
		let productIds = itemList.map(p => p._id);
    productIds = [...new Set(productIds)];

		const products = await this.productService.getByIds(productIds);
		let status = true;
		let cartProduct: CartProduct[] = [];

		itemList.forEach(async (pro: CartProduct) => {
			const product = products.find(q => q._id === pro._id);
	    if (product && product.active) {
				const variant = product.variants.find(v => v.sku == pro.sku);
				if (variant) {
					if (variant.stock <= 0) {
						status = false;
						pro.outOfStock = true;
						pro = this._updateCartProduct(pro, variant, 0);
					}
					else if (pro.quantity > variant.stock) {
						status = false;
						pro = this._updateCartProduct(pro, variant, variant.stock);
					}
					else
						pro = this._updateCartProduct(pro, variant, pro.quantity);

					cartProduct.push(pro);
				} else {
					status = false;
				}
			} else {
				status = false;
			}
		});
		return { status: status, products: cartProduct };
	}

	/**
	 *
	 * @param cartInfo
	 * @returns
	 */
	private async _calculatePrice(cartInfo: Cart): Promise<Cart> {
		cartInfo.subTotal = 0;
		cartInfo.count = 0;
		cartInfo.products.forEach((product: CartProduct) => {
			cartInfo.subTotal += product.total;
			cartInfo.count += product.quantity;
		});

		let deliveryCharges = 0;
		if (cartInfo.subTotal > cartInfo.minimumForFree) deliveryCharges = 0;
		else deliveryCharges = cartInfo.applyDeliveryCharges;
		cartInfo.deliveryCharges = deliveryCharges;

		let tax = 0;
		if (cartInfo.taxType == TaxType.EXCLUDED)
			tax = Number((cartInfo.subTotal * (cartInfo.tax.percent / 100)).toFixed(2));
		cartInfo.taxPrice = tax;

		cartInfo.grandTotal = cartInfo.subTotal + cartInfo.deliveryCharges + cartInfo.taxPrice - cartInfo.coupon.discount;;
		cartInfo.payTotal = cartInfo.subTotal + cartInfo.deliveryCharges + cartInfo.taxPrice - cartInfo.coupon.discount - cartInfo.walletAmount;

		return cartInfo;
	}

	/**
	 *
	 * @param user
	 * @param anonymousId
	 * @returns
	 */
	private async _getMyCart(user: User, anonymousId?: string): Promise<Cart> {
		let cart: ICart;
		let cartInfo: Cart
		if (user && user._id) {
			cart = await this.cartService.getByUser(user._id);
		} else {
			if (!anonymousId) throw new BadRequestException('NO anonymousId');
			cart = await this.cartService.getByAnonymousId(anonymousId);
		}
		if (cart) cartInfo = cart.toObject();
		if (!cartInfo) {
			let cartInfo: Cart = await this.cartService.create(user._id, anonymousId);
			let settings = await this.settingService.getForOrder();
			cartInfo.minimumForFree = settings.minimumForFree;
			cartInfo.applyDeliveryCharges = settings.deliveryCharges;
			cartInfo.currency = settings.currency;
			cartInfo.taxType = settings.taxType;
			cartInfo.tax = settings.tax;
			await this.cartService.update(cartInfo._id, cartInfo);
			return cartInfo;
		}
		return cartInfo;
	}

	/**
	 *
	 * @param product
	 * @param variant
	 * @param quantity
	 * @returns
	 */
	private _createCartProduct(product: Product, variant: Variant, quantity: number, eggless: boolean): CartProduct {
		const cartProduct: CartProduct = {
			_id: product._id,
			title: product.title,
			slug: product.slug,
			thumbnail: product.thumbnail,
			sku: variant.sku,
			capacity: variant.capacity,
			sellingPrice: variant.sellingPrice,
			originalPrice: variant.originalPrice,
			discount: variant.discount,
			type: product.type,
			flavour: product.flavour,
			occasion: product.occasion,
			quantity: quantity,
			total: variant.sellingPrice * quantity,
			eggless: eggless
		};
		return cartProduct;
	}

	/**
	 *
	 * @param cartProduct
	 * @param variant
	 * @param quantity
	 * @returns
	 */
	private _updateCartProduct(cartProduct: CartProduct, variant: Variant, quantity: number): CartProduct {
		return {
			...cartProduct,
			sellingPrice: variant.sellingPrice,
			originalPrice: variant.originalPrice,
			discount: variant.discount,
			quantity: quantity,
			total: variant.sellingPrice * quantity,
		};
	}

	/**
	 *
	 * @param product
	 * @param variant
	 * @param quantity
	 * @returns
	 */
	private _verifyStock(product: Product, variant: Variant, quantity: number) {
		let status = true;
		if (variant.stock < 0) status = false;
		else if (quantity > variant.stock) status = false;
		return status;
	}
}
