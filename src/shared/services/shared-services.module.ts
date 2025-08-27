import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { EventGateway } from './event/event.gateway';
import { ExcelService } from './excel/excel.service';
import { MyLoggerService } from './mylogger/mylogger.service';
import { PaymentService } from './payment/payment.service';
import { SMSService } from './sms/sms.service';
import { UploadService } from './upload/upload.service';
import { LocaleService } from './locale/locale.service';
import { WinstonModule } from 'nest-winston';
import { createLogger } from 'winston';
import * as winston from 'winston';
import * as rotateFile from "winston-daily-rotate-file";
import { HttpExceptionFilter } from './exceptions/http.filter';
import { MongoExceptionFilter } from './exceptions/mongo.filter';
import { ConfigModule } from '@nestjs/config';
import { PushService } from './push/push.service';

@Module({
	imports: [
		ConfigModule,
		WinstonModule.forRootAsync({
			useFactory: () => createLogger({
				level: "info",
				format: winston.format.json(),
				defaultMeta: { service: "user-service" },
				exitOnError: false,
				transports: [
					new winston.transports.Console({
						format: winston.format.simple(),
					}),
					new winston.transports.File({ filename: 'logs/combined.log', level: "info" }),
					new winston.transports.File({
						filename: "logs/error.log",
						level: "error",
					}),
					new rotateFile({
						filename: "logs/application-%DATE%.log",
						datePattern: "YYYY-MM-DD",
						zippedArchive: true,
						maxSize: "20m",
						maxFiles: "14d",
					}),
				],
				// exceptionHandlers: [
				// 	new winston.transports.File({ filename: 'logs/exceptions.log' }),
				// 	new winston.transports.File({ filename: 'logs/combined.log' })
				// ]
				// exceptionHandlers: [
				// 	new winston.transports.File({ filename: 'logs/exceptions.log' })
				//   ]
			}),
			inject: [],
		}),
	],
  controllers: [],
  providers: [
		EmailService,
		EventGateway,
		ExcelService,
		MyLoggerService,
		PaymentService,
		SMSService,
		UploadService,
		LocaleService,
		HttpExceptionFilter,
		MongoExceptionFilter,
		PushService
	],
  exports: [
		EmailService,
		EventGateway,
		ExcelService,
		MyLoggerService,
		PaymentService,
		SMSService,
		UploadService,
		LocaleService,
		HttpExceptionFilter,
		MongoExceptionFilter,
		PushService
	],
})
export class SharedServiceModule {}
