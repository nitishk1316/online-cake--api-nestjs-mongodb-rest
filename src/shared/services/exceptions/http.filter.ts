import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from '../mylogger/mylogger.service';

/**
 * Http Exception Filter
 */
@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
	/**
	 * Constructor
	 * @param logger 
	 */
	constructor(
		private logger: MyLoggerService
	) {
		super();
	}

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		
		let message ='';
		let errors = exception.getResponse()['message'];
		
		if (typeof errors === 'string') errors = [errors];
		if (status !== 400) message = errors;

		errors.forEach(error => {
			if (status === 400) this.logger.warn(error, request.url);
			else this.logger.error(error, request.url);
		});

		response
		.status(status)
		.send({
			message: message,
			errors: errors,
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url
		});
	}
}