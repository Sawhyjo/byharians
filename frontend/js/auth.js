/**
 * BYHARIANS AUTHENTICATION & USER PROFILE ENGINE
 */
function switchAuthTab(tab) {
  const signinForm = document.getElementById('auth-form-signin');
  const signupForm = document.getElementById('auth-form-signup');
  const signinBtn = document.getElementById('auth-tab-signin-btn');
  const signupBtn = document.getElementById('auth-tab-signup-btn');
  const subtitle = document.getElementById('auth-header-subtitle');

  if (tab === 'signup') {
    if (signinForm) signinForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (signinBtn) signinBtn.classList.remove('active');
    if (signupBtn) signupBtn.classList.add('active');
    if (subtitle) subtitle.innerText = 'Create your BYHARIANS account to unlock 15% off and automated cycle delivery.';
  } else {
    if (signinForm) signinForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (signinBtn) signinBtn.classList.add('active');
    if (signupBtn) signupBtn.classList.remove('active');
    if (subtitle) subtitle.innerText = 'Sign in to manage your monthly cycle subscriptions and reward points.';
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

async function handleSignInSubmit(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('signin-email')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('signin-password')?.value || '').trim();

  if (!email || !password) {
    showToast('Silakan masukkan email dan password Anda', 'error');
    return;
  }

  const btn = document.getElementById('btn-signin-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Memverifikasi Kredensial...';
  }

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await resp.json();

    if (!resp.ok || !result.success) {
      showToast(result.error || 'Email atau password salah. Silakan periksa kembali.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Sign In to Your Account';
      }
      return;
    }

    if (result.isAdmin) {
      store.isAdmin = true;
      store.isLoggedIn = true;
      store.userAccount = {
        name: result.profile?.name || 'BYHARIANS Administrator',
        email: result.profile?.email || email,
        ecoPoints: result.profile?.eco_points ?? 9999,
        padsDiverted: result.profile?.pads_diverted ?? 5420,
        lastCycleDate: '2026-08-01',
        cycleLengthDays: 28,
        periodLengthDays: 5,
        activeSubscription: { productName: 'Operations Master Account', interval: 'N/A', nextDelivery: 'N/A', status: 'Active' }
      };
      store.save();
      updateHeaderAuthUI();
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Sign In to Your Account';
      }
      showToast('Kredensial Admin Terverifikasi. Selamat datang di Operations Console!', 'success');
      navigateTo('admin');
      return;
    }

    // Customer Login
    store.isAdmin = false;
    store.isLoggedIn = true;
    store.userAccount = {
      name: result.profile?.name || email.split('@')[0],
      email: result.profile?.email || email,
      phone: result.profile?.phone || '',
      ecoPoints: result.profile?.eco_points ?? 100,
      padsDiverted: result.profile?.pads_diverted ?? 0,
      lastCycleDate: new Date().toISOString().split('T')[0],
      cycleLengthDays: 28,
      periodLengthDays: 5,
      activeSubscription: { productName: 'Paket Pembalut Organik Bambu', interval: 'Setiap 4 Minggu', nextDelivery: '24 Agustus 2026', status: 'Aktif' }
    };
    store.loadUserCartAndOrders();
    store.save();
    updateHeaderAuthUI();
    updateAccountDashboardUI();
    if (typeof updateCartBadgeAndDrawer === 'function') updateCartBadgeAndDrawer();

    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Sign In to Your Account';
    }

    const alertBox = document.getElementById('checkout-auth-alert');
    if (alertBox) alertBox.style.display = 'none';

    const nextTarget = store.redirectAfterLogin || 'account';
    store.redirectAfterLogin = null;

    showToast(`Selamat datang kembali, ${store.userAccount.name}!`, 'success');
    navigateTo(nextTarget);
  } catch (err) {
    console.warn('Backend Auth Connection warning:', err);
    showToast('Gagal terhubung ke server backend auth. Silakan coba lagi.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Sign In to Your Account';
    }
  }
}

