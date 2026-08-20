/**
 * BYHARIANS CHECKOUT & PAYMENT INTEGRATION MODULE
 */
let activePaymentMethod = 'qris';
let activeBankVA = 'bca';
let activeEWallet = 'gopay';
let qrisTimerInterval = null;

const BANK_VA_DATA = {
  bca: { name: 'BCA Virtual Account', number: '8277 0812 8921 3401' },
  mandiri: { name: 'Mandiri Virtual Account', number: '8890 0812 8921 3401' },
  bri: { name: 'BRI BRIVA (Virtual Account)', number: '1280 0812 8921 3401' },
  bni: { name: 'BNI Virtual Account', number: '9881 0812 8921 3401' }
};

function renderCheckoutView() {
  if (!store.isLoggedIn) {
    store.redirectAfterLogin = 'checkout';
    if (typeof showToast === 'function') {
      showToast('Silakan Sign In atau masuk akun terlebih dahulu untuk melakukan pembayaran.', 'info');
    }
    const alertBox = document.getElementById('checkout-auth-alert');
    if (alertBox) alertBox.style.display = 'flex';
    navigateTo('login');
    return;
  }

  if (store.cart.length === 0) {
    navigateTo('cart');
    return;
  }

  const userDisplay = document.getElementById('checkout-auth-user-display');
  if (userDisplay && store.userAccount) {
    userDisplay.innerText = `${store.userAccount.name} (${store.userAccount.email})`;
  }

  const nameInput = document.getElementById('checkout-name');
  const phoneInput = document.getElementById('checkout-phone');
  if (nameInput && store.userAccount?.name) nameInput.value = store.userAccount.name;
  if (phoneInput && store.userAccount?.phone) phoneInput.value = store.userAccount.phone;

  renderCheckoutSummary();
  selectPaymentMethod('qris');
  startQRISTimer();
}

function renderCheckoutSummary() {
  const listEl = document.getElementById('checkout-summary-items');
  const totalsEl = document.getElementById('checkout-summary-totals');
  if (!listEl || !totalsEl) return;
  const calcs = getCartCalculations();

  listEl.innerHTML = store.cart.map(item => `
    <div style="display:flex; justify-space-between; align-items:center; font-size:0.85rem;">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${item.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
        <div>
          <div style="font-weight:700; color:var(--color-primary);">${item.name}</div>
          <div style="color:var(--color-text-muted); font-size:0.75rem;">Jml: ${item.quantity} • ${item.packName}</div>
        </div>
      </div>
      <div style="font-weight:700; color:var(--color-primary);">${store.formatPrice(item.unitPrice * item.quantity)}</div>
    </div>
  `).join('');

  totalsEl.innerHTML = `
    <div class="total-row"><span>Subtotal Produk</span><span>${store.formatPrice(calcs.subtotal)}</span></div>
    ${calcs.discount > 0 ? `<div class="total-row" style="color:var(--color-success);"><span>Diskon Voucher</span><span>-${store.formatPrice(calcs.discount)}</span></div>` : ''}
    ${store.plantTree ? `<div class="total-row" style="color:var(--color-success);"><span>Donasi Bibit Mangrove</span><span>${store.formatPrice(15000)}</span></div>` : ''}
    ${store.giftWrap ? `<div class="total-row"><span>Kotak Kado Ramah Lingkungan</span><span>${store.formatPrice(20000)}</span></div>` : ''}
    <div class="total-row"><span>Ongkos Kirim Bebas Plastik</span><span>${calcs.shippingCost === 0 ? '<strong style="color:var(--color-success);">GRATIS</strong>' : store.formatPrice(calcs.shippingCost)}</span></div>
    <div class="total-row grand-total"><span>Total Pembayaran</span><span>${store.formatPrice(calcs.grandTotal)}</span></div>
  `;
}

function selectPaymentMethod(method) {
  activePaymentMethod = method;
  document.querySelectorAll('.payment-method-card').forEach(c => {
    c.classList.toggle('active', c.dataset.method === method);
  });

  const qrisBox = document.getElementById('qris-section');
  const vaBox = document.getElementById('va-section');
  const ewalletBox = document.getElementById('ewallet-section');
  const cardBox = document.getElementById('card-input-section');
  const codBox = document.getElementById('cod-section');

  if (qrisBox) qrisBox.style.display = method === 'qris' ? 'block' : 'none';
  if (vaBox) vaBox.style.display = method === 'va' ? 'block' : 'none';
  if (ewalletBox) ewalletBox.style.display = method === 'ewallet' ? 'block' : 'none';
  if (cardBox) cardBox.style.display = method === 'card' ? 'block' : 'none';
  if (codBox) codBox.style.display = method === 'cod' ? 'block' : 'none';
}

