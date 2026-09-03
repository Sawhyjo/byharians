/**
 * BYHARIANS CART & DRAWER MANAGEMENT MODULE
 */
function getCartCalculations() {
  const subtotal = store.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  let discount = 0;
  if (store.appliedCoupon) {
    discount = Math.round(subtotal * (store.appliedCoupon.discountPercent / 100));
  }
  let shippingCost = subtotal >= 150000 || subtotal === 0 ? 0 : 18000;
  let addOns = (store.plantTree ? 15000 : 0) + (store.giftWrap ? 20000 : 0);
  const grandTotal = Math.max(0, subtotal - discount + shippingCost + addOns);
  return { subtotal, discount, shippingCost, addOns, grandTotal, isFreeShip: shippingCost === 0 };
}

function addToCart(productId, packIndex = 0, isSubscription = false) {
  if (!store.isLoggedIn) {
    store.redirectAfterLogin = 'shop';
    if (typeof showToast === 'function') {
      showToast('Please sign in or create an account to start shopping.', 'info');
    }
    const alertBox = document.getElementById('checkout-auth-alert');
    if (alertBox) alertBox.style.display = 'flex';
    if (typeof navigateTo === 'function') navigateTo('login');
    return;
  }

  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  const pack = p.packOptions ? p.packOptions[packIndex] : { name: 'Standard', multiplier: 1 };
  const unitPrice = Math.round(p.price * pack.multiplier);

  const existing = store.cart.find(i => i.id === p.id && i.packName === pack.name && i.isSubscription === isSubscription);
  if (existing) {
    existing.quantity += 1;
  } else {
    store.cart.push({
      id: p.id,
      name: p.name,
      image: p.image,
      packName: pack.name,
      unitPrice: unitPrice,
      quantity: 1,
      isSubscription: isSubscription,
      intervalWeeks: isSubscription ? 4 : null
    });
  }

  store.save();
  updateCartBadgeAndDrawer();
  openCartDrawer();
  if (typeof showToast === 'function') {
    showToast(`${p.name} (${pack.name}) added to cart!`, 'success');
  }
}

function quickAddToCart(productId) {
  addToCart(productId, 0, false);
}

function updateCartItemQty(index, change) {
  if (store.cart[index]) {
    store.cart[index].quantity += change;
    if (store.cart[index].quantity <= 0) {
      store.cart.splice(index, 1);
    }
    store.save();
    updateCartBadgeAndDrawer();
    if (store.currentView === 'cart' && typeof renderFullCartPage === 'function') renderFullCartPage();
  }
}

