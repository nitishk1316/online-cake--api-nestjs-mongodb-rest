import {
	Controller,
	Get,
	NotFoundException,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IDeliverySlot } from 'src/shared/models';
import { DeliverySlot, Timing, User } from 'src/shared/classes';
import {
	getSlotDate,
	getSlotDay,
	getSlotTime,
	getWeekday,
	validateCustomerRole
} from 'src/shared/util';
import { DeliverySlotService } from './delivery-slot.service';
import { GetUser } from 'src/shared/services';

/**
 * DeliverySlot Controller
 */
@Controller('/delivery-slots')
@UseGuards(AuthGuard('jwt'))
export class DeliverySlotController {
  /**
	* Constructor
	* @param deliverySlotService
	*/
	constructor(
		private readonly deliverySlotService: DeliverySlotService,
	) { }

	@Get("/")
	async getAll(@GetUser() user: User): Promise<DeliverySlot[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		let allSlots = await this.deliverySlotService.getForUser();
		allSlots = JSON.parse(JSON.stringify(allSlots));
		let deliverySlot: IDeliverySlot[] = [];
		let slots: DeliverySlot[] = [];
		const currentDay = getWeekday();

		for (let i = currentDay; i < currentDay + 7; i++) {
			deliverySlot.push(allSlots[i%7]);
		}

		deliverySlot.forEach((d, i) => {
			if (d.isOpen) {
				let slot: DeliverySlot = {
					_id: d._id,
					date: getSlotDate(i + 1),
					day: getSlotDay(i + 1),
					timings: []
				};

				d.timings.forEach(t => {
					if (t.isOpen) {
						let time: Timing = {
							time: getSlotTime(t.open) + ' - ' + getSlotTime(t.close),
							key: t.key
						};
						slot.timings.push(time);
					}
				});
				slots.push(slot);
			}
		});
		return slots;
	}
}
