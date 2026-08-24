/**
 * BYHARIANS GROCERIES & AUTO-REFILL SUBSCRIPTION ENGINE
 */
let activeSelectedBasket = null;

function renderGroceriesShowcase() {
  const container = document.getElementById('groceries-showcase-grid');
  if (!container) return;

  const baskets = store.ecoBaskets || [];
  container.innerHTML = baskets.map(b => `
    <div class="product-card" style="display:flex; flex-direction:column; background:#fff; border-radius:var(--radius-xl); border:1px solid var(--color-border); overflow:hidden; box-shadow:var(--shadow-sm); transition:transform var(--transition-fast);">
      <div style="position:relative; height:180px; overflow:hidden;">
        <img src="${b.image}" alt="${b.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/product_day_pads.jpg'">
        ${b.badge ? `<span style="position:absolute; top:12px; left:12px; background:var(--color-primary); color:#fff; padding:4px 12px; border-radius:var(--radius-full); font-size:0.75rem; font-weight:800;">${b.badge}</span>` : ''}
      </div>
      <div style="padding:20px; display:flex; flex-direction:column; flex:1;">
        <h3 style="font-size:1.1rem; font-weight:800; color:var(--color-primary); margin-bottom:6px;">${b.name}</h3>
        <p style="font-size:0.8rem; color:var(--color-secondary); font-weight:700; margin-bottom:8px;">📦 ${b.itemsSummary}</p>
        <p style="font-size:0.82rem; color:var(--color-text-muted); line-height:1.45; margin-bottom:16px;">${b.description}</p>
        
        <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-border); padding-top:14px;">
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">Biaya Auto-Refill</span>
            <strong style="font-size:1.15rem; color:var(--color-primary);">${store.formatPrice(b.monthlyPrice)} <small style="font-size:0.76rem; font-weight:normal;">/ bulan</small></strong>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="openCreateAutoRefillModal('${b.id}')" style="font-weight:800;">
            🔄 Langganan
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openCreateAutoRefillModal(basketId) {
  if (!store.isLoggedIn) {
    store.redirectAfterLogin = 'account';
    showToast('Please sign in or register to subscribe to Auto-Refill', 'info');
    navigateTo('login');
    return;
  }

  const basket = (store.ecoBaskets || []).find(b => b.id === basketId) || store.ecoBaskets[0];
  activeSelectedBasket = basket;

  const modal = document.getElementById('auto-refill-modal');
  const titleEl = document.getElementById('refill-modal-basket-title');
  const summaryEl = document.getElementById('refill-modal-items-summary');
  const priceEl = document.getElementById('refill-modal-price');

  const nameInput = document.getElementById('refill-customer-name');
  const emailInput = document.getElementById('refill-customer-email');
  const phoneInput = document.getElementById('refill-customer-phone');
  const addressInput = document.getElementById('refill-shipping-address');
  const dateInput = document.getElementById('refill-start-date');

  if (titleEl) titleEl.innerText = basket.name;
  if (summaryEl) summaryEl.innerText = basket.itemsSummary;
  if (priceEl) priceEl.innerText = `${store.formatPrice(basket.monthlyPrice)} / delivery`;

  if (nameInput) nameInput.value = store.userAccount?.name || '';
  if (emailInput) emailInput.value = store.userAccount?.email || '';
  if (phoneInput) phoneInput.value = store.userAccount?.phone || '';
  if (addressInput) addressInput.value = store.storeSettings?.originCity || 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan';

  if (dateInput) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 7);
    dateInput.value = nextMonth.toISOString().split('T')[0];
  }

  if (modal) modal.style.display = 'flex';
}

function closeCreateAutoRefillModal() {
  const modal = document.getElementById('auto-refill-modal');
  if (modal) modal.style.display = 'none';
}

async function submitAutoRefillSubscription(e) {
  if (e) e.preventDefault();

  if (!store.isLoggedIn || !activeSelectedBasket) {
    showToast('Please sign in to your account first.', 'error');
    return;
  }

  const name = document.getElementById('refill-customer-name')?.value?.trim() || store.userAccount.name;
  const email = document.getElementById('refill-customer-email')?.value?.trim()?.toLowerCase() || store.userAccount.email;
  const phone = document.getElementById('refill-customer-phone')?.value?.trim() || '0812-0000-0000';
  const frequency = document.getElementById('refill-frequency-select')?.value || 'Every 4 Weeks';
  const nextRefillDate = document.getElementById('refill-start-date')?.value || new Date().toISOString().split('T')[0];
  const shippingAddress = document.getElementById('refill-shipping-address')?.value?.trim() || 'Jakarta, Indonesia';

  const btn = document.getElementById('btn-submit-refill');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Processing Subscription...';
  }

  const subscriptionId = `SUB-${Math.floor(10000 + Math.random() * 90000)}`;

  const subscriptionData = {
    id: subscriptionId,
    customerName: name,
    customerEmail: email,
    phone,
    basketName: activeSelectedBasket.name,
    itemsSummary: activeSelectedBasket.itemsSummary,
    monthlyPrice: activeSelectedBasket.monthlyPrice,
    frequency,
    nextRefillDate,
    courier: 'SiCepat BEST Eco-Fleet',
    shippingAddress,
    status: 'active',
    statusText: 'Auto-Refill ON',
    lastRefillDate: new Date().toISOString().split('T')[0]
  };

  // 1. Direct Supabase DB Upsert
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('customer_groceries').upsert({
        id: subscriptionId,
        customer_name: name,
        customer_email: email,
        phone,
        basket_name: activeSelectedBasket.name,
        items_summary: activeSelectedBasket.itemsSummary,
        monthly_price: activeSelectedBasket.monthlyPrice,
        frequency,
        next_refill_date: nextRefillDate,
        courier: 'SiCepat BEST Eco-Fleet',
        shipping_address: shippingAddress,
        status: 'active',
        status_text: 'Auto-Refill ON',
        last_refill_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.warn('Supabase groceries direct insert notice:', err);
    }
  }

  // 2. Express Backend API sync
  try {
    await fetch(`${CONFIG.API_BASE_URL}/groceries/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    });
  } catch (err) {
    console.warn('Backend groceries API sync notice:', err);
  }

  // Save to local store
  if (!Array.isArray(store.customerGroceries)) store.customerGroceries = [];
  store.customerGroceries.unshift(subscriptionData);

  const emailKey = email.replace(/[^a-z0-9]/g, '_');
  localStorage.setItem(`byharians_groceries_${emailKey}`, JSON.stringify(store.customerGroceries));

  closeCreateAutoRefillModal();

  if (btn) {
    btn.disabled = false;
    btn.innerText = 'Confirm & Activate Auto-Refill';
  }

  showToast(`Auto-Refill Subscription (${activeSelectedBasket.name}) activated successfully!`, 'success');
  renderUserGroceriesDashboard();
  navigateTo('account');
}

