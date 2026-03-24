# SMS Setup — Telnyx

This project uses [Telnyx](https://telnyx.com) for SMS messaging. Follow these steps to configure SMS.

---

## Required Environment Variables

Add the following to your `.env.local` (local dev) or your hosting platform's environment variables:

```env
# Required
TELNYX_API_KEY=<your_telnyx_api_key>
TELNYX_PHONE_NUMBER=+12406366794
TELNYX_WEBHOOK_URL=https://pantheonportal.com/api/telnyx/webhook

# Optional — only needed if using a Telnyx Messaging Profile
TELNYX_MESSAGING_PROFILE_ID=<your_messaging_profile_id>
```

---

## How to Get Your Telnyx API Key

1. Sign up or log in at [https://portal.telnyx.com](https://portal.telnyx.com)
2. Go to **Auth** → **API Keys** in the left sidebar
3. Click **Create API Key**
4. Copy the key and add it as `TELNYX_API_KEY` in your environment

---

## How to Buy a Phone Number

1. In the Telnyx Portal, go to **Numbers** → **Search & Buy Numbers**
2. Search for available numbers in your desired area code
3. Select a number and complete the purchase
4. The number will appear under **Numbers** → **My Numbers**
5. Copy it in E.164 format (e.g. `+12406366794`) and set it as `TELNYX_PHONE_NUMBER`

---

## Webhook Configuration

All inbound SMS and delivery status events are handled at:

```
https://pantheonportal.com/api/telnyx/webhook
```

### Configure in Telnyx Portal

1. Go to **Messaging** → **Messaging Profiles**
2. Create or edit a Messaging Profile
3. Under **Webhooks**, set:
   - **Inbound Message Webhook URL**: `https://pantheonportal.com/api/telnyx/webhook`
   - **Outbound Message Webhook URL**: `https://pantheonportal.com/api/telnyx/webhook`
4. Assign your phone number to this Messaging Profile
5. Optionally copy the Messaging Profile ID and set it as `TELNYX_MESSAGING_PROFILE_ID`

---

## Local Development with Webhooks

To receive webhooks locally:

1. Run the dev server: `npm run dev`
2. Install and run ngrok: `ngrok http 3000`
3. Set `TELNYX_WEBHOOK_URL=https://<your-ngrok-id>.ngrok.io/api/telnyx/webhook`
4. Update your Telnyx Messaging Profile webhook URL to point to the ngrok URL

---

## Netlify Shim Functions

If deploying to Netlify, there are forwarding functions at:
- `netlify/functions/telnyx-inbound.js` — forwards inbound SMS to `/api/telnyx/webhook`
- `netlify/functions/telnyx-status.js` — forwards delivery status to `/api/telnyx/webhook`

---

## Supported Events

| Event Type | Action |
|------------|--------|
| `message.received` | Inbound SMS — stored in `sms_logs` |
| `message.finalized` | Delivery status update |
| `message.sent` | Sent confirmation |
| `message.failed` | Delivery failure |

---

## Testing

Navigate to `/test-sms` in the app to send a test message and verify the integration is working.
