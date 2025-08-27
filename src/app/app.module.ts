import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
	HttpExceptionFilter,
	LocaleService,
	MongoExceptionFilter,
	RequestInterceptor,
	SharedServiceModule
} from 'src/shared/services';
import { AdminModule } from 'src/admin/admin.module';
import { AuthModule } from 'src/authentication/auth.module';
import { ProfileModule } from 'src/profile/profile.module';
import { CustomerModule } from 'src/customer/customer.module';
import { NotificationAdminService } from 'src/admin/notification/notification.service';
import { NotificationSchema } from 'src/shared/models';
import { DeliveryModule } from 'src/delivery/delivery.module';

@Module({
  imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) =>
				({
					uri: configService.get<string>("DB_URL"),
				//  useNewUrlParser: true,
				//	useUnifiedTopology: true,
				//	useFindAndModify: false,
				//	useCreateIndex: true,
				} as MongooseModuleFactoryOptions),
				inject: [ConfigService],
		}),
		SharedServiceModule,
		AuthModule,
		ProfileModule,
		AdminModule,
		CustomerModule,
		DeliveryModule,
		MongooseModule.forFeature([
			{ name: "Notification", schema: NotificationSchema },
		]),
	],
  controllers: [AppController],
  providers: [
		NotificationAdminService,
		AppService,
		{
			provide: APP_INTERCEPTOR,
			useClass: RequestInterceptor
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: MongoExceptionFilter,
		}
	],
})
export class AppModule implements OnModuleInit {
	constructor(
		private localeService: LocaleService,
	) {
  }

	onModuleInit() {
		console.log(`Language Initialization...`);
		this.localeService.configure(['en'], 'en');
	}
}
