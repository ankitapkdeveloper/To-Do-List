# FocusList — Supabase Fixed

## What was fixed
This project uses **real Supabase Auth** and the Supabase `tasks` table. It does not use fake demo/localStorage login.

## Setup

### 1. Run SQL
Open Supabase → SQL Editor and run `supabase-schema.sql`.

### 2. Configure the app
Open `config.js`.

Your project URL is already filled in:

`https://xubizzzuffhefxphzvxn.supabase.co`

Paste your **Publishable key** (or legacy **anon public key**) here:

```js
anonKey: "PASTE_YOUR_PUBLISHABLE_OR_ANON_KEY_HERE"
```

Never use a `service_role` or secret key in this frontend app.

### 3. Authentication settings
In Supabase Dashboard → Authentication → Providers → Email, make sure Email authentication is enabled.

For easy testing, you can disable **Confirm email** in the Auth email settings, or confirm the email sent by Supabase after signup.

### 4. Deploy
Upload all files to GitHub/Vercel.

## Login flow
- Create account → Supabase Auth creates the user
- Log in → Supabase Auth signs the user in
- Tasks are stored in `public.tasks`
- RLS ensures users can only access their own tasks
