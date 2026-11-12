# SukiLedger 2.0 — Multi-User Cloud Edition

SukiLedger is a store ledger for managing customer records, debts, payments, and reports. Each account has private cloud records protected by Supabase Row Level Security (RLS).

## Important Before Updating an Existing Deployment

This package is intended as a front-end language and branding update. If you already have a working SukiLedger deployment connected to Supabase:

- Do not run `SUPABASE-SETUP.sql` again.
- Do not replace your existing Supabase project.
- Keep your current `config.js` values. The configuration file in this archive may contain setup placeholders.
- Do not change your existing database tables, records, or RLS policies.
- Back up your records before deploying any update.

## Supabase Configuration

The app uses the following browser-side settings in `config.js`:

- Supabase Project URL
- Supabase anon/public key (or publishable key supported by your setup)

Never put a Supabase `service_role` key in a browser-accessible file. Do not share your keys publicly.

If your current live app is already connected, copy the working `config.js` from your existing project into this package before deployment. Do not use the placeholder values.

## Deploying the Update with Vercel and GitHub

1. Back up your SukiLedger data using the app's **Download Backup** feature.
2. Keep a copy of your current GitHub repository or create a separate update branch.
3. Replace the front-end files with the revised files from this package.
4. Preserve the actual working `config.js` from your current connected project.
5. Do not execute `SUPABASE-SETUP.sql` and do not make database changes for this language update.
6. Push the changes to a preview branch and check the Vercel Preview Deployment first.
7. Test login, customer records, debt entries, payments, reports, backup, and cloud sync.
8. Merge to the production branch only after the preview works as expected.

## Included Features

- Separate email/password accounts.
- Private per-account cloud records.
- Customer, debt, and payment management.
- Search, transaction history, and customer ledger printing.
- Reports and JSON backup/restore.
- Responsive Progressive Web App (PWA) support.

## Notes

- Internet access is required for cloud synchronization.
- Keep periodic JSON backups.
- Test the preview deployment before publishing it to your live domain.
- Keep the existing Supabase Row Level Security policies enabled.
