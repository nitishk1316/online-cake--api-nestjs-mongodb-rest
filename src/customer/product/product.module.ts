import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { DealModule } from '../deal/deal.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Product", schema: ProductSchema },
		]),
		DealModule,
		SharedServiceModule
	],
  controllers: [ProductController],
	providers: [ProductService],
	exports: [MongooseModule, ProductService]
})
export class ProductModule {}