import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { TypeSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Type", schema: TypeSchema },
		]),
		SharedServiceModule
	],
  providers: [TypeService],
  controllers: [TypeController],
	exports: [MongooseModule, TypeService]
})
export class TypeModule {}
