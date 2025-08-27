import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IDeliverySlot } from 'src/shared/models';
import { Model } from "mongoose";
import { OrderSlot } from 'src/shared/classes';
import { addDaysToDate, addMinutesToDate, getCurrentDate } from 'src/shared/util';

/**
 * Delivery Slot Service
 */
@Injectable()
export class DeliverySlotService {
	/**
   * Constructor
	 * @param deliverySlotModel
	 */
  constructor(
		@InjectModel("DeliverySlot") private readonly deliverySlotModel: Model<IDeliverySlot>,
	) {}

	/**
	* Get slots for next few day for user
	* @return IDeliverySlot[] - List of delivery slot
	*/
	getForUser(): Promise<IDeliverySlot[]> {
		return this.deliverySlotModel.find({ }, '-_id -timings._id -__v -createdAt -updatedAt').sort({ _id: 1 }).exec();
	}

	/**
	* Get slots by key
	* @param key
	* @return IDeliverySlot
	*/
	getByKey(key: string): Promise<IDeliverySlot> {
		return this.deliverySlotModel.findOne({ 'timings.key': key, isOpen: true }, '-timings._id -__v -createdAt -updatedAt').exec();
	}

	/**
	 * Verify Slot
	 * @param slotKey
	 * @returns
	 */
	async verifySlot(slotKey: string): Promise<OrderSlot> {
		const response: OrderSlot = {
			key: null,
			date: null,
			startTime: null,
			endTime: null
		}
		const slots = await this.deliverySlotModel.findOne({ 'timings.key': slotKey, isOpen: true });
		if (!slots) return response;

		const slot = slots.timings.find(s => s.key == slotKey);
		if (!slots) return response;

		const currentDay = getCurrentDate().isoWeekday();
		let addDay = slots._id;
		if (addDay < currentDay + 1) addDay += 7;

		if (slot && slot.isOpen) {
			response.date = addDaysToDate(addDay);
			response.key = slot.key;
			response.startTime = addMinutesToDate(response.date, slot.open);
			response.endTime = addMinutesToDate(response.date, slot.close);
			return response;
		}
		else
			return response;
	}
}