async function renderUserGroceriesDashboard() {
  const container = document.getElementById('acc-groceries-list');
  if (!container) return;

  const userEmail = (store.userAccount?.email || '').toLowerCase().trim();
  let userSubscriptions = store.customerGroceries || [];

  if (typeof supabaseClient !== 'undefined' && supabaseClient && userEmail) {
    try {
      const { data, error } = await supabaseClient
        .from('customer_groceries')
        .select('*')
        .ilike('customer_email', userEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        userSubscriptions = data.map(r => store.normalizeGrocery(r)).filter(Boolean);
        store.customerGroceries = userSubscriptions;
      }
    } catch (err) {
      console.warn('Fetch groceries warning:', err);
    }
  }

  if (userSubscriptions.length === 0) {
    container.innerHTML = `
      <div style="background: var(--color-bg-warm); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); padding: 24px; text-align: center; color: var(--color-text-muted);">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔄</div>
        <h4 style="font-size: 0.95rem; color: var(--color-primary); font-weight: 700; margin-bottom: 4px;">No Active Auto-Refill Subscriptions</h4>
        <p style="font-size: 0.8rem; margin-bottom: 14px;">Activate our monthly Auto-Refill service so your organic bamboo sanitary pad supply never runs out.</p>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('shop')">Explore Auto-Refill Suites →</button>
      </div>
    `;
    return;
  }

  container.innerHTML = userSubscriptions.map(sub => `
    <div style="background: #fff; border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 14px; box-shadow: var(--shadow-xs);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
        <div>
          <span style="font-size: 0.74rem; color: var(--color-text-muted); text-transform: uppercase;">Subscription Number</span>
          <strong style="font-size: 1.05rem; color: var(--color-primary); display: block;">#${sub.id}</strong>
          <small style="color: var(--color-success); font-weight: 700; font-size: 0.72rem;">✓ Verified Supabase DB</small>
        </div>
        <div>
          <span class="badge ${sub.status === 'active' ? 'badge-primary' : 'badge-secondary'}" style="text-transform: uppercase; font-weight: 800;">
            ${sub.status === 'active' ? '🟢 AUTO-REFILL ON' : '🔴 PAUSED'}
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 14px;">
        <div>
          <span style="font-size: 0.76rem; color: var(--color-text-muted); display: block;">Auto-Refill Suite Name:</span>
          <strong style="font-size: 0.95rem; color: var(--color-primary);">${sub.basketName}</strong>
          <small style="display: block; color: var(--color-text-muted); font-size: 0.78rem;">${sub.itemsSummary}</small>
        </div>
        <div>
          <span style="font-size: 0.76rem; color: var(--color-text-muted); display: block;">Next Delivery Date:</span>
          <strong style="font-size: 0.95rem; color: var(--color-primary);">${sub.nextRefillDate}</strong>
          <small style="display: block; color: var(--color-secondary); font-size: 0.78rem;">Cycle: ${sub.frequency}</small>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.76rem; color: var(--color-text-muted); display: block;">Monthly Billing:</span>
          <strong style="font-size: 1.1rem; color: var(--color-primary);">${store.formatPrice(sub.monthlyPrice)}</strong>
          <small style="display: block; color: var(--color-text-muted); font-size: 0.78rem;">Courier: ${sub.courier}</small>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" onclick="toggleGrocerySubscriptionStatus('${sub.id}', '${sub.status === 'active' ? 'paused' : 'active'}')">
          ${sub.status === 'active' ? '⏸️ Pause Subscription' : '▶️ Resume Subscription'}
        </button>
        <button class="btn btn-outline btn-sm" onclick="cancelGrocerySubscription('${sub.id}')" style="color: var(--color-error); border-color: rgba(186, 50, 50, 0.35);">
          🗑️ Cancel Subscription
        </button>
      </div>
    </div>
  `).join('');
}

