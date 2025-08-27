import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema, SequenceSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { TypeAdminModule } from '../type/type.module';
import { ProductAdminController } from './product.controller';
import { ProductAdminService } from './product.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Product", schema: ProductSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		TypeAdminModule,
		SharedServiceModule
	],
  controllers: [ProductAdminController],
  providers: [ProductAdminService],
	exports: [ProductAdminService, MongooseModule]
})
export class ProductAdminModule {}
