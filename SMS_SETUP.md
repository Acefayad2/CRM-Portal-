# Twilio SMS Setup

## Quick start

1. **Install dependencies** (already done)
   ```bash
   npm install twilio
   ```

2. **Create `.env.local`** from `.env.example` and fill in your Twilio credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

4. **Test sending SMS**
   - Open http://localhost:3000/test-sms
   - Enter phone (E.164: +18777804236) and message
   - Click "Send SMS"

## Webhooks (inbound + delivery status)

For local development, use ngrok to expose your app to Twilio:

1. **Start ngrok**
   ```bash
   ngrok http 3000
   ```

2. **Add to `.env.local`**
   ```
   TWILIO_WEBHOOK_BASE_URL=https://your-ngrok-id.ngrok.io
   ```

3. **Configure Twilio Console**
   - Go to [Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming) → Your Number
   - **A MESSAGE COMES IN**: Webhook → `https://<ngrok-url>/api/twilio/webhook`
   - **STATUS CALLBACK URL**: `https://<ngrok-url>/api/twilio/webhook`

   Or for Messaging Service:
   - Messaging Service → Settings → Inbound & Status Callback URLs

## Supabase (optional)

To log all messages to a database:

1. Create a Supabase project and run the migration:
   - Open [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
   - Run `supabase/migrations/001_create_messages_table.sql`

2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## API

- **POST `/api/sms/send`** — Send SMS  
  Body: `{ "to": "+1234567890", "message": "Hello" }`

- **POST `/api/twilio/webhook`** — Twilio inbound + status callbacks (form-encoded)