function removeCartItem(index) {
  store.cart.splice(index, 1);
  store.save();
  updateCartBadgeAndDrawer();
  if (store.currentView === 'cart' && typeof renderFullCartPage === 'function') renderFullCartPage();
  if (typeof showToast === 'function') showToast('Item removed from cart', 'info');
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  updateCartBadgeAndDrawer();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function handleProceedToCheckout() {
  if (!store.isLoggedIn) {
    store.redirectAfterLogin = 'checkout';
    if (typeof showToast === 'function') {
      showToast('Please sign in or register to proceed to payment.', 'info');
    }
    const alertBox = document.getElementById('checkout-auth-alert');
    if (alertBox) alertBox.style.display = 'flex';
    if (typeof navigateTo === 'function') navigateTo('login');
    return;
  }

  if (store.cart.length === 0) {
    if (typeof showToast === 'function') showToast('Your cart is empty! Add items before proceeding.', 'warning');
    if (typeof navigateTo === 'function') navigateTo('shop');
    return;
  }

  if (typeof navigateTo === 'function') navigateTo('checkout');
}

function updateCartBadgeAndDrawer() {
  const countBadge = document.querySelectorAll('.cart-count-badge');
  const totalCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);

  countBadge.forEach(b => {
    b.innerText = totalCount;
    b.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  });

  const calcs = getCartCalculations();

  // Free shipping progress bar
  const shipMsg = document.getElementById('shipping-progress-msg');
  const shipFill = document.getElementById('shipping-progress-fill');
  const freeThreshold = 150000;
  if (shipMsg && shipFill) {
    if (calcs.subtotal >= freeThreshold) {
      shipMsg.innerHTML = `<span>Congratulations! Your order qualifies for <strong>FREE Shipping!</strong></span>`;
      shipFill.style.width = '100%';
    } else {
      const remaining = freeThreshold - calcs.subtotal;
      const pct = Math.min(100, Math.round((calcs.subtotal / freeThreshold) * 100));
      shipMsg.innerHTML = `<span>Add <strong>${store.formatPrice(remaining)}</strong> more for <strong>FREE Shipping!</strong></span>`;
      shipFill.style.width = `${pct}%`;
    }
  }

  const listEl = document.getElementById('cart-drawer-items') || document.getElementById('drawer-items-list');
  const emptyEl = document.getElementById('cart-empty-state');

  if (listEl) {
    if (store.cart.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      listEl.innerHTML = '';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      listEl.innerHTML = store.cart.map((item, idx) => `
        <div class="cart-item" style="display:grid; grid-template-columns:70px 1fr; gap:12px; padding:12px 0; border-bottom:1px solid var(--color-border); align-items:center;">
          <img src="${item.image}" alt="${item.name}" style="width:70px; height:70px; border-radius:12px; object-fit:cover;">
          <div>
            <div style="font-weight:800; font-size:0.9rem; color:var(--color-primary);">${item.name}</div>
            <div style="font-size:0.76rem; color:var(--color-text-muted); margin-bottom:4px;">${item.packName} ${item.isSubscription ? '• Subscription' : ''}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:800; color:var(--color-primary); font-size:0.9rem;">${store.formatPrice(item.unitPrice * item.quantity)}</span>
              <div class="quantity-stepper" style="display:flex; align-items:center; gap:4px; background:var(--color-bg-warm); padding:2px 8px; border-radius:var(--radius-full); border:1px solid var(--color-border);">
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)" style="border:none; background:none; cursor:pointer; font-weight:800;">-</button>
                <span style="font-size:0.82rem; font-weight:800; padding:0 6px;">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)" style="border:none; background:none; cursor:pointer; font-weight:800;">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  const subtotalEl = document.getElementById('drawer-subtotal-val');
  const grandTotalEl = document.getElementById('drawer-grandtotal-val');
  const discountRow = document.getElementById('drawer-discount-row');
  const discountVal = document.getElementById('drawer-discount-val');

  if (subtotalEl) subtotalEl.innerText = store.formatPrice(calcs.subtotal);
  if (grandTotalEl) grandTotalEl.innerText = store.formatPrice(calcs.grandTotal);
  if (discountRow && discountVal) {
    if (calcs.discount > 0) {
      discountRow.style.display = 'flex';
      discountVal.innerText = `-${store.formatPrice(calcs.discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
}

function renderFullCartPage() {
  const container = document.getElementById('full-cart-items-container');
  const summaryBox = document.getElementById('full-cart-summary-box');
  if (!container) return;

  if (store.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 60px 20px; background:#fff; border-radius:var(--radius-xl); border:1px solid var(--color-border);">
        <div style="width:64px; height:64px; margin: 0 auto 16px; background: rgba(15, 48, 29, 0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <h3 style="font-size:1.4rem; color:var(--color-primary); margin-bottom:8px;">Your Shopping Cart is Empty</h3>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:20px;">Explore our organic bamboo pads & eco-friendly menstrual care kits.</p>
        <button class="btn btn-primary" onclick="navigateTo('shop')">Explore Product Collection</button>
      </div>
    `;
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  if (summaryBox) summaryBox.style.display = 'block';

  container.innerHTML = `
    <div style="background:#fff; border-radius:var(--radius-xl); padding:28px; border:1px solid var(--color-border); box-shadow:var(--shadow-sm);">
      <h3 style="font-size:1.3rem; color:var(--color-primary); margin-bottom:20px; border-bottom:1px solid var(--color-border); padding-bottom:12px;">Item Keranjang (${store.cart.reduce((s, i) => s + i.quantity, 0)})</h3>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${store.cart.map((item, idx) => `
          <div style="display:grid; grid-template-columns:80px 1fr auto; gap:16px; align-items:center; padding-bottom:16px; border-bottom:1px solid var(--color-border);">
            <img src="${item.image}" alt="${item.name}" style="width:80px; height:80px; border-radius:12px; object-fit:cover;">
            <div>
              <h4 style="font-size:1rem; color:var(--color-primary); margin-bottom:4px;">${item.name}</h4>
              <div style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:6px;">Varian: ${item.packName} ${item.isSubscription ? '• Subskripsi' : ''}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--color-primary);">${store.formatPrice(item.unitPrice)} per pack</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
              <div class="quantity-stepper" style="display:flex; align-items:center; gap:6px; background:var(--color-bg-warm); padding:4px 10px; border-radius:var(--radius-full); border:1px solid var(--color-border);">
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)" style="border:none; background:none; cursor:pointer; font-weight:800; font-size:1.1rem;">-</button>
                <span style="font-size:0.9rem; font-weight:800; padding:0 8px;">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)" style="border:none; background:none; cursor:pointer; font-weight:800; font-size:1.1rem;">+</button>
              </div>
              <div style="font-size:1rem; font-weight:900; color:var(--color-primary);">${store.formatPrice(item.unitPrice * item.quantity)}</div>
              <button onclick="removeCartItem(${idx})" style="font-size:0.78rem; color:var(--color-error); background:none; border:none; cursor:pointer; font-weight:700;">Hapus Item</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const calcs = getCartCalculations();
  const subEl = document.getElementById('full-cart-subtotal');
  const shipEl = document.getElementById('full-cart-shipping');
  const grandEl = document.getElementById('full-cart-grandtotal');

  if (subEl) subEl.innerText = store.formatPrice(calcs.subtotal);
  if (shipEl) shipEl.innerText = calcs.shippingCost === 0 ? 'GRATIS' : store.formatPrice(calcs.shippingCost);
  if (grandEl) grandEl.innerText = store.formatPrice(calcs.grandTotal);
}

function applyPromoCode() {
  const input = document.getElementById('cart-coupon-input') || document.getElementById('checkout-coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  const coupon = store.coupons.find(c => c.code === code);
  if (coupon) {
    store.appliedCoupon = coupon;
    store.save();
    updateCartBadgeAndDrawer();
    if (store.currentView === 'cart') renderFullCartPage();
    if (store.currentView === 'checkout' && typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
    if (typeof showToast === 'function') showToast(`Kupon "${code}" berhasil dipasang: diskon 15%!`, 'success');
  } else {
    if (typeof showToast === 'function') showToast('Kode kupon tidak valid. Gunakan "ECOPERIOD" untuk diskon 15%!', 'error');
  }
}
