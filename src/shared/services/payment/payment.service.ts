import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, OrderPaymentPayload, User, OrderPaymentStatus } from 'src/shared/classes';
import Stripe from 'stripe';
import { MyLoggerService } from '../mylogger/mylogger.service';

@Injectable()
export class PaymentService {
	private stripe: Stripe;

	/**
	 * constructor
	 * @param logger
	 * @param cacheService
	 */
	constructor(
		private readonly logger: MyLoggerService,
		private readonly configService: ConfigService,
	) {
	}

	/**
	 * Make payment by card
	 * @param obj
	 * @param user
	 * @param billingAddress
	 * @return OrderPayment
	 */
	 public async makePayment(obj: OrderPaymentPayload, user?: User, billingAddress?: Address): Promise<OrderPaymentStatus> {
		this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2025-07-30.basil' });
		const params: Stripe.PaymentIntentCreateParams = {
			amount: obj.amount,
			currency: obj.currency || 'USD',
			description: obj.description,
			confirmation_method: 'automatic',
			shipping: {
				name: null,
				address: {
					line1: null,
				}
			}
		}
		if (user && user.email) {
			params.receipt_email = user.email;
		}
		if (billingAddress) {
			params.shipping.name = billingAddress.name;
			params.shipping.address = {
				line1: billingAddress.address,
				country: billingAddress.country
			}
		}
		let intent: Stripe.PaymentIntent;
		try {
			intent = await this.stripe.paymentIntents.create(params);
			return { status: true, intent: intent };
		} catch (e) {
			this.logger.error(e.message);
			return  { status: false, message: e.message };;
		}
	}

	async getStatus(id: string): Promise<Stripe.PaymentIntent> {
		this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2025-07-30.basil' });
		return await this.stripe.paymentIntents.retrieve(id);
	}
	/**
	 *
	 * @param amount
	 * @param currency
	 * @param orderId
	 * @param userId
	 * @returns
	 */
	async createSession(amount: number, currency: string, orderId?: number, userId?: number): Promise<any> {
		const baseUrl = this.configService.get('WEBSITE_BASE_URL');
		this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2025-07-30.basil' });
		return await this.stripe.checkout.sessions.create({
			success_url: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/order-failed?session_id={CHECKOUT_SESSION_ID}`,
			payment_method_types: ['card'],
			mode: 'payment',
			metadata: {
				orderId: orderId,
				userId: userId
			},
			line_items: [
				{
					//name: 'Total Amount',
					price: String(amount),
					//currency: currency,
					quantity: 1,
				}
			]
		});
	}

	/**
	 *
	 * @param sessionId
	 * @returns
	 */
	async retriveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
		this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), { apiVersion: '2025-07-30.basil' });
		return await this.stripe.checkout.sessions.retrieve(sessionId);
	}
}