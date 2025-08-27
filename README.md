# Online Cake API (NestJS + MongoDB)

A NestJS REST API for an **online cake shop**, backed by **MongoDB (Mongoose)** and **TypeScript**.

---

## 🔗 Live Demo

* **Swagger (API docs):** [https://cake-api.aarivs.com/swagger](https://cake-api.aarivs.com/swagger)
* **User Website:** [https://cake-web.aarivs.com](https://cake-web.aarivs.com)
* **Admin Dashboard:** [https://cake-dashboard.aarivs.com](https://cake-dashboard.aarivs.com)

> The demo links above reflect the same feature set exposed by this repository.

---

## ✨ Features

* Cake **categories** by **type**, **flavour**, **occasion**
* **Banners**
* **Coupons** & **Deals**
* Payment methods: **COD** and **Stripe** (test)
* **Delivery coverage** & **Delivery slots**
* **Multi‑language** support (i18n)
* **Wishlist**
* **Shop settings**
* Support for **delivery agent app**
* CMS‑style **pages** (Contact, About Us, Terms & Conditions, etc.)
* **Admin dashboard** reports & **instant notifications**
* Everything manageable from **Admin**

> Note: Public API responses avoid leaking internal fields; admin endpoints expose management controls.

---

## 🧰 Requirements

You will need credentials for the integrations used by the app:

* **MongoDB** (database)
* **Brevo** (email & SMS)
* **ImageKit** (image upload/storage)
* **OneSignal** (push notifications for mobile)
* **Stripe** (payment gateway)

---

## ⚙️ Environment Variables

Create a `.env` from `.env.example` and fill in the following keys:

```env
MONGO_DB_URL=<mongodb_url>
JWT_SECRET=<jwt_secret>
EMAIL_API_KEY=<brevo_email_api_key>
SMS_API_KEY=<brevo_sms_api_key>
IMAGE_PRIVATE_KEY=<imagekit_private_key>
IMAGE_PUBLIC_KEY=<imagekit_public_key>
PUSH_CUSTOMER_APP_ID=<onesignal_customer_app_id>
PUSH_CUSTOMER_SECRET_KEY=<onesignal_customer_secret_key>
PUSH_DELIVERY_APP_ID=<onesignal_delivery_app_id>
PUSH_DELIVERY_SECRET_KEY=<onesignal_delivery_secret_key>
STRIPE_SECRET_KEY=<stripe_secret_key>
WEBSITE_BASE_URL=<user_website_url>
```

> Keep secrets out of version control. For local development, `.env` is sufficient; for production, use your platform's secret manager.

---

## 🚀 Getting Started

### 1) Install

```bash
npm install
```

### 2) Run

```bash
# Development
npm run start

# Watch mode\ nnpm run start:dev

# Production
npm run start:prod
```

Once the server is up, open **Swagger** locally (if enabled in `main.ts`) at `/swagger`.

---

## 📦 Project Layout

Standard NestJS structure:

```
src/
  main.ts
  app.module.ts
  ...feature modules (categories, flavours, occasions, products, wishlist, cart, orders, payments, delivery, files, notifications, etc.)

test/
```

> Exact modules and routes are discoverable via Swagger and the `src/modules/*` folders.

---

## 💳 Payments

* **Stripe (test mode)** is integrated for card payments.
* **Cash on Delivery** is available as an alternative.

For Stripe testing, you can use the standard test card `4242 4242 4242 4242` with any future expiry and any CVC.

---

## 🖼️ Media Uploads

* Uploads are handled via **ImageKit**. Configure your public/private keys and URL endpoint in the environment variables.

---

## 📣 Notifications

* **Brevo** is used for email/SMS.
* **OneSignal** keys enable push notifications for customer and delivery apps.

---

## 🛡️ Production Notes

* Enable **CORS**, **Helmet**, and **rate limiting** on auth/sensitive routes.
* Use strong password hashing (e.g., **bcrypt** / **argon2**).
* Keep JWT secret strong and rotate regularly.

---

## 🧪 Scripts

```bash
npm run start       # start in dev
npm run start:dev   # watch mode
npm run start:prod  # production mode
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a PR with screenshots or API examples

---

## 📜 License

MIT (update `LICENSE` if you prefer another license)
