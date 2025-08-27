import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/authentication/auth.module';
import { UserSchema, VerificationSchema, WalletSchema } from 'src/shared/models';
import { SharedServiceModule } from 'src/shared/services';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "User", schema: UserSchema },
			{ name: "Verification", schema: VerificationSchema },
			{ name: "Wallet", schema: WalletSchema },
		]),
		SharedServiceModule,
		AuthModule
	],
  providers: [ProfileService],
	controllers: [ProfileController],
	exports: [MongooseModule, ProfileService]
})
export class ProfileModule {}