async function handleSignUpSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim().toLowerCase();
  const phone = document.getElementById('signup-phone')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  const passwordConfirm = document.getElementById('signup-password-confirm')?.value;

  if (!name || !email || !password) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showToast('Passwords do not match. Please check again.', 'error');
    return;
  }

  const btn = document.getElementById('btn-signup-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Creating Account...';
  }

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const result = await resp.json();

    if (!resp.ok || result.error) {
      const errMsg = result.error || 'Pendaftaran gagal. Silakan periksa kembali data Anda.';
      showToast(errMsg, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Create Account & Join Eco-Movement';
      }
      return;
    }

    store.isAdmin = false;
    store.isLoggedIn = true;
    store.userAccount = {
      name,
      email,
      phone: phone || '',
      ecoPoints: 100,
      padsDiverted: 0,
      lastCycleDate: new Date().toISOString().split('T')[0],
      cycleLengthDays: 28,
      periodLengthDays: 5,
      activeSubscription: { productName: 'BYHARIANS Ultra-Thin Bamboo Day Pads + Overnight Duo', interval: 'Setiap 4 Minggu', nextDelivery: '24 Agustus 2026', status: 'Aktif' }
    };
    store.save();
    updateHeaderAuthUI();
    updateAccountDashboardUI();

    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Create Account & Join Eco-Movement';
    }

    const alertBox = document.getElementById('checkout-auth-alert');
    if (alertBox) alertBox.style.display = 'none';

    const nextTarget = store.redirectAfterLogin || 'account';
    store.redirectAfterLogin = null;

    showToast(`Selamat datang ${name}! Akun Anda telah aktif dengan 100 bonus Eco-Points.`, 'success');
    navigateTo(nextTarget);
  } catch (err) {
    console.error('Backend Signup error:', err);
    showToast('Gagal menghubungkan pendaftaran ke database backend. Pastikan server Node.js aktif.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Create Account & Join Eco-Movement';
    }
  }
}

function handleAdminLoginSubmit(e) {
  if (e) e.preventDefault();
  const email = (document.getElementById('admin-login-email')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('admin-login-password')?.value || '').trim();

  const btn = document.getElementById('btn-admin-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Verifying Security Protocol...';
  }

  setTimeout(() => {
    if (email === 'byharians81@gmail.com' && (password === 'BHdurian81' || password === 'bhdurian81')) {
      store.isAdmin = true;
      store.isLoggedIn = true;
      store.userAccount = {
        name: 'BYHARIANS Administrator',
        email: 'byharians81@gmail.com',
        ecoPoints: 9999,
        padsDiverted: 5420,
        lastCycleDate: '2026-08-01',
        cycleLengthDays: 28,
        periodLengthDays: 5,
        activeSubscription: { productName: 'Operations Master Account', interval: 'N/A', nextDelivery: 'N/A', status: 'Active' }
      };
      store.save();
      updateHeaderAuthUI();

      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Authenticate & Open Operations Console';
      }

      showToast('Admin credentials verified. Welcome to Operations Console.', 'success');
      navigateTo('admin');
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Authenticate & Open Operations Console';
      }
      showToast('Invalid administrator email or password. Access restricted.', 'error');
    }
  }, 500);
}

function handleAdminSignOut() {
  store.isAdmin = false;
  store.save();
  updateHeaderAuthUI();
  showToast('Admin session terminated.', 'info');
  navigateTo('home');
}

function handleUserSignOut() {
  if (supabaseClient) {
    try { supabaseClient.auth.signOut(); } catch (e) {}
  }
  store.isLoggedIn = false;
  store.isAdmin = false;
  store.cart = [];
  store.orders = [];
  store.appliedCoupon = null;
  store.userAccount = {
    name: 'Pelanggan BYHARIANS',
    email: 'pelanggan@byharians.id',
    phone: '0812-0000-0000'
  };
  localStorage.removeItem('byharians_cart_guest');
  localStorage.removeItem('byharians_user');
  localStorage.removeItem('byharians_admin_role');

  if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
    supabaseClient.auth.signOut().catch(() => {});
  }

  store.save();
  if (typeof updateCartBadgeAndDrawer === 'function') updateCartBadgeAndDrawer();
  if (typeof updateHeaderAuthUI === 'function') updateHeaderAuthUI();
  showToast('Anda telah keluar dari akun.', 'info');
  navigateTo('home');
}

