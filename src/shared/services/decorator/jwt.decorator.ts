import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Get user data on routes where we need user data
 */
export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.user;
});

/**
 * Optional JWT Auth guard, In some routes user can acceess without auth also
 */
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err, user, info, context) {
		return user;
	}
}