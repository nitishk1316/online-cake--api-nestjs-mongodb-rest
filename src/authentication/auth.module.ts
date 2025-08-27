import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { SequenceSchema, UserSchema, VerificationSchema } from 'src/shared/models';
import { AuthController } from './auth.controller';
import { SharedServiceModule } from 'src/shared/services';

@Module({
	imports: [
		ConfigModule.forRoot(),
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '30d' }
			}),
			inject: [ConfigService],
		}),
		MongooseModule.forFeature([
			{ name: "User", schema: UserSchema },
			{ name: "Sequence", schema: SequenceSchema },
			{ name: "Verification", schema: VerificationSchema },
		]),
		SharedServiceModule,
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	exports: [JwtModule, AuthService, JwtStrategy]
})
export class AuthModule {}
