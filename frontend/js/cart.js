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
  showToast(`Added ${p.name} (${pack.name}) to your eco-bag!`, 'success');
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
    if (store.currentView === 'cart') renderFullCartPage();
  }
}

function removeCartItem(index) {
  store.cart.splice(index, 1);
  store.save();
  updateCartBadgeAndDrawer();
  if (store.currentView === 'cart') renderFullCartPage();
  showToast('Item removed from cart', 'info');
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  updateCartBadgeAndDrawer();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
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

  const listEl = document.getElementById('drawer-items-list');
  if (!listEl) return;

  if (store.cart.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding: 48px 20px; color: var(--color-text-muted);">
        <div style="font-size:2.5rem; margin-bottom:12px;">🛒</div>
        <p style="font-weight:600; color:var(--color-primary);">Keranjang Belanja Kosong</p>
        <small>Pilih pembalut bambu organik pilihan Anda.</small>
      </div>
    `;
  } else {
    listEl.innerHTML = store.cart.map((item, idx) => `
      <div style="display:grid; grid-template-columns: 60px 1fr auto; gap:12px; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--color-border);">
        <img src="${item.image}" style="width:60px; height:60px; border-radius:var(--radius-sm); object-fit:cover;">
        <div>
          <div style="font-weight:700; font-size:0.88rem; color:var(--color-primary);">${item.name}</div>
          <div style="font-size:0.75rem; color:var(--color-text-muted);">${item.packName}</div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--color-primary); margin-top:2px;">${store.formatPrice(item.unitPrice * item.quantity)}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <div class="quantity-stepper">
            <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
            <span style="font-size:0.82rem; font-weight:700; padding:0 6px;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
          </div>
          <button onclick="removeCartItem(${idx})" style="font-size:0.72rem; color:var(--color-error);">Hapus</button>
        </div>
      </div>
    `).join('');
  }

  const calcs = getCartCalculations();
  const subtotalEl = document.getElementById('drawer-subtotal-val');
  const grandTotalEl = document.getElementById('drawer-grandtotal-val');
  if (subtotalEl) subtotalEl.innerText = store.formatPrice(calcs.subtotal);
  if (grandTotalEl) grandTotalEl.innerText = store.formatPrice(calcs.grandTotal);
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
    if (store.currentView === 'checkout') renderCheckoutSummary();
    showToast(`Code "${code}" applied: ${coupon.description}!`, 'success');
  } else {
    showToast('Invalid coupon code. Try "ECOPERIOD" for 15% off!', 'error');
  }
}