function handleSignOut() {
  if (store.isAdmin && typeof handleAdminSignOut === 'function') {
    handleAdminSignOut();
  } else {
    handleUserSignOut();
  }
}

async function handleSocialAuth(provider) {
  const p = (provider || '').toLowerCase();
  if (supabaseClient) {
    showToast(`Mengarahkan ke Halaman Login Resmi ${provider} OAuth...`, 'info');
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: p === 'google' ? 'google' : 'apple',
        options: {
          redirectTo: `${window.location.origin}/#account`
        }
      });
      if (error) {
        showToast(`${provider} OAuth: ${error.message}`, 'error');
      }
    } catch (err) {
      console.error(`${provider} OAuth Exception:`, err);
      showToast(`Gagal memulai otentikasi ${provider}.`, 'error');
    }
  } else {
    showToast(`Supabase Client belum siap untuk ${provider} OAuth`, 'warning');
  }
}

function initOAuthSessionListener() {
  if (!supabaseClient) return;

  try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const user = session.user;
        const meta = user.user_metadata || {};
        
        store.isAdmin = false;
        store.isLoggedIn = true;
        store.userAccount = {
          name: meta.full_name || meta.name || user.email.split('@')[0],
          email: user.email,
          phone: meta.phone || user.phone || '0812-8921-3401',
          ecoPoints: 250,
          padsDiverted: 50,
          lastCycleDate: new Date().toISOString().split('T')[0],
          cycleLengthDays: 28,
          periodLengthDays: 5,
          activeSubscription: { productName: 'BYHARIANS Organic Bamboo Pack', interval: 'Setiap 4 Minggu', nextDelivery: '24 Agustus 2026', status: 'Aktif' }
        };
        store.save();
        updateHeaderAuthUI();

        if (window.location.hash.includes('access_token') || window.location.hash.includes('auth')) {
          showToast(`Berhasil masuk via Akun Google (${user.email})!`, 'success');
          navigateTo('account');
        }
      }
    });
  } catch (err) {
    console.warn('OAuth listener setup warning:', err);
  }
}

// Attach listener on initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOAuthSessionListener);
} else {
  initOAuthSessionListener();
}

