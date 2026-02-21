# Billing & Workspace Setup

## 1. Run migrations

In Supabase SQL Editor, run in order:
- `supabase/migrations/001_create_messages_table.sql` (optional, for legacy)
- `supabase/migrations/003_workspaces_pricing_sms.sql`

## 2. Stripe setup

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com/products):
   - **Plans**: Team ($59/mo), Business ($129/mo), Enterprise ($299/mo)
   - **SMS packs**: Pack S ($15), Pack M ($45), Pack L ($99)

2. Copy each Price ID (e.g. `price_xxx`) and update in Supabase:
   ```sql
   update plans set stripe_price_id = 'price_xxx' where id = 'team';
   update plans set stripe_price_id = 'price_xxx' where id = 'business';
   update plans set stripe_price_id = 'price_xxx' where id = 'enterprise';
   update sms_packs set stripe_price_id = 'price_xxx' where id = 'pack_s';
   update sms_packs set stripe_price_id = 'price_xxx' where id = 'pack_m';
   update sms_packs set stripe_price_id = 'price_xxx' where id = 'pack_l';
   ```

3. Create webhook at https://dashboard.stripe.com/webhooks:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.*`, `checkout.session.completed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

4. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

## 3. Workflow

- **Admin**: Subscribe to a plan (Billing) → Becomes team admin with unique team code → Share team code so others can join
- **Agent**: Join via team code (Join Team page)
- **SMS**: Requires active subscription; uses included SMS first, then credit balance; buy packs when over limit
