import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageUpload } from 'src/shared/classes';
import { SETTINGS } from 'src/shared/settings';
import { MyLoggerService } from '../mylogger/mylogger.service';
const ImageKit = require("imagekit");

/**
 * Upload Service
 */
@Injectable()
export class UploadService {
	/**
	 * Constructor
	 * @param configService
	 * @param logger
	 */
	constructor(
		private readonly configService: ConfigService,
		private readonly logger: MyLoggerService,
	) {
  }

   /**
	* Upload image to imagekit
	* @param fileBuffer
	* @param originalFileName
	* @return ImageUpload - image detail
	*/
	public async uploadImage(fileBuffer: any, originalFileName?: string, isPrivate: boolean = false): Promise<ImageUpload> {
		try {
			let fileName = originalFileName;
			const payload = {
					isPrivateFile: isPrivate,
					file: fileBuffer,
					fileName: fileName,
					folder: '/'
			};
			const imageKit = await this.getImageConf();
			let imageRes = await imageKit.upload(payload);
			const resData = {
				fileId: imageRes.fileId,
				url: imageRes.url,
				thumbnail: imageRes.thumbnailUrl,
				filePath: imageRes.filePath
			};
			return resData;
		} catch (e) {
      this.logger.error(e);
		}
	}

	/**
	 * Upload file to imagekit
	 * @param base64Data
	 * @param fileName
	 * @return ImageUpload - image detail
	 */
	public async uploadFile(base64Data: string, fileName: string): Promise<ImageUpload> {
		try {
			const payload = {
					file: base64Data,
					fileName: fileName,
			};
			const imageKit = await this.getImageConf();
      let imageRes = await imageKit.upload(payload);
  		const resData = {
				fileId: imageRes.fileId,
				url: imageRes.url,
				thumbnail: imageRes.thumbnailUrl,
				filePath: imageRes.filePath
			};
			return resData;
		} catch (e) {
      this.logger.error(e);
		}
	}

	/**
	 * Delete image from imagekit
	 * @param imageId
	 * @return boolean
	 */
	public async deleteImage(imageId: string): Promise<boolean> {
		try {
			const imageKit = await this.getImageConf();
			await imageKit.deleteFile(imageId)
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 *
	 * @param url
	 * @returns
	 */
	public async signedUrl(url: string): Promise<string> {
		try {
			const payload = {
				path: url,
				signed : true,
				expireSeconds : 300
			};
			const imageKit = await this.getImageConf();
			let signedUrl = await imageKit.url(payload);
			return signedUrl;
		} catch (e) {
      this.logger.error(e);
		}
	}

	/**
	 *
	 * @returns
	 */
	private async getImageConf() {
    const imagekit = new ImageKit({
			publicKey: this.configService.get('IMAGE_PUBLIC_KEY'),
			privateKey: this.configService.get('IMAGE_PRIVATE_KEY'),
			urlEndpoint: SETTINGS.IMAGE_URL
		});
		return imagekit;
	}
}
