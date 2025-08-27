/**
 * Wallet Type
 */
export enum WalletType {
	CREDITED = 'CREDITED',
	DEBITED = 'DEBITED'
}

export enum WalletCancelBy {
	ADMIN = 'ADMIN',
	CUSTOMER = 'CUSTOMER'
}

/**
 * Wallet
 */
export class WalletPayload {
	user: number;
	walletType?: string;
	order: number;
	amount: number;
	cancelBy?: string;
}

/**
 * Wallet
 */
 export class Wallet {
	walletType: string;
	order: number;
	amount: number;
	cancelBy: string;
	createdAt: string;
}