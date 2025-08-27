import { Module } from '@nestjs/common';
import { TypeAdminService } from './type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { TypeSchema, SequenceSchema } from 'src/shared/models';
import { TypeAdminController } from './type.controller';

@Module({
	imports: [
			MongooseModule.forFeature([
			{ name: "Type", schema: TypeSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule,
	],
  providers: [TypeAdminService],
  controllers: [TypeAdminController],
	exports: [TypeAdminService, MongooseModule]
})
export class TypeAdminModule {}
