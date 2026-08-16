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
    showToast(`${p.name} (${pack.name}) berhasil ditambahkan ke keranjang!`, 'success');
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
  if (typeof showToast === 'function') showToast('Item dihapus dari keranjang', 'info');
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
      shipMsg.innerHTML = `<span>Selamat! Pesanan Anda berhak mendapat <strong>GRATIS Ongkir!</strong></span>`;
      shipFill.style.width = '100%';
    } else {
      const remaining = freeThreshold - calcs.subtotal;
      const pct = Math.min(100, Math.round((calcs.subtotal / freeThreshold) * 100));
      shipMsg.innerHTML = `<span>Tambah <strong>${store.formatPrice(remaining)}</strong> lagi untuk <strong>GRATIS Ongkir!</strong></span>`;
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
            <div style="font-size:0.76rem; color:var(--color-text-muted); margin-bottom:4px;">${item.packName} ${item.isSubscription ? '• Subskripsi' : ''}</div>
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

function applyPromoCode() {
  const input = document.getElementById('cart-coupon-input') || document.getElementById('checkout-coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  const coupon = store.coupons.find(c => c.code === code);
  if (coupon) {
    store.appliedCoupon = coupon;
    store.save();
    updateCartBadgeAndDrawer();
    if (store.currentView === 'checkout' && typeof renderCheckoutSummary === 'function') renderCheckoutSummary();
    if (typeof showToast === 'function') showToast(`Kupon "${code}" berhasil dipasang: diskon 15%!`, 'success');
  } else {
    if (typeof showToast === 'function') showToast('Kode kupon tidak valid. Gunakan "ECOPERIOD" untuk diskon 15%!', 'error');
  }
}
