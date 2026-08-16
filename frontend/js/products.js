/**
 * BYHARIANS PRODUCT CATALOG & DETAILS MODULE
 */
function renderProductCardHTML(p) {
  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
        ${p.badge ? `<span class="badge badge-primary product-badge">${p.badge}</span>` : ''}
        <button class="wishlist-btn" title="Add to Wishlist" onclick="toggleWishlist('${p.id}', this)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      <div class="product-card-body">
        <div class="product-category">${p.categoryName}</div>
        <h3 class="product-title" onclick="openProductDetailModal('${p.id}')">${p.name}</h3>
        <p class="product-subtitle-type">${p.subType}</p>
        <div class="product-rating-row">
          <div class="rating-stars">★★★★★</div>
          <span class="rating-score">${p.rating}</span>
          <span class="reviews-count">(${p.reviewsCount})</span>
        </div>
        <p class="product-short-desc">${p.shortDesc}</p>
        <div class="product-price-row">
          <div>
            <span class="product-price-current">${store.formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span class="product-price-original">${store.formatPrice(p.originalPrice)}</span>` : ''}
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
  const grid = document.getElementById('shop-products-grid') || document.getElementById('home-featured-grid');
  if (!grid) return;
  grid.innerHTML = list.map(p => renderProductCardHTML(p)).join('');
}

function filterCategory(cat, btn) {
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  if (cat === 'all') {
    renderCatalogGrid(store.products);
  } else {
    const filtered = store.products.filter(p => p.category === cat);
    renderCatalogGrid(filtered);
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

  const addBtn = document.getElementById('modal-add-to-cart-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      addToCart(p.id);
      closeProductDetailModal();
    };
  }

  modal.style.display = 'flex';
}

function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.style.display = 'none';
}

function selectPackOption(btn, multiplier, basePrice) {
  document.querySelectorAll('.pack-opt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const priceEl = document.getElementById('modal-product-price');
  if (priceEl) {
    priceEl.innerText = store.formatPrice(basePrice * multiplier);
  }
}
