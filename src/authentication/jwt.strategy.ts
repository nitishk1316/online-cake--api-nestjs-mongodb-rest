import { ExtractJwt, JwtPayload, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IUser } from "src/shared/models";

/**
 * Jwt Strategy Class
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	/**
	 * Constructor
	 * @param userService
	 * @param configService
	 */
	constructor(
		@InjectModel("User") private readonly userModel: Model<IUser>,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET'),
		});
	}

	/**
	 * Checks if the bearer token is a valid token
	 * @param jwtPayload - validation method for jwt token
	 * @return IUser - user data
	 */
	async validate({ iat, exp, _id }: JwtPayload): Promise<any> {
		const timeDiff = exp - iat;
		if (timeDiff <= 0) {
			throw new UnauthorizedException();
		}
		const user = await this.userModel.findOne({ _id: _id }, 'role active playerId');
		if (!user) throw new UnauthorizedException();
		if (!user.active) throw new UnauthorizedException();
		return user;
	}
}