function selectBankVA(bankCode, btn) {
  activeBankVA = bankCode;
  document.querySelectorAll('.bank-option-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const bankInfo = BANK_VA_DATA[bankCode] || BANK_VA_DATA.bca;
  const nameEl = document.getElementById('va-bank-name');
  const numEl = document.getElementById('va-number-display');
  if (nameEl) nameEl.innerText = bankInfo.name;
  if (numEl) numEl.innerText = bankInfo.number;
}

function copyVirtualAccount() {
  const bankInfo = BANK_VA_DATA[activeBankVA] || BANK_VA_DATA.bca;
  const cleanNum = bankInfo.number.replace(/\s/g, '');
  navigator.clipboard?.writeText(cleanNum);
  showToast(`Nomor ${bankInfo.name} (${cleanNum}) berhasil disalin!`, 'success');
}

function selectEWallet(wallet, btn) {
  activeEWallet = wallet;
  document.querySelectorAll('.ewallet-option-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function startQRISTimer() {
  if (qrisTimerInterval) clearInterval(qrisTimerInterval);
  let totalSeconds = 15 * 60;
  const timerEl = document.getElementById('qris-countdown-timer');

  qrisTimerInterval = setInterval(() => {
    totalSeconds--;
    if (totalSeconds < 0) {
      clearInterval(qrisTimerInterval);
      if (timerEl) timerEl.innerText = '00:00 (Kedaluwarsa)';
      return;
    }
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (timerEl) {
      timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

async function submitCheckoutOrder(e) {
  if (e) e.preventDefault();

  if (!store.isLoggedIn) {
    store.redirectAfterLogin = 'checkout';
    showToast('Silakan masuk atau daftar sebelum melakukan pembayaran', 'info');
    navigateTo('login');
    return;
  }

  const name = document.getElementById('checkout-name')?.value || store.userAccount.name || 'Pelanggan Setia';
  const email = document.getElementById('checkout-email')?.value || store.userAccount.email || 'pelanggan@byharians.id';
  const phone = document.getElementById('checkout-phone')?.value || '0812-8921-3401';
  const address = document.getElementById('checkout-address')?.value || 'Jl. Senopati No. 42, Kebayoran Baru';
  const city = document.getElementById('checkout-city')?.value || 'Jakarta Selatan, DKI Jakarta';

  const completeBtn = document.getElementById('complete-order-btn');
  if (completeBtn) {
    completeBtn.disabled = true;
    completeBtn.innerHTML = `<span>Memverifikasi Pembayaran ${activePaymentMethod.toUpperCase()}...</span>`;
  }

  const calcs = getCartCalculations();
  const orderId = `BYH-${Math.floor(10000 + Math.random() * 90000)}`;
  const paymentLabel = activePaymentMethod.toUpperCase();

  const newOrder = {
    id: orderId,
    date: new Date().toISOString().split('T')[0],
    customer: { name, email, phone, city: `${city}, ${address}` },
    items: store.cart.map(i => ({ name: i.name, qty: i.quantity, size: i.packName, price: i.unitPrice * i.quantity })),
    total: calcs.grandTotal,
    paymentMethod: paymentLabel,
    status: 'processing',
    trackingNumber: `SIC-ECO-${Math.floor(10000000 + Math.random() * 90000000)}`,
    courier: 'SiCepat BEST Eco-Fleet'
  };

  if (supabaseClient) {
    try {
      await supabaseClient.from('orders').insert([{
        id: orderId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: `${city}, ${address}`,
        items: JSON.stringify(newOrder.items),
        total_price: calcs.grandTotal,
        payment_method: paymentLabel,
        status: 'processing',
        tracking_number: newOrder.trackingNumber,
        courier: newOrder.courier
      }]);
    } catch (err) {
      console.warn('Supabase direct order insert warning:', err);
    }
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch (err) {
    console.warn('Order API sync error:', err);
  }

  store.orders.unshift(newOrder);
  store.saveGlobalOrder(newOrder);
  store.deductProductStockOnOrder(newOrder.items);
  store.userAccount.ecoPoints += Math.floor(calcs.grandTotal / 1000);
  store.userAccount.padsDiverted += store.cart.reduce((s, i) => s + (i.quantity * 10), 0);
  store.cart = [];
  store.appliedCoupon = null;
  store.save();
  updateCartBadgeAndDrawer();

  if (typeof renderAdminKPIs === 'function') renderAdminKPIs();
  if (typeof renderAdminOrders === 'function') renderAdminOrders();
  if (typeof updateAccountDashboardUI === 'function') updateAccountDashboardUI();

  if (completeBtn) {
    completeBtn.disabled = false;
    completeBtn.innerText = 'Bayar Sekarang & Selesaikan Pesanan';
  }

  showToast(`Pesanan ${orderId} berhasil dibuat!`, 'success');
  navigateTo(`track/${orderId}`);
}