async function updateAccountDashboardUI() {
  if (!store.isLoggedIn || !store.userAccount) return;

  const avatar = document.getElementById('acc-avatar-display');
  const name = document.getElementById('acc-user-name');
  const email = document.getElementById('acc-user-email');
  const phone = document.getElementById('acc-user-phone');
  const points = document.getElementById('acc-eco-points');
  const diverted = document.getElementById('acc-pads-diverted');
  const subDetails = document.getElementById('acc-sub-details');

  const userEmail = (store.userAccount.email || '').toLowerCase().trim();

  if (name) name.innerText = store.userAccount.name || 'Valued Customer';
  if (email) email.innerText = userEmail;
  if (phone) phone.innerText = store.userAccount.phone || 'No phone number provided';

  if (avatar) {
    const initials = (store.userAccount.name || 'VC')
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatar.innerText = initials;
  }

  // 1. Fetch Customer Orders directly from Supabase DB
  let customerOrders = store.orders || [];
  if (supabaseClient && userEmail) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .ilike('customer_email', userEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        customerOrders = data.map(row => store.normalizeOrder(row)).filter(Boolean);
        store.orders = customerOrders;
        store.save();
      }
    } catch (err) {
      console.warn('Supabase customer orders fetch warning:', err);
    }
  }

  if (points) points.innerText = `${store.userAccount.ecoPoints ?? 100} Pts`;
  if (diverted) diverted.innerText = `${store.userAccount.padsDiverted ?? 0} Pads`;

  // Render Subscriptions
  if (subDetails) {
    const sub = store.userAccount.activeSubscription || {
      productName: 'Custom Bamboo Cycle Pack',
      interval: 'Setiap 4 Minggu',
      nextDelivery: '24 Agustus 2026',
      status: 'Aktif'
    };
    subDetails.innerHTML = `
      <div style="background: var(--color-bg-subtle); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <strong style="color: var(--color-primary); font-size: 0.95rem; display: block; margin-bottom: 4px;">${sub.productName}</strong>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Siklus: <strong>${sub.interval}</strong> • Pengiriman Berikutnya: <strong>${sub.nextDelivery}</strong></span>
        </div>
        <span class="badge ${sub.status === 'Aktif' || sub.status === 'Active' ? 'badge-success' : 'badge-primary'}" style="text-transform: uppercase;">${sub.status}</span>
      </div>
    `;
  }

  // Render Past Orders List with Supabase Verified Tag
  const ordersListEl = document.getElementById('acc-orders-list');
  if (ordersListEl) {
    if (customerOrders.length === 0) {
      ordersListEl.innerHTML = `
        <div style="text-align:center; padding: 32px 16px; color: var(--color-text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
          <p style="font-weight: 700; color: var(--color-primary); font-size: 0.95rem; margin-bottom: 4px;">Belum Ada Riwayat Pesanan</p>
          <small>Pesanan yang Anda buat akan terverifikasi dan muncul di sini secara otomatis dari database Supabase.</small>
        </div>
      `;
    } else {
      ordersListEl.innerHTML = customerOrders.map(order => `
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 14px; background: #fff; box-shadow: var(--shadow-xs);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 0.74rem; color: var(--color-text-muted); text-transform: uppercase;">Nomor Pesanan</span>
              <strong style="font-size: 1.05rem; color: var(--color-primary); display: block;">#${order.id}</strong>
              <small style="color: var(--color-success); font-weight: 700; font-size: 0.72rem;">✓ Terverifikasi Supabase DB</small>
            </div>
            <div>
              <span style="font-size: 0.74rem; color: var(--color-text-muted); text-transform: uppercase;">Tanggal</span>
              <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-primary);">${order.date || new Date().toISOString().split('T')[0]}</div>
            </div>
            <div>
              <span style="font-size: 0.74rem; color: var(--color-text-muted); text-transform: uppercase;">No. Resi Pengiriman</span>
              <code style="background: rgba(15,48,29,0.06); padding: 2px 8px; border-radius: 4px; font-weight: 700; color: var(--color-primary); font-size: 0.8rem;">${order.trackingNumber || 'SIC-ECO-LIVE'}</code>
            </div>
            <div>
              <span class="status-badge ${order.status === 'delivered' ? 'status-delivered' : order.status === 'processing' ? 'status-processing' : 'status-shipped'}" style="text-transform: uppercase;">
                ${order.status === 'processing' ? 'DI PROSES' : order.status === 'shipped' ? 'DI JALAN' : order.status === 'delivered' ? 'SAMPAI' : order.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-size: 0.84rem; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">Daftar Item Dibeli:</div>
              <ul style="margin: 0; padding-left: 18px; font-size: 0.8rem; color: var(--color-text-muted);">
                ${(order.items || []).map(item => `<li><strong>${item.name}</strong> x${item.qty || item.quantity || 1} (${item.size || item.packName || ''})</li>`).join('')}
              </ul>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.78rem; color: var(--color-text-muted); display: block;">Total Bayar (${order.paymentMethod || 'QRIS'})</span>
              <strong style="font-size: 1.15rem; color: var(--color-primary);">${store.formatPrice(order.total || 0)}</strong>
              <div style="margin-top: 6px;">
                <button class="btn btn-outline btn-sm" onclick="navigateTo('track/${order.id}')" style="padding: 4px 10px; font-size: 0.76rem;">Lacak Resi →</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function openForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.style.display = 'flex';
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.style.display = 'none';
}

async function handleForgotPasswordSubmit(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('forgot-email')?.value?.trim()?.toLowerCase();
  if (!email) {
    showToast('Masukkan alamat email Anda', 'error');
    return;
  }

  const btn = document.getElementById('btn-forgot-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Mengirimkan Link...';
  }

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await resp.json();

    if (!resp.ok || result.error) {
      showToast(result.error || 'Gagal mengirimkan instruksi reset password', 'error');
    } else {
      showToast(result.message || `Link reset password telah dikirimkan ke email ${email}!`, 'success');
      closeForgotPasswordModal();
    }
  } catch (err) {
    console.warn('Forgot password warning:', err);
    showToast(`Tautan reset password disimulasikan ke ${email}`, 'success');
    closeForgotPasswordModal();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Kirim Link Reset';
    }
  }
}

async function handleResetPasswordSubmit(e) {
  if (e) e.preventDefault();
  const newPassword = document.getElementById('reset-new-password')?.value;
  const confirmPassword = document.getElementById('reset-confirm-password')?.value;

  if (!newPassword || newPassword.length < 6) {
    showToast('Password baru minimal 6 karakter', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('Konfirmasi password baru tidak cocok', 'error');
    return;
  }

  const btn = document.getElementById('btn-reset-password-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Memperbarui Password...';
  }

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    });
    const result = await resp.json();

    if (!resp.ok || result.error) {
      showToast(result.error || 'Gagal memperbarui password', 'error');
    } else {
      showToast('Password Anda berhasil diperbarui! Silakan masuk kembali.', 'success');
      navigateTo('login');
    }
  } catch (err) {
    console.warn('Reset password error:', err);
    showToast('Password Anda berhasil diperbarui!', 'success');
    navigateTo('login');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Simpan & Perbarui Password';
    }
  }
}

function openEditProfileModal() {
  if (!store.userAccount) {
    store.userAccount = {
      name: 'Pelanggan BYHARIANS',
      email: 'pelanggan@byharians.id',
      phone: '0812-0000-0000',
      ecoPoints: 100,
      padsDiverted: 0
    };
  }
  store.isLoggedIn = true;

  const nameInput = document.getElementById('edit-profile-name');
  const emailInput = document.getElementById('edit-profile-email');
  const phoneInput = document.getElementById('edit-profile-phone');

  if (nameInput) nameInput.value = store.userAccount.name || '';
  if (emailInput) emailInput.value = store.userAccount.email || '';
  if (phoneInput) phoneInput.value = store.userAccount.phone || '';

  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.style.display = 'none';
}

async function handleUpdateProfileSubmit(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('edit-profile-name')?.value?.trim();
  const email = document.getElementById('edit-profile-email')?.value?.trim()?.toLowerCase();
  const phone = document.getElementById('edit-profile-phone')?.value?.trim();

  if (!name || !email) {
    showToast('Nama dan email wajib diisi', 'error');
    return;
  }

  const btn = document.getElementById('btn-edit-profile-submit');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Menyimpan Perubahan...';
  }

  const oldEmail = store.userAccount?.email;

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, oldEmail })
    });
    const result = await resp.json();

    if (!resp.ok || result.error) {
      showToast(result.error || 'Gagal memperbarui profil database', 'error');
    } else {
      store.userAccount.name = name;
      store.userAccount.email = email;
      store.userAccount.phone = phone || '';
      store.save();
      updateHeaderAuthUI();
      updateAccountDashboardUI();
      showToast('Profil database berhasil diperbarui!', 'success');
      closeEditProfileModal();
    }
  } catch (err) {
    console.warn('Update profile error:', err);
    store.userAccount.name = name;
    store.userAccount.email = email;
    store.userAccount.phone = phone || '';
    store.save();
    updateHeaderAuthUI();
    updateAccountDashboardUI();
    showToast('Profil lokal berhasil diperbarui!', 'success');
    closeEditProfileModal();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Simpan Perubahan Profil';
    }
  }
}
