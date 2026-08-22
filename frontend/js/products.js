/**
 * BYHARIANS PRODUCT CATALOG & DETAILS MODULE
 */

let currentDetailProduct = null;
let currentSelectedPack = null;
let currentDetailQty = 1;

function renderProductCardHTML(p) {
  const badgeHTML = p.badge ? `<div class="product-badge-stack"><span class="product-badge badge-bestseller">${p.badge}</span></div>` : '';

  return `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy" onerror="this.src='assets/images/product_day_pads.jpg'">
        ${badgeHTML}
        <button class="quick-view-btn" onclick="openProductDetailModal('${p.id}')">Lihat Detail</button>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-subtype-tag">${p.categoryName}</span>
        </div>
        <h3 class="product-title" onclick="openProductDetailModal('${p.id}')" style="cursor:pointer; font-size:1.05rem; font-weight:700; color:var(--color-primary); margin-bottom:4px;">${p.name}</h3>
        <p class="product-subtype-tag" style="margin-bottom:8px; color:var(--color-secondary); font-weight:600; font-size:0.78rem;">${p.subType}</p>
        <p class="product-short-desc" style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:14px; line-height:1.4;">${p.shortDesc}</p>
        <div class="product-price-row" style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-weight:800; font-size:1.1rem; color:var(--color-primary);">${store.formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span style="font-size:0.8rem; color:var(--color-text-muted); text-decoration:line-through; margin-left:6px;">${store.formatPrice(p.originalPrice)}</span>` : ''}
          </div>
          <button class="btn btn-secondary btn-sm" onclick="quickAddToCart('${p.id}')">
            + Tambah
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCatalogGrid(productsToRender) {
  const list = productsToRender || store.products;
  const featuredGrid = document.getElementById('home-featured-grid');
  const shopGrid = document.getElementById('products-grid-container') || document.getElementById('shop-products-grid');
  const html = list.map(p => renderProductCardHTML(p)).join('');
  if (featuredGrid) featuredGrid.innerHTML = html;
  if (shopGrid) shopGrid.innerHTML = html;
}

function filterCategory(cat, btn) {
  filterByCategory(cat, btn);
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.cat-tab-btn, .filter-btn').forEach(b => {
    if (b.getAttribute('data-category') === cat) b.classList.add('active');
    else b.classList.remove('active');
  });

  if (cat === 'all') {
    renderCatalogGrid(store.products);
  } else {
    const filtered = store.products.filter(p => p.category === cat);
    renderCatalogGrid(filtered);
  }
}

function filterByFlow(flowVal) {
  if (flowVal === 'all') {
    renderCatalogGrid(store.products);
  } else {
    const targetLevel = parseInt(flowVal);
    const filtered = store.products.filter(p => p.flowLevel === targetLevel);
    renderCatalogGrid(filtered);
  }
}

function filterByPrice(maxPrice) {
  const valDisplay = document.getElementById('price-val-display');
  if (valDisplay) valDisplay.innerText = store.formatPrice(maxPrice);

  const filtered = store.products.filter(p => p.price <= parseInt(maxPrice));
  renderCatalogGrid(filtered);
}

function resetFilters() {
  const priceSlider = document.getElementById('price-slider-input');
  if (priceSlider) priceSlider.value = 350000;
  const valDisplay = document.getElementById('price-val-display');
  if (valDisplay) valDisplay.innerText = store.formatPrice(350000);

  const allFlowRadio = document.querySelector('input[name="flow-filter"][value="all"]');
  if (allFlowRadio) allFlowRadio.checked = true;

  filterByCategory('all');
}

function toggleShopFilter() {
  const layout = document.getElementById('shop-layout-container');
  const sidebar = document.getElementById('shop-filter-sidebar');
  const btnText = document.getElementById('filter-toggle-btn-text');

  if (layout) {
    const isCurrentlyHidden = layout.classList.contains('filter-hidden') || (sidebar && sidebar.style.display === 'none');
    if (isCurrentlyHidden) {
      layout.classList.remove('filter-hidden');
      if (sidebar) sidebar.style.display = 'block';
      if (btnText) btnText.innerText = 'Sembunyikan Filter';
    } else {
      layout.classList.add('filter-hidden');
      if (sidebar) sidebar.style.display = 'none';
      if (btnText) btnText.innerText = 'Tampilkan Filter';
    }
  }
}

/**
 * E-COMMERCE PRODUCT DETAIL MODAL HANDLERS
 */
