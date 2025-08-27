import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * My Logger
 */
@Injectable()
export class MyLoggerService {
	/**
	 * constructor
	 * @param logger 
	 */
  constructor(
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {
  }

	/**
	 * Info
	 * @param message 
	 * @param context 
	 */
	info(message: string, context?: string) {
			this.logger.log(message, context);
	}

	/**
	 * Error
	 * @param message 
	 * @param context 
	 */
	error(message: string, context?: string) {
			this.logger.error(message, context);
	}

	/**
	 * Warning
	 * @param message 
	 * @param context 
	 */
	warn(message: string, context?: string) {
			this.logger.warn(message, context);
	}
}