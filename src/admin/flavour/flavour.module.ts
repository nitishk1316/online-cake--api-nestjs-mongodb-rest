import { Module } from '@nestjs/common';
import { FlavourAdminService } from './flavour.service';
import { FlavourAdminController } from './flavour.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { FlavourSchema, SequenceSchema } from 'src/shared/models';

@Module({
	imports: [
			MongooseModule.forFeature([
			{ name: "Flavour", schema: FlavourSchema },
			{ name: "Sequence", schema: SequenceSchema },
		]),
		SharedServiceModule,
	],
  providers: [FlavourAdminService],
  controllers: [FlavourAdminController],
	exports: [FlavourAdminService, MongooseModule]
})
export class FlavourAdminModule {}
