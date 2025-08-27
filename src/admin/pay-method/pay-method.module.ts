import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayMethodSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { PMAdminController } from './pay-method.controller';
import { PMAdminService } from './pay-method.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "PayMethod", schema: PayMethodSchema }
		]),
		SharedServiceModule
	],
  controllers: [PMAdminController],
  providers: [PMAdminService]
})
export class PayMethodAdminModule {
}