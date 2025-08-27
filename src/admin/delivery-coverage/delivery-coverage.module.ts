import { Module } from '@nestjs/common';
import { DCAdminService } from './delivery-coverage.service';
import { DCAdminController } from './delivery-coverage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServiceModule } from 'src/shared/services';
import { DeliveryCoverageSchema } from 'src/shared/models';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "DeliveryCoverage", schema: DeliveryCoverageSchema },
		]),
		SharedServiceModule
	],
  providers: [DCAdminService],
  controllers: [DCAdminController]
})
export class DCAdminModule {}