function openProductDetailModal(productId) {
  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  currentDetailProduct = p;
  currentDetailQty = 1;
  currentSelectedPack = (p.packOptions && p.packOptions.length > 0) ? p.packOptions[0] : null;

  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;

  const imgEl = document.getElementById('modal-product-img');
  const catEl = document.getElementById('modal-product-cat');
  const titleEl = document.getElementById('modal-product-title');
  const subTypeEl = document.getElementById('modal-product-subtype');
  const flowEl = document.getElementById('modal-product-flow');
  const descEl = document.getElementById('modal-product-desc');
  const specsContainer = document.getElementById('modal-product-specs');
  const compContainer = document.getElementById('modal-product-composition');
  const packContainer = document.getElementById('modal-pack-options');

  if (imgEl) {
    imgEl.src = p.image;
    imgEl.alt = p.name;
  }
  if (catEl) catEl.innerText = p.categoryName || 'Pembalut Wanita Organik';
  if (titleEl) titleEl.innerText = p.name;
  if (subTypeEl) subTypeEl.innerText = p.subType || '';
  if (flowEl) flowEl.innerText = `🩸 ${p.flowText || 'Kenyamanan Alami'}`;
  if (descEl) descEl.innerText = p.description || p.shortDesc || '';

  // Render Specifications Grid
  if (specsContainer) {
    const stockBadge = (p.stock && p.stock > 0) 
      ? `<span class="spec-value-badge in-stock">✓ Tersedia (${p.stock} unit)</span>` 
      : `<span class="spec-value-badge out-stock">Stok Habis</span>`;

    specsContainer.innerHTML = `
      <div class="spec-item">
        <span class="spec-label">Ukuran / Panjang:</span>
        <span class="spec-value">${p.lengthMm || 'Standar Ergonomis'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Daya Serap:</span>
        <span class="spec-value">${p.absorbencyMl || 'Tinggi'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Status Stok:</span>
        <span class="spec-value">${stockBadge}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Sertifikasi & Keamanan:</span>
        <span class="spec-value">100% Biodegradable • 0% Klorin & Bebas Pemutih</span>
      </div>
    `;
  }

  // Render Material Compositions
  if (compContainer) {
    if (p.composition && Array.isArray(p.composition)) {
      compContainer.innerHTML = p.composition.map(c => `
        <span class="composition-chip">🌱 ${c}</span>
      `).join('');
    } else {
      compContainer.innerHTML = `<span class="composition-chip">🌱 Serat Bambu Alami</span>`;
    }
  }

  // Render Pack Options
  if (packContainer && p.packOptions) {
    packContainer.innerHTML = p.packOptions.map((opt, idx) => `
      <button type="button" class="pack-opt-btn ${idx === 0 ? 'active' : ''}" onclick="selectDetailPackOption(${idx})">
        ${opt.name}
      </button>
    `).join('');
  }

  updateModalTotalPrice();
  modal.style.display = 'flex';
}

function selectDetailPackOption(idx) {
  if (!currentDetailProduct || !currentDetailProduct.packOptions) return;
  currentSelectedPack = currentDetailProduct.packOptions[idx];

  const buttons = document.querySelectorAll('#modal-pack-options .pack-opt-btn');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  updateModalTotalPrice();
}

function decreaseDetailQty() {
  if (currentDetailQty > 1) {
    currentDetailQty--;
    updateModalTotalPrice();
  }
}

function increaseDetailQty() {
  if (currentDetailProduct && currentDetailQty < (currentDetailProduct.stock || 99)) {
    currentDetailQty++;
    updateModalTotalPrice();
  }
}

function updateModalTotalPrice() {
  if (!currentDetailProduct) return;

  const basePrice = currentDetailProduct.price;
  const multiplier = currentSelectedPack ? currentSelectedPack.multiplier : 1;
  const unitPrice = Math.round(basePrice * multiplier);
  const totalPrice = unitPrice * currentDetailQty;

  const priceEl = document.getElementById('modal-product-price');
  const origPriceEl = document.getElementById('modal-product-orig-price');
  const qtyInput = document.getElementById('modal-product-qty');

  if (priceEl) priceEl.innerText = store.formatPrice(totalPrice);
  if (origPriceEl) {
    if (currentDetailProduct.originalPrice) {
      const origTotal = Math.round(currentDetailProduct.originalPrice * multiplier * currentDetailQty);
      origPriceEl.innerText = store.formatPrice(origTotal);
      origPriceEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
    }
  }
  if (qtyInput) qtyInput.value = currentDetailQty;
}

function addDetailToCart(isBuyNow = false) {
  if (!currentDetailProduct) return;

  const itemToAdd = {
    ...currentDetailProduct,
    selectedPack: currentSelectedPack ? currentSelectedPack.name : 'Standard Pack',
    price: Math.round(currentDetailProduct.price * (currentSelectedPack ? currentSelectedPack.multiplier : 1)),
    qty: currentDetailQty
  };

  if (typeof addToCartWithQty === 'function') {
    addToCartWithQty(itemToAdd, currentDetailQty);
  } else if (typeof quickAddToCart === 'function') {
    for (let i = 0; i < currentDetailQty; i++) {
      quickAddToCart(currentDetailProduct.id);
    }
  }

  closeProductDetailModal();

  if (isBuyNow) {
    navigateTo('checkout');
  } else {
    if (typeof showToast === 'function') {
      showToast(`${currentDetailProduct.name} (${itemToAdd.selectedPack}) ditambahkan ke keranjang!`, 'success');
    }
  }
}

function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.style.display = 'none';
}
