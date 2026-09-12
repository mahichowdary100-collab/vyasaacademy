// ============================================================
// Vyasa Academy - Supabase configuration
//
// HOW TO ACTIVATE LOGIN:
//  1. Create a free project at https://supabase.com/dashboard
//  2. Project Settings -> API  -> copy the "Project URL"
//     and the "anon public" key (NOT the service_role key).
//  3. Paste them below. Then run supabase/schema.sql in the
//     project's SQL Editor, and open "Authentication" settings:
//       - Disable "Allow new users to sign up" (admins invite users)
//       - Site URL: https://www.vyasaacademy.in
//       - Redirect URLs: https://www.vyasaacademy.in/reset-password/*
//       - Configure the email sender (built-in or Resend/SMTP)
//  4. The anon key is safe in frontend code BY DESIGN: all private
//     data is protected by Row Level Security on the server.
//     NEVER place the service_role (secret) key in this or any
//     frontend file.
// ============================================================
window.AUTH_CONFIG = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
};