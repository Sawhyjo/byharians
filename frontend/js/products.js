/**
 * BYHARIANS PRODUCT CATALOG & DETAILS MODULE
 */
function renderProductCardHTML(p) {
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy" onerror="this.src='assets/images/product_day_pads.jpg'">
        ${p.badge ? `<div class="product-badge-stack"><span class="product-badge badge-bestseller">${p.badge}</span></div>` : ''}
        <button class="quick-view-btn" onclick="openProductDetailModal('${p.id}')">Lihat Detail</button>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-subtype-tag">${p.categoryName}</span>
          <span class="rating-score" style="font-weight:700; color:var(--color-primary); font-size:0.82rem;">★ ${p.rating} (${p.reviewsCount})</span>
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

function openProductDetailModal(productId) {
  const p = store.products.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;

  const imgEl = document.getElementById('modal-product-img');
  const titleEl = document.getElementById('modal-product-title');
  const catEl = document.getElementById('modal-product-cat');
  const priceEl = document.getElementById('modal-product-price');
  const descEl = document.getElementById('modal-product-desc');
  const packContainer = document.getElementById('modal-pack-options');

  if (imgEl) imgEl.src = p.image;
  if (titleEl) titleEl.innerText = p.name;
  if (catEl) catEl.innerText = `${p.categoryName} • ${p.subType}`;
  if (priceEl) priceEl.innerText = store.formatPrice(p.price);
  if (descEl) descEl.innerText = p.description;

  if (packContainer && p.packOptions) {
    packContainer.innerHTML = p.packOptions.map((opt, idx) => `
      <button class="pack-opt-btn ${idx === 0 ? 'active' : ''}" onclick="selectPackOption(this, ${opt.multiplier}, ${p.price})">
        ${opt.name}
      </button>
    `).join('');
  }

  modal.style.display = 'flex';
}

function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.style.display = 'none';
}
