import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable  } from 'rxjs';
import { LocaleService } from '../locale/locale.service';

/**
 * Request Interceptor
 */
@Injectable()
export class RequestInterceptor implements NestInterceptor {
	/**
	 * constructor
	 * @param localeService
	 */
	constructor(
		private readonly localeService: LocaleService,
	) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		if (request.headers['lang']) this.localeService.setLocale(request.headers['lang']);
		return next.handle().pipe();
	};
};