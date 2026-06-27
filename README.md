# ARD Event Platform - Next.js

This project combines the original event HTML frontend and Express/Prisma backend into one Next.js App Router application.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Connect Neon

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Set your Neon connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

Then create the tables:

```bash
npm run db:push
```

`npm run db:push` supports Neon pooler URLs that include `channel_binding=require`; the helper removes that parameter only for Prisma's schema push and does not edit your `.env` file.

Optional sample data:

```bash
npm run db:seed
```

## Gmail Email Setup

The app is configured to send brochure emails through Gmail SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alibinnadeem.ai@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="ARD Developers <alibinnadeem.ai@gmail.com>"
```

Use a Gmail App Password for `SMTP_PASS`, not the normal account password.

## WhatsApp Setup (360Messenger)

WhatsApp brochure links are sent through [360Messenger](https://360messenger.com), which
connects your own WhatsApp number (scan a QR in their dashboard, like WhatsApp Web — no
Meta verification or message templates required).

```env
MESSENGER360_API_KEY=your_360messenger_api_key
```

Get the key from "Web Service Information" in the 360Messenger dashboard after connecting
your number. If the key is missing, WhatsApp sending is skipped (leads still save and other
integrations run).

Note: 360Messenger is an unofficial gateway, so the connected number carries a WhatsApp
ban risk on high-volume or cold sends — use a dedicated number, not a business-critical one.

## Main Routes

- `/` - event page and lucky draw UI
- `/health` - health check
- `/api/leads` - lead capture and admin lead listing
- `/api/leads/:id/pdf` - brochure PDF download
- `/api/raffle/pool` - raffle entries
- `/api/raffle/draw` - admin winner draw
- `/api/admin/login` - admin PIN login
- `/api/admin/export` - CSV export

Default local admin PIN is `2025`. Override it with `ADMIN_PIN` in `.env.local`.
