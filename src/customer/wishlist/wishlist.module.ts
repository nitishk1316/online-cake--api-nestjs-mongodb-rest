import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistSchema, ProductSchema } from 'src/shared/models';
import { ProductService } from '../product/product.service';
import { SharedServiceModule } from 'src/shared/services';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Wishlist", schema: WishlistSchema },
			{ name: "Product", schema: ProductSchema },
		]),
		SharedServiceModule
	],
  providers: [WishlistService, ProductService],
  controllers: [WishlistController]
})
export class WishlistModule {}
