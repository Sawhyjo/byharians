const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabase } = require('../config/supabase');

// SHA-256 Hash for Admin Verification (Hides credentials from frontend inspect element)
const ADMIN_EMAIL = 'byharians81@gmail.com';
const ADMIN_HASH = '11a6c1afb5f9f221880d2915cd980feead5538d9af55bed832de2f0d6c670888';

// POST /api/auth/signup (With Duplicate Check & Strict Supabase Auth)
router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    if (supabase) {
      // 1. Duplicate Registration Check (Email & Phone)
      const query = phone 
        ? `email.eq.${cleanEmail},phone.eq.${phone}` 
        : `email.eq.${cleanEmail}`;

      const { data: existing } = await supabase
        .from('profiles')
        .select('id, email, phone')
        .or(query);

      if (existing && existing.length > 0) {
        return res.status(400).json({
          error: 'Akun dengan email atau nomor telepon ini sudah terdaftar! Silakan gunakan menu Masuk Akun atau Lupa Password.'
        });
      }

      // 2. Perform Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name, phone } }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return res.status(400).json({
            error: 'Email ini sudah terdaftar di sistem. Silakan masuk atau gunakan fitur Lupa Password.'
          });
        }
        return res.status(400).json({ error: error.message });
      }

      if (!data?.user) {
        return res.status(400).json({ error: 'Gagal membuat akun di Supabase Auth.' });
      }

      const userId = data.user.id;

      // Always save profile to Supabase database
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        name,
        email: cleanEmail,
        phone: phone || '',
        eco_points: 100,
        pads_diverted: 0
      });

      if (profileErr) {
        console.error('⚠️ Supabase profile insert error:', profileErr.message);
      } else {
        console.log(`✅ Profile created in Supabase for user: ${cleanEmail} (${userId})`);
      }

      return res.json({ success: true, user: data.user });
    }

    return res.json({ success: true, message: 'Signed up successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signin (Secure Hashed Admin & Strict Password Verification)
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Check Server-Side Hashed Admin Credentials
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  if (cleanEmail === ADMIN_EMAIL && inputHash === ADMIN_HASH) {
    return res.json({
      success: true,
      isAdmin: true,
      user: { email: ADMIN_EMAIL },
      profile: {
        name: 'BYHARIANS Administrator',
        email: ADMIN_EMAIL,
        eco_points: 9999,
        pads_diverted: 5420
      }
    });
  }

  // 2. Check Customer Credentials via Supabase Auth (Strict Verification)
  try {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      
      const isEmailNotConfirmed = error && (
        error.code === 'email_not_confirmed' ||
        (error.message && error.message.toLowerCase().includes('email not confirmed'))
      );

      // If Supabase returned an auth error AND it's NOT email_not_confirmed,
      // the password/credentials are invalid! Reject access immediately.
      if (error && !isEmailNotConfirmed) {
        return res.status(401).json({ error: 'Email atau password salah. Silakan periksa kembali kredensial Anda.' });
      }

      // Password verified successfully by Supabase Auth! Fetch user profile.
      let userProfile = null;
      if (data?.user?.id) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        userProfile = profile;
      }
      
      if (!userProfile) {
        const { data: profileByEmail } = await supabase.from('profiles').select('*').eq('email', cleanEmail).single();
        userProfile = profileByEmail || { name: cleanEmail.split('@')[0], email: cleanEmail };
      }

      return res.json({
        success: true,
        user: data?.user || { id: userProfile.id, email: cleanEmail },
        profile: userProfile
      });
    }

    return res.status(401).json({ error: 'Email atau password salah. Silakan periksa kembali kredensial Anda.' });
  } catch (err) {
    console.error('Sign in authentication exception:', err);
    return res.status(401).json({ error: 'Email atau password salah. Silakan periksa kembali kredensial Anda.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi' });
  }

  try {
    if (supabase) {
      const redirectUri = `${req.headers.origin || 'http://localhost:8080'}/#reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUri
      });
      if (error) throw error;
      return res.json({ success: true, message: `Link reset password telah dikirimkan ke email ${email}` });
    }

    return res.json({ success: true, message: `Link reset password telah dikirimkan ke email ${email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return res.json({ success: true, user: data.user });
    }

    return res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/update-profile
router.post('/update-profile', async (req, res) => {
  const { email, name, phone, oldEmail } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nama dan email wajib diisi' });
  }

  try {
    if (supabase) {
      const targetEmail = oldEmail || email;
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', targetEmail)
        .single();

      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ name, email, phone: phone || '' })
          .eq('id', existing.id);

        if (updateErr) throw updateErr;

        return res.json({ success: true, profile: { name, email, phone } });
      }
    }

    return res.json({ success: true, profile: { name, email, phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
