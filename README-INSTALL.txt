# Eilleen's Booklet — Multi-User Cloud Edition

A digital customer credit ledger with separate accounts and private cloud records.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run the contents of `SUPABASE-SETUP.sql`.
3. Open Project Settings → API and copy the Project URL and anon/public key.
4. Open `config.js` and replace the two placeholder values with your Project URL and anon/public key.
5. Save the file. Never place the service_role key in `config.js`.

## Email Confirmation

Supabase may require email confirmation before a new account can sign in. Configure the allowed redirect URLs under Authentication → URL Configuration after publishing the app.

## Publish and Install

1. Upload all project files and folders to your hosting repository.
2. Deploy the project using your hosting provider.
3. Open the HTTPS website and test account creation and sign-in.
4. Share the website address with other users. Each user should create a separate account.
5. On Android, open the site in Chrome, open the menu, and choose Install app or Add to Home screen.
6. On Windows, use the install icon or the browser menu.

## Features

- Separate accounts with private customer records.
- Cloud-saved customers, credit entries, payments, and store settings.
- Customer-specific ledger with daily itemized credit entries.
- Custom item names, quantities, units, and individual prices.
- Automatic item subtotals, daily totals, and outstanding balances.
- Payment history, search, printable reports, and customer ledgers.
- JSON backup and restore.
- Responsive installable web app for Android and desktop.

## Important Notes

- An internet connection is required for cloud synchronization.
- Offline edits are not queued for later synchronization.
- Keep regular JSON backups.
- Test with separate accounts before entering real customer information.
- Keep the supplied Row Level Security policies enabled.
