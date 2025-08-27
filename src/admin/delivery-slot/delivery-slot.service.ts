import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { SlotPayload } from 'src/shared/classes';
import { IDeliverySlot } from 'src/shared/models';

/**
 * Delivery Slot Service
 */
@Injectable()
export class DSAdminService {
	/**
   * Constructor
	 * @param deliverySlotModel
	 */
  constructor(
		@InjectModel("DeliverySlot") private readonly deliverySlotModel: Model<IDeliverySlot>,
	) {}

	/**
	* Get all slots of a week
	* @return IDeliverySlot[] - list of delivery slot
	*/
	getAll(): Promise<IDeliverySlot[]> {
		return this.deliverySlotModel.find({ }, '-timings._id -__v -createdAt -updatedAt').sort({ _id: 1 }).exec();
	}

	/**
	* Get delivery slot by dayId
	* @param dayId
	* @return IDeliverySlot - Delivery slot
	*/
	getByDayId(dayId: number): Promise<IDeliverySlot> {
		return this.deliverySlotModel.findOne({ _id: dayId }).exec();
	}

	/**
	* Update delivery slot by dayId
	* @param dayId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(dayId: number, payload: SlotPayload): Promise<UpdateWriteOpResult> {
		return this.deliverySlotModel.updateOne({ _id: dayId }, payload).exec();
	}
}
