import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { AddressPayload, DeleteResult, MapLocation } from 'src/shared/classes';
import { IAddress, IDeliveryCoverage, ISequence } from 'src/shared/models';

/**
 * Address Service
 */
@Injectable()
export class AddressService {
	/**
	 * Constructor
	 * @param addressModel
	 * @param dcModal
	 * @param sequenceService
	 */
  constructor(
		@InjectModel("Address") private readonly addressModel: Model<IAddress>,
		@InjectModel("DeliveryCoverage") private readonly dcModal: Model<IDeliveryCoverage>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	 * Get all address of a user
	 * @param userId
	 * @return IAddress[] - Array of address
	 */
	getAll(userId: number): Promise<IAddress[]> {
		return this.addressModel.find({ user: userId }, 'name address flat street mobileNumber addressType location country').exec();
	}

	/**
	 * Get address by address id
	 * @param userId
	 * @param addressId
	 * @return IAddress - address detail
	 */
	getById(userId: number, addressId: number): Promise<IAddress> {
		return this.addressModel.findOne({ _id: addressId, user: userId }, 'name address flat street mobileNumber addressType location country').exec();
	}

	/**
	 * Create address
	 * @param payload
	 * @return IAddress - address detail
	 */
	async create(payload: AddressPayload, userId: number): Promise<IAddress> {
		const data = { ...payload };
		const count = await this._getAddressId();

		data['_id'] = count.value;
		data['user'] = userId;
		return this.addressModel.create(data);
	}

	/**
	 * Update address by address id
	 * @param userId
	 * @param addressId
	 * @param payload
	 * @return UpdateWriteOpResult - update document object
	 */
	update(userId: number, addressId: number, payload: AddressPayload): Promise<UpdateWriteOpResult> {
		return this.addressModel.updateOne({ _id: addressId, user: userId }, payload).exec();
	}

	/**
	 * Delete address by address id
	 * @param userId
	 * @param addressId
	 * @return DeleteResult - delete document
	 */
	delete(userId: number, addressId: number): Promise<DeleteResult> {
		return this.addressModel.deleteOne({ _id: addressId, user: userId }).exec();
	}

	/**
	* Get delivery coverage
	* @param location
	* @return IDeliveryCoverage - Delivery Coverage
	*/
	validateUserLocation(location: MapLocation): Promise<IDeliveryCoverage> {
		return this.dcModal.findOne({ _id: 1, geometry: { $geoIntersects: { $geometry: { type: "Point", coordinates: [ location.longitude, location.latitude ] } } } }).exec();
	}

	private _getAddressId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "ADDRESS" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}