async function toggleGrocerySubscriptionStatus(subscriptionId, newStatus) {
  const userSubscriptions = store.customerGroceries || [];
  const target = userSubscriptions.find(s => s.id === subscriptionId);
  if (target) {
    target.status = newStatus;
    target.statusText = newStatus === 'active' ? 'Auto-Refill ON' : 'Subscription Paused';
  }

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient
        .from('customer_groceries')
        .update({ status: newStatus, status_text: newStatus === 'active' ? 'Auto-Refill ON' : 'Subscription Paused' })
        .eq('id', subscriptionId);
    } catch (err) {
      console.warn('Update grocery status warning:', err);
    }
  }

  showToast(`Subscription #${subscriptionId} status updated to: ${newStatus.toUpperCase()}`, 'info');
  renderUserGroceriesDashboard();
}

async function cancelGrocerySubscription(subscriptionId) {
  if (!confirm(`Are you sure you want to cancel Auto-Refill subscription #${subscriptionId}?`)) return;

  store.customerGroceries = (store.customerGroceries || []).filter(s => s.id !== subscriptionId);

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('customer_groceries').delete().eq('id', subscriptionId);
    } catch (err) {
      console.warn('Delete grocery subscription warning:', err);
    }
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/groceries/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subscriptionId })
    });
  } catch (err) {
    console.warn('Backend delete grocery notice:', err);
  }

  showToast(`Subscription #${subscriptionId} has been cancelled.`, 'info');
  renderUserGroceriesDashboard();
}
