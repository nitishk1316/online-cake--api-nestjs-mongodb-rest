import { Schema, Document } from 'mongoose';
import { Tax, CartCoupon, Address, OrderAssign, User, OrderPayment, OrderSlot, Currency } from 'src/shared/classes';

/**
 * Order Schema
 */
export const OrderSchema = new Schema({
	_id: { type: Number },
	user: {
		_id: { type: Number },
		firstName: { type: String },
		lastName: { type: String },
		email: { type: String },
		mobileNumber: { type: String },
	},
	deliveryAddress: {
		_id: { type: Number },
		name: { type: String },
		address: { type: String },
		flat: { type: String },
		street: { type: String },
		mobileNumber: { type: String },
		addressType: { type: String },
		location: {
			latitude: { type: Number },
			longitude: { type: Number },
		},
		country: { type: String },
	},
	subTotal: { type: Number, default: 0 },
	payTotal: { type: Number, default: 0 },
	grandTotal: { type: Number, default: 0 },
	tax: {
		title: { type: String },
		percent: { type: Number, default: 0 },
	},
	taxType: { type: String },
	taxPrice: { type: Number, default: 0 },
	deliveryCharges: { type: Number, default: 0 },
	currency: {
		code: { type: String },
		symbol: { type: String }
	},
	count: { type: Number },
	slot: {
		date: { type: Date },
		startTime: { type: Date },
		endTime: { type: Date },
	},
	coupon: {
		code: { type: String },
		discount: { type: Number, default: 0 },
	},
  method: { type: String },
	isWeb: { type: Boolean },
	payment: { type: Object },
	paymentId: { type: String },
  paymentStatus: { type: String },
  status: { type: String },
	isAssigned: { type: Boolean, default: false },
	deliveryAccepted: { type: Boolean, default: false },
	deliveryAssign: {
		_id: { type: Number },
		name: { type: String },
	},
	isWalletUsed: { type: Boolean, default: false },
	walletAmount: { type: Number, default: 0 },
},
{
	timestamps: true,
});

OrderSchema.index({
  _id: 1,
  status: 1,
  method: 1,
  'user.firstName': 1,
  'user.lastName': 1,
  'user.email': 1,
  'user.mobileNumber': 1,
});

/**
 * Order Document
 */
export interface IOrder extends Document {
  readonly _id: number;
  readonly user: User;
  readonly deliveryAddress: Address;
	readonly subTotal: number;
	readonly payTotal: number;
	readonly grandTotal: number;
	readonly deliveryCharges: number;
	readonly tax: Tax;
	readonly taxType: string;
	readonly taxPrice: number;
	readonly coupon: CartCoupon;
  readonly currency: Currency;
  readonly count: number;
  readonly slot: OrderSlot;
  readonly method: string;
	readonly paymentId: string;
  readonly payment: Object;
  readonly status: string;
  readonly paymentStatus: string;
  readonly createdAt: string;
	readonly updatedAt: string;
	readonly isAssigned: boolean;
	readonly deliveryAccepted: boolean;
	readonly deliveryAssign: OrderAssign;
	readonly isWalletUsed: boolean;
	readonly walletAmount: number;
	readonly isWeb: boolean;
}
