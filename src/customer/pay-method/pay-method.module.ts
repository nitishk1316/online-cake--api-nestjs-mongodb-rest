import { Module } from '@nestjs/common';
import { PMService } from './pay-method.service';
import { PMController } from './pay-method.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PayMethodSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "PayMethod", schema: PayMethodSchema }
		]),
		SharedServiceModule
	],
  providers: [PMService],
  controllers: [PMController]
})
export class PayMethodModule {}
