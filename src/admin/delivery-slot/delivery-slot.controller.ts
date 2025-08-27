import {
	Controller,
	Get,
	Put,
	Param,
	Body,
	UsePipes,
	ValidationPipe,
	NotFoundException,
	BadRequestException,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User, SlotAdmin, SlotPayload, Message, TimingPayload } from 'src/shared/classes';
import { GetUser, LocaleService } from 'src/shared/services';
import {
	validateAdminRole,
	getWeekday,
	getSlotDateDay,
	getSlotTime
} from 'src/shared/util';
import { DSAdminService } from './delivery-slot.service';

/**
 * Delivery Slots Admin Controller
 */
@Controller('/admin/delivery-slots')
@UseGuards(AuthGuard('jwt'))
export class DSAdminController {
  /**
	 * Constructor
	 * @param deliverySlotService
	 * @param localeService
	 */
	constructor(
		private readonly deliverySlotService: DSAdminService,
		private readonly localeService: LocaleService,
	) { }

	/**
	 * Gat all
	 * @param user
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User): Promise<SlotAdmin[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		let slots = await this.deliverySlotService.getAll();
		let temp: SlotAdmin[] = JSON.parse(JSON.stringify(slots));
		let deliverySlot: SlotAdmin[] = [];

		const currentDay = getWeekday();
		for (let i = currentDay; i < currentDay + 7; i++) {
			deliverySlot.push(temp[i%7]);
		}

		deliverySlot = deliverySlot.map((d, i) => {
			d.date = getSlotDateDay(i + 1);
			return d;
		});
		return deliverySlot;
	}

	/**
	 * Update
	 * @param user
	 * @param dayId
	 * @param payload
	 * @returns
	 */
	@Put("/:dayId")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("dayId") dayId: number, @Body() payload: SlotPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		payload.timings = this.validationTimeSlots(payload.timings, dayId);

		const dsInfo = await this.deliverySlotService.getByDayId(dayId);
		if (!dsInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const deliverySlot = await this.deliverySlotService.update(dayId, payload);
		if (deliverySlot.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	* Validate Time slot open close timing
	* @param payload
	* @param dayId
	* @return TimingAdminPayload[] -  Updated payload
	*/
	private validationTimeSlots(timings: TimingPayload[], dayId: number): TimingPayload[] {
		timings = timings.sort((a, b) => (a.open > b.open) ? 1 : -1);

		for (var j = 0; j < timings.length; j++) {
			const open = timings[j].open;
			const close = timings[j].close;
			if (open < 0 || open > 1410)
				throw new BadRequestException(this.localeService.get('MSG_INVALID_TIME_RANGE'));

			if (close < 0 || close > 1410)
				throw new BadRequestException(this.localeService.get('MSG_INVALID_TIME_RANGE'));

			if (open === close)
				throw new BadRequestException(this.localeService.get('MSG_CANNOT_SAME_OPEN_CLOSE'));

			if (open % 30 !== 0)
				throw new BadRequestException(this.localeService.get('MSG_INVALID_MINUTE_RANGE'));

			if (close % 30 !== 0)
				throw new BadRequestException(this.localeService.get('MSG_INVALID_MINUTE_RANGE'));

			if (open > close)
				throw new BadRequestException(this.localeService.get('MSG_INVALID_CLOSE_TIME'));

			timings[j].time = getSlotTime(open) + " - " + getSlotTime(close);
			timings[j].key = `${dayId}-${open}-${close}`;
		}
		return timings;
	}
}