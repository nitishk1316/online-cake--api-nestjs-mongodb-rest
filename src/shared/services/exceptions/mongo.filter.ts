import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { MyLoggerService } from '../mylogger/mylogger.service';

/**
 * Mongo Exception Filter
 */
@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
	/**
	 * Constructor
	 * @param logger 
	 */
	constructor(
		private logger: MyLoggerService
	) {
	}

	catch(exception: MongoError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		this.logger.error(exception.message);

		if (exception.code === 11000) {
			response.status(400).send({ errors: [exception.message] });
		  } else {
			response.status(500).send({ message: 'Internal error.' });
		  }
	}
}