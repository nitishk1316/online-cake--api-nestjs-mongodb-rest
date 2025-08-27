# Online Cake API

A NestJS RESTful APIs for Online Cake Shop with MongoDB

## Requirements

You need to keys to support other features like image, email, sms etc

* MongoDB (Database)
* Brevo (Email and SMS)
* Imagekit (Image upload)
* Onesignal (Push notification for mobile)
* Stripe (Payment Gatway)

## Installation

Create a `.env` file from the template `.env.example` file.

```bash
MONGO_DB_URL=<mongodb_url>
JWT_SECRET=<mongodb_jwt_secret>
EMAIL_API_KEY=<brevo_email_api_key>
SMS_API_KEY=<brevo_sms_api_key>
IMAGE_PRIVATE_KEY=<imagekit_private_key>
IMAGE_PUBLIC_KEY=<imagekit_public_key>
PUSH_CUSTOMER_APP_ID=<onesignal_app_id>
PUSH_CUSTOMER_SECRET_KEY=<onesignal_secret_key>
PUSH_DELIVERY_APP_ID=<onesignal_app_id>
PUSH_DELIVERY_SECRET_KEY=<onesignal_app_id>
STRIPE_SECRET_KEY=<stripe_secret_key>
WEBSITE_BASE_URL=<user_website_url>
```

## Build

Install the dependencies.

```bash
$ npm install
```

Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```