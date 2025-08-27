import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { LocaleService } from 'src/shared/services';
import {
	ImageTag,
	Product,
	ProductDetail,
	ProductList,
	QueryParams,
	QueryParamsWithSearch
} from 'src/shared/classes';
import { resizeImage, validateQuery } from 'src/shared/util';
import { DealService } from '../deal/deal.service';
import { ProductService } from "./product.service";

/**
 * Product Controller
 */
@Controller('/products')
export class ProductController {
    /**
	 * Constructor
	 * @param productService
	 * @param dealService
	 * @param localeService
	 */
	constructor(
		private readonly productService: ProductService,
		private readonly dealService: DealService,
		private readonly localeService: LocaleService,
	) { }

	@Get("/")
	async getAll(@Query() query: QueryParamsWithSearch): Promise<ProductList> {
		const { page, limit, search } = validateQuery(query);
		const product = await Promise.all([
			this.productService.getAllActive({ page, limit, search }),
			this.productService.countAllActive({ search })
		]);
		let data = product[0] as Product[];
		data.forEach(b => {
			b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail)
		});

		const total = product[1];
		return { data, total };
	}

	@Get("/popular")
	async getAllPopular(): Promise<Product[]> {
		const products = await this.productService.getAllPopular();
		let data = products as Product[];
		data.forEach(b => {
			b.thumbnail = resizeImage(ImageTag.PRODUCT, b.thumbnail)
		});
		return data;
	}

	@Get("/:productId")
	async getById(@Param('productId') productId: number): Promise<ProductDetail> {
		const product = await this.productService.getById(productId);
		if (!product)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		let data = product as ProductDetail;
		data.images = data.images.map(b => resizeImage(ImageTag.PRODUCT, b));
		return data;
	}

	@Get("/type/:typeId")
	async getByType(@Param('typeId') typeId: string, @Query() query: QueryParams): Promise<ProductList> {
		const { page, limit } = validateQuery(query);
		const product = await Promise.all([
			this.productService.getAllActive({ page, limit, type: typeId }),
			this.productService.countAllActive({ type: typeId })
		]);
		let data = product[0] as Product[];
		data.forEach(b => {
			b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail);
		});
		const total = product[1];
		return { data, total };
	}

	@Get("/flavour/:flavourId")
	async getByFlavour(@Param('flavourId') flavourId: string, @Query() query: QueryParams): Promise<ProductList> {
		const { page, limit } = validateQuery(query);
		const product = await Promise.all([
			this.productService.getAllActive({ page, limit, flavour: flavourId }),
			this.productService.countAllActive({ flavour: flavourId })
		]);
		let data = product[0] as Product[];
		data.forEach(b => {
			b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail);
		});
		const total = product[1];
		return { data, total };
	}

	@Get("/occasion/:occasionId")
	async getByOccasion(@Param('occasionId') occasionId: string, @Query() query: QueryParams): Promise<ProductList> {
		const { page, limit } = validateQuery(query);
		const product = await Promise.all([
			this.productService.getAllActive({ page, limit, occasion: occasionId }),
			this.productService.countAllActive({ occasion: occasionId })
		]);
		let data = product[0] as Product[];
		data.forEach(b => {
			b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail);
		});
		const total = product[1];
		return { data, total };
	}

	@Get("/deal/:dealId")
	async getByDeal(@Param('dealId') dealId: number, @Query() query: QueryParams): Promise<ProductList> {
		const { page, limit } = validateQuery(query);

		const deal = await this.dealService.getById(dealId);
		let product: any[];
		if (deal) {
			product = await Promise.all([
				this.productService.getAllByDealType(deal, { page, limit }),
				this.productService.countAllByDealType(deal, { page, limit })
			]);
		} else {
			product = await Promise.all([
				this.productService.getAllActive({ page, limit }),
				this.productService.countAllActive({})
			]);
		}

		let data = product[0] as Product[];
		data.forEach(b => {
			b['thumbnail'] = resizeImage(ImageTag.PRODUCT, b.thumbnail)
		});
		const total = product[1];

		return { data, total };
	}
}
