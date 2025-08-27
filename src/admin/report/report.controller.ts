import {
	Controller,
	Get,
	NotFoundException,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportAdminTotal, ReportOrder, User } from 'src/shared/classes';
import { IOrder } from 'src/shared/models';
import { GetUser } from 'src/shared/services';
import { getDateForReport, getDateTime, validateAdminRole } from 'src/shared/util';
import { OrderAdminService } from '../order/order.service';
import { ProductAdminService } from '../product/product.service';
import { SettingAdminService } from '../setting/setting.service';
import { TypeAdminService } from '../type/type.service';

/**
 * Report Controller
 */
@Controller('/admin/reports')
@UseGuards(AuthGuard('jwt'))
export class ReportAdminController {
	/**
	 * Constructor
	 * @param productService
	 * @param orderService
	 * @param settingService
	 */
  constructor(
		private readonly productService: ProductAdminService,
		private readonly orderService: OrderAdminService,
		private readonly settingService: SettingAdminService,
		private readonly typeService: TypeAdminService,
	) {
	}

	@Get("/")
	async getAll(@GetUser() user: User): Promise<ReportAdminTotal> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const report = await Promise.all([
			this.productService.countAll({}),
			this.orderService.getOrderAndTotal(),
			this.settingService.getCurrency(),
			this.typeService.countAll({}),
		]);

		return {
			product: report[0],
			order: report[1].order,
			amount: report[1].amount,
			currency: report[2].currency.code,
			type: report[3],
		};
	}

	@Get("/last-7-days-sales")
	async getLastSales(@GetUser() user: User): Promise<any> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const response  = [];
		const report = await this.orderService.getLast7DaySales();
		report.forEach(e => {
			response.push({
				date: getDateForReport(e._id.year, e._id.month - 1, e._id.date).format('DD-MMM-YYYY'),
				total: e.value
			});
		});
		return response;
	}

	@Get("/last-7-orders")
	async getLastOrders(@GetUser() user: User): Promise<ReportOrder[]> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const report = await this.orderService.getLast7Orders();

		const orders: ReportOrder[] = [];
		report.forEach((d: IOrder) => {
			const o: ReportOrder = {
				_id: d._id,
				createdAt: getDateTime(d.createdAt),
				grandTotal: d.grandTotal,
				currency: d.currency,
				count: d.count,
				method: d.method,
				status: d.status,
			}
			orders.push(o);
		});
		return orders;
	}
}