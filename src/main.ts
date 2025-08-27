import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
const mongoose = require('mongoose');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	const config = new DocumentBuilder()
		.setTitle('Readymade Cake')
		.setDescription('Readymade Cake')
		.setVersion('1.0')
		.addTag('Cake API')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, document,  {
		jsonDocumentUrl: 'swagger.json',
	});

	if (!process.env.production) mongoose.set('debug', true);

	const port = process.env.PORT || 3335;
	await app.listen(port, () => {
		Logger.log('Listening at http://localhost:' + port);
	});
}

bootstrap();