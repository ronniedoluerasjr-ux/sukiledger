# SukiLedger 2.0 — Multi-User Cloud Edition

Separate email/password accounts with private cloud records. Supabase Row Level Security (RLS)
restricts each account to its own user_id.

## Important
This ZIP is prepared for Supabase but is NOT connected to a live database yet. Complete the
one-time setup below before using it with real records.

## A. Create the cloud database
1. Open https://supabase.com and create a free account and project.
2. In Supabase, open SQL Editor → New query.
3. Copy all of `SUPABASE-SETUP.sql` into the editor and click Run.
4. Open Project Settings → API (or API Keys). Copy the Project URL and anon/public key.

## B. Connect the app
1. Open `config.js` in a text editor.
2. Replace PASTE_YOUR_SUPABASE_PROJECT_URL_HERE with the Project URL.
3. Replace PASTE_YOUR_SUPABASE_ANON_KEY_HERE with the anon/public key.
4. Save. NEVER put the service_role key in config.js.

## C. Email confirmation
Supabase may require email confirmation before a new account can log in. Keeping confirmation
enabled is safer for a public app. Configure allowed redirect URLs under Authentication → URL
Configuration after publishing your app.

## D. Publish and install
1. Upload every file/folder in this ZIP to a GitHub repository.
2. Enable Settings → Pages → Deploy from a branch → main → /(root).
3. Open the HTTPS GitHub Pages URL and test account creation/login.
4. Share that same URL with your friend. They create their own account and install from Chrome.
5. Android: Chrome menu → Install app/Add to Home screen.
   Windows: Chrome/Edge install icon or menu → Install SukiLedger.

## Features
- Separate accounts and private per-account records.
- Cloud-saved customer, debt, payment, and store settings.
- Same account on phone/laptop; records load after reinstall/login.
- Existing ledger, payment, search, print, JSON backup/restore features.
- Responsive PWA for Android and Windows.

## Important limitations
- Internet is required for cloud sync. Offline edits are not queued in this starter version.
- Keep JSON backups as an extra precaution.
- Test with two separate accounts before entering real customer information.
- Do not weaken or remove the supplied Row Level Security policies.
- Supabase free-plan limits and terms may change.
