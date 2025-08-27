import { Module } from '@nestjs/common';
import { FlavourService } from './flavour.service';
import { FlavourController } from './flavour.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { FlavourSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "Flavour", schema: FlavourSchema },
		]),
		SharedServiceModule
	],
  providers: [FlavourService],
  controllers: [FlavourController]
})
export class FlavourModule {}
