/**
 * BYHARIANS OPERATIONS & ADMIN BACK-OFFICE MODULE
 * Instant Sub-Tab Routing & Template/Supabase Order Integration
 */

// Global RBAC State
let currentAdminSubTab = 'overview';

// ==========================================
// 1. AUTHENTICATION & RBAC ROLE GUARD
// ==========================================
function switchAdminRoleRBAC(role) {
  store.adminRole = 'super_admin';
  localStorage.setItem('byharians_admin_role', 'super_admin');
  applyRBACPermissionsUI();
}

function applyRBACPermissionsUI() {
  store.adminRole = 'super_admin';
  const subTabBtns = document.querySelectorAll('.admin-subtab-bar .cat-tab-btn');
  subTabBtns.forEach(btn => {
    btn.style.display = 'inline-block';
  });
}

function handleAdminSignOut() {
  store.isAdmin = false;
  store.isLoggedIn = false;
  localStorage.removeItem('byharians_user');
  localStorage.removeItem('byharians_admin_role');
  localStorage.removeItem('byharians_cart_guest');

  if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
    supabaseClient.auth.signOut().catch(() => {});
  }

  store.save();
  if (typeof updateHeaderAuthUI === 'function') updateHeaderAuthUI();
  showToast('Admin berhasil keluar dari sistem.', 'success');
  navigateTo('home');
}

// ==========================================
// SUB-TAB SWITCHING & ROUTING (INSTANT DISPLAY)
// ==========================================
function switchAdminSubTab(tabName = 'overview') {
  switchAdminMainTab(tabName);
}

function switchAdminMainTab(tabName) {
  currentAdminSubTab = tabName;

  document.querySelectorAll('.admin-subtab-bar .cat-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-subtab') === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.style.display = 'none';
  });

  const activeTabEl = document.getElementById(`admin-tab-${tabName}`);
  if (activeTabEl) activeTabEl.style.display = 'block';

  // Render immediately for instant sub-tab switching
  renderTabContent(tabName);

  // Background sync with database
  syncAdminDatabaseOrders().then(() => {
    renderTabContent(tabName);
  }).catch(err => {
    console.warn('Background sync warning:', err);
  });
}

function renderTabContent(tabName) {
  if (tabName === 'overview') {
    renderAdminKPIs();
    renderAdminSalesTrendChart();
    renderTopSellingProductsTable();
  } else if (tabName === 'products') {
    renderAdminProductsTable();
  } else if (tabName === 'orders') {
    renderAdminOrdersTable();
  } else if (tabName === 'packages') {
    renderAdminPackagesTable();
  } else if (tabName === 'customers') {
    renderAdminCustomersTable();
  } else if (tabName === 'promotions') {
    renderAdminPromotionsTable();
  } else if (tabName === 'settings') {
    loadAdminSettingsForm();
  }
}

// ==========================================
// DATABASE & REALTIME ORDERS SYNC
// ==========================================
let isSupabaseRealtimeSubscribed = false;

async function syncAdminDatabaseOrders() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(r => store.normalizeOrder(r)).filter(Boolean);
        normalized.forEach(o => store.saveGlobalOrder(o));
        store.orders = normalized;
      }

      if (!isSupabaseRealtimeSubscribed) {
        isSupabaseRealtimeSubscribed = true;
        supabaseClient
          .channel('admin-orders-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
            if (payload.new) {
              const formatted = store.normalizeOrder(payload.new);
              if (formatted) {
                store.saveGlobalOrder(formatted);
                renderTabContent(currentAdminSubTab);
              }
            }
          })
          .subscribe();
      }
    } catch (err) {
      console.warn('Supabase Direct Orders Sync warning:', err);
    }
  }

  try {
    const resp = await fetch(`${CONFIG.API_BASE_URL}/orders`);
    if (resp.ok) {
      const dbOrders = await resp.json();
      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        const normalized = dbOrders.map(r => store.normalizeOrder(r)).filter(Boolean);
        normalized.forEach(o => store.saveGlobalOrder(o));
      }
    }
  } catch (err) {
    console.warn('Database orders sync warning:', err);
  }

  return store.orders || [];
}

// ==========================================
// HELPER: COMBINED ORDERS & CUSTOMERS
// ==========================================
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAllOrdersCombined() {
  const globalOrders = typeof store.getGlobalOrders === 'function' ? store.getGlobalOrders() : [];
  const allOrdersMap = new Map();

  (store.orders || []).forEach(o => { if (o && o.id) allOrdersMap.set(o.id, o); });
  (globalOrders || []).forEach(o => { if (o && o.id) allOrdersMap.set(o.id, o); });

  return Array.from(allOrdersMap.values());
}

function getCustomersFromSupabaseOrders() {
  const ordersList = getAllOrdersCombined();
  const customerMap = new Map();

  ordersList.forEach(o => {
    const rawEmail = (o.customerEmail || o.email || o.customerName || 'pelanggan@byharians.id').toLowerCase().trim();
    const name = o.customerName || 'Pelanggan BYHARIANS';
    const phone = o.customerPhone || '0812-XXXX-XXXX';
    const date = o.date || new Date().toISOString().split('T')[0];

    if (!customerMap.has(rawEmail)) {
      customerMap.set(rawEmail, {
        id: `CUST-${Math.abs(hashCode(rawEmail) % 1000).toString().padStart(3, '0')}`,
        name,
        email: rawEmail,
        phone,
        totalOrders: 0,
        lifetimeSpend: 0,
        ecoPoints: 0,
        joinDate: date,
        orders: []
      });
    }

    const cust = customerMap.get(rawEmail);
    cust.totalOrders += 1;
    if (o.status !== 'canceled') {
      cust.lifetimeSpend += (o.total || 0);
    }
    cust.ecoPoints = Math.floor(cust.lifetimeSpend / 1000);
    cust.orders.push(o);

    if (new Date(date) < new Date(cust.joinDate)) {
      cust.joinDate = date;
    }
  });

  return Array.from(customerMap.values());
}

// ==========================================
// 2. DASHBOARD MAIN OVERVIEW & METRICS
// ==========================================
function renderAdminKPIs() {
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiOrders = document.getElementById('kpi-orders');
  const kpiActiveUsers = document.getElementById('kpi-active-users');
  const kpiLowStock = document.getElementById('kpi-low-stock');

  const ordersList = getAllOrdersCombined();
  const totalRevenue = ordersList.filter(o => o.status !== 'canceled').reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = ordersList.filter(o => o.status !== 'canceled').length;
  const realCustomers = getCustomersFromSupabaseOrders();

  const lowStockCount = (store.products || []).filter(p => (p.stock !== undefined && p.stock < 15)).length;

  if (kpiRevenue) kpiRevenue.innerText = store.formatPrice(totalRevenue);
  if (kpiOrders) kpiOrders.innerText = totalOrders;
  if (kpiActiveUsers) kpiActiveUsers.innerText = `${realCustomers.length} User`;
  if (kpiLowStock) kpiLowStock.innerText = `${lowStockCount} Produk`;
}

function renderAdminSalesTrendChart() {
  const canvas = document.getElementById('adminRevenueCanvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth || 600;
  const height = canvas.height = 240;

  ctx.clearRect(0, 0, width, height);

  const ordersList = getAllOrdersCombined().filter(o => o.status !== 'canceled');

  let points = [0, 0, 0, 0, 0, 0, 0];
  if (ordersList.length > 0) {
    ordersList.forEach((o, i) => {
      const idx = i % 7;
      points[idx] += (o.total || 0);
    });
  }

  const maxVal = Math.max(...points, 100000);
  const stepX = width / (points.length - 1);

  ctx.beginPath();
  ctx.strokeStyle = '#0F301D';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';

  points.forEach((val, idx) => {
    const x = idx * stepX;
    const y = height - (val / maxVal * (height - 60)) - 20;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(15, 48, 29, 0.25)');
  grad.addColorStop(1, 'rgba(15, 48, 29, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function renderTopSellingProductsTable() {
  const container = document.getElementById('admin-top-products-tbody');
  if (!container) return;

  const ordersList = getAllOrdersCombined().filter(o => o.status !== 'canceled');
  const salesMap = new Map();

  // Aggregate real items purchased in Supabase DB orders
  ordersList.forEach(o => {
    (o.items || []).forEach(item => {
      const name = item.name || 'Produk Organik BYHARIANS';
      const qty = Number(item.quantity || item.qty || 1);
      const price = Number(item.price || 39000);

      if (!salesMap.has(name)) {
        salesMap.set(name, {
          name,
          unitsSold: 0,
          totalRevenue: 0,
          price
        });
      }

      const entry = salesMap.get(name);
      entry.unitsSold += qty;
      entry.totalRevenue += (qty * price);
    });
  });

  if (salesMap.size > 0) {
    const sortedSales = Array.from(salesMap.values()).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

    container.innerHTML = sortedSales.map((item, idx) => {
      const matchedProd = (store.products || []).find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
      const image = matchedProd.image || 'assets/images/product_day_pads.jpg';
      const categoryName = matchedProd.categoryName || 'Pembalut Wanita Organik';
      const subType = matchedProd.subType || 'Regular / Day';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${image}" style="width:36px; height:36px; object-fit:cover; border-radius:8px;" onerror="this.src='assets/images/product_day_pads.jpg'">
              <div><strong>${item.name}</strong><br><small style="color:var(--color-text-muted);">${subType}</small></div>
            </div>
          </td>
          <td><span class="badge badge-primary">${categoryName}</span></td>
          <td>${store.formatPrice(item.price)}</td>
          <td><strong>${item.unitsSold} unit</strong></td>
          <td style="color:var(--color-primary); font-weight:800;">${store.formatPrice(item.totalRevenue)}</td>
        </tr>
      `;
    }).join('');
    return;
  }

  // Fallback if no order items purchased yet
  const catalogProducts = (store.products || []).slice(0, 5);
  if (catalogProducts.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-text-muted);">Belum ada data penjualan produk.</td></tr>`;
    return;
  }

  container.innerHTML = catalogProducts.map((p, idx) => `
    <tr>
      <td><strong>#${idx + 1}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${p.image}" style="width:36px; height:36px; object-fit:cover; border-radius:8px;" onerror="this.src='assets/images/product_day_pads.jpg'">
          <div><strong>${p.name}</strong><br><small style="color:var(--color-text-muted);">${p.subType}</small></div>
        </div>
      </td>
      <td><span class="badge badge-primary">${p.categoryName}</span></td>
      <td>${store.formatPrice(p.price)}</td>
      <td><strong>0 unit</strong></td>
      <td style="color:var(--color-primary); font-weight:800;">Rp 0</td>
    </tr>
  `).join('');
}

// ==========================================
// 3. PRODUCT & INVENTORY MANAGEMENT (/admin/products)
// ==========================================
function renderAdminProductsTable() {
  const container = document.getElementById('admin-products-tbody');
  if (!container) return;

  const searchInput = document.getElementById('admin-product-search');
  const catFilter = document.getElementById('admin-product-cat-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCat = catFilter ? catFilter.value : 'all';

  let list = store.products || [];
  if (selectedCat !== 'all') list = list.filter(p => p.category === selectedCat);
  if (query) list = list.filter(p => p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)));

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--color-text-muted);">Tidak ada produk ditemukan.</td></tr>`;
    return;
  }

  container.innerHTML = list.map(p => {
    const stock = p.stock !== undefined ? p.stock : 100;
    let badgeHtml = '';
    if (stock >= 15) {
      badgeHtml = `<span style="background:#E8F5EE; color:#126338; padding:4px 10px; border-radius:var(--radius-full); font-weight:800; font-size:0.76rem;">In Stock (${stock}) 🟢</span>`;
    } else if (stock > 0) {
      badgeHtml = `<span style="background:#FFF9E6; color:#B47C04; padding:4px 10px; border-radius:var(--radius-full); font-weight:800; font-size:0.76rem;">Low Stock (${stock}) ⚠️</span>`;
    } else {
      badgeHtml = `<span style="background:#FDE8E8; color:#BA3232; padding:4px 10px; border-radius:var(--radius-full); font-weight:800; font-size:0.76rem;">Out of Stock (0) 🔴</span>`;
    }

    return `
      <tr>
        <td><img src="${p.image}" style="width:44px; height:44px; object-fit:cover; border-radius:10px; border:1px solid var(--color-border);" onerror="this.src='assets/images/product_day_pads.jpg'"></td>
        <td>
          <strong>${p.name}</strong><br>
          <code style="font-size:0.72rem; color:var(--color-secondary); font-weight:700;">${p.sku || p.id.toUpperCase()}</code>
        </td>
        <td><span class="badge badge-primary">${p.categoryName}</span></td>
        <td><strong>${store.formatPrice(p.price)}</strong></td>
        <td>${p.weightGrams || 150}g</td>
        <td>${badgeHtml}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.id}')">Edit</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteAdminProduct('${p.id}')" style="color:var(--color-error); border-color:rgba(186,50,50,0.3);">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminProductsList() {
  renderAdminProductsTable();
}

function openCreateProductModal() {
  const modal = document.getElementById('admin-product-modal');
  const title = document.getElementById('admin-product-modal-title');
  if (!modal) return;

  if (title) title.innerText = 'Buat Produk Baru';
  document.getElementById('admin-prod-id').value = '';
  document.getElementById('admin-prod-name').value = '';
  document.getElementById('admin-prod-sku').value = `BYH-PROD-${Date.now().toString().slice(-4)}`;
  document.getElementById('admin-prod-cat').value = 'pads';
  document.getElementById('admin-prod-subtype').value = 'Regular / Day (240mm)';
  document.getElementById('admin-prod-price').value = '39000';
  document.getElementById('admin-prod-orig-price').value = '49000';
  document.getElementById('admin-prod-weight').value = '150';
  document.getElementById('admin-prod-stock').value = '100';
  document.getElementById('admin-prod-badge').value = 'Produk Baru';
  document.getElementById('admin-prod-image').value = 'assets/images/product_day_pads.jpg';
  document.getElementById('admin-prod-short-desc').value = 'Pembalut organik selembut sutra dari 100% bambu alami.';
  document.getElementById('admin-prod-desc').value = 'Didesain untuk kenyamanan seharian, terurai 100% dalam 180 hari, 0% klorin, dan 0% mikroplastik.';

  modal.style.display = 'flex';
}

function openEditProductModal(productId) {
  const p = (store.products || []).find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById('admin-product-modal');
  const title = document.getElementById('admin-product-modal-title');
  if (!modal) return;

  if (title) title.innerText = `Edit Produk: ${p.name}`;
  document.getElementById('admin-prod-id').value = p.id;
  document.getElementById('admin-prod-name').value = p.name;
  document.getElementById('admin-prod-sku').value = p.sku || p.id.toUpperCase();
  document.getElementById('admin-prod-cat').value = p.category;
  document.getElementById('admin-prod-subtype').value = p.subType;
  document.getElementById('admin-prod-price').value = p.price;
  document.getElementById('admin-prod-orig-price').value = p.originalPrice || '';
  document.getElementById('admin-prod-weight').value = p.weightGrams || 150;
  document.getElementById('admin-prod-stock').value = p.stock !== undefined ? p.stock : 100;
  document.getElementById('admin-prod-badge').value = p.badge || '';
  document.getElementById('admin-prod-image').value = p.image;
  document.getElementById('admin-prod-short-desc').value = p.shortDesc || '';
  document.getElementById('admin-prod-desc').value = p.description || '';

  modal.style.display = 'flex';
}

function closeAdminProductModal() {
  const modal = document.getElementById('admin-product-modal');
  if (modal) modal.style.display = 'none';
}

async function saveAdminProductForm(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('admin-prod-id').value;
  const name = document.getElementById('admin-prod-name').value;
  const sku = document.getElementById('admin-prod-sku').value;
  const category = document.getElementById('admin-prod-cat').value;
  const subType = document.getElementById('admin-prod-subtype').value;
  const price = parseInt(document.getElementById('admin-prod-price').value) || 0;
  const originalPrice = parseInt(document.getElementById('admin-prod-orig-price').value) || null;
  const weightGrams = parseInt(document.getElementById('admin-prod-weight').value) || 150;
  const stock = parseInt(document.getElementById('admin-prod-stock').value) || 0;
  const badge = document.getElementById('admin-prod-badge').value;
  let image = document.getElementById('admin-prod-image').value.trim();
  const shortDesc = document.getElementById('admin-prod-short-desc').value;
  const description = document.getElementById('admin-prod-desc').value;

  if (!image) {
    image = 'assets/images/product_day_pads.jpg';
  }

  let categoryName = 'Pembalut Wanita Organik';
  if (category === 'liners') categoryName = 'Panty Liner Organik';
  if (category === 'kits') categoryName = 'Ritual Menstrual Kit';

  let targetProd = null;

  if (id) {
    const idx = store.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      store.products[idx] = {
        ...store.products[idx],
        name, sku, category, categoryName, subType, price, originalPrice, weightGrams, stock, badge, image, shortDesc, description
      };
      targetProd = store.products[idx];
    }
  } else {
    targetProd = {
      id: `byh-prod-${Date.now().toString().slice(-4)}`,
      name, sku, category, categoryName, subType, price, originalPrice, weightGrams, stock, badge, image, shortDesc, description,
      rating: 5.0, reviewsCount: 1, flowLevel: 3, isEcoCertified: true
    };
    store.products.unshift(targetProd);
  }

  store.save();

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('products').upsert({
        id: targetProd.id,
        name: targetProd.name,
        sku: targetProd.sku,
        category: targetProd.category,
        category_name: targetProd.categoryName,
        subtype: targetProd.subType,
        price: targetProd.price,
        original_price: targetProd.originalPrice,
        weight_grams: targetProd.weightGrams,
        stock: targetProd.stock,
        badge: targetProd.badge,
        image: targetProd.image,
        short_desc: targetProd.shortDesc,
        description: targetProd.description
      });
    } catch (err) {
      console.warn('Supabase product upsert warning:', err);
    }
  }

  closeAdminProductModal();
  renderAdminProductsTable();

  if (typeof renderCatalogGrid === 'function') {
    renderCatalogGrid();
  }

  showToast('Data produk & gambar berhasil diperbarui dan tersinkronisasi ke katalog customer!', 'success');
}

async function deleteAdminProduct(productId) {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
    store.products = store.products.filter(p => p.id !== productId);
    store.save();

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        await supabaseClient.from('products').delete().eq('id', productId);
      } catch (err) {
        console.warn('Supabase product delete warning:', err);
      }
    }

    renderAdminProductsTable();
    if (typeof renderCatalogGrid === 'function') {
      renderCatalogGrid();
    }
    showToast('Produk telah dihapus dari katalog!', 'info');
  }
}

// ==========================================
// 4. ORDER & LOGISTICS MANAGEMENT (/admin/orders)
// ==========================================
function renderAdminOrdersTable() {
  const container = document.getElementById('admin-orders-tbody');
  if (!container) return;

  const searchInput = document.getElementById('admin-order-search');
  const statusFilter = document.getElementById('admin-order-status-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  let orders = getAllOrdersCombined();

  if (selectedStatus !== 'all') {
    orders = orders.filter(o => (o.status || 'processing').toLowerCase() === selectedStatus.toLowerCase());
  }

  if (query) {
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(query) || 
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query))
    );
  }

  if (orders.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--color-text-muted);">Tidak ada pesanan ditemukan.</td></tr>`;
    return;
  }

  container.innerHTML = orders.map(o => {
    const itemsSummary = (o.items || []).map(i => `${i.quantity || i.qty || 1}x ${i.name}`).join(', ');
    const status = o.status || 'processing';

    return `
      <tr>
        <td>
          <strong>#${o.id}</strong><br>
          <code style="font-size:0.72rem; color:var(--color-secondary); font-weight:700;">${o.trackingNumber || 'SIC-ECO-LIVE'}</code>
        </td>
        <td>${o.date || new Date().toISOString().split('T')[0]}</td>
        <td>
          <strong>${o.customerName || 'Pelanggan BYHARIANS'}</strong><br>
          <small style="color:var(--color-text-muted);">${o.customerPhone || '0812-XXXX-XXXX'}</small>
        </td>
        <td style="max-width:220px; font-size:0.8rem;">${itemsSummary || 'Pembalut Bambu Organik'}</td>
        <td><strong>${store.formatPrice(o.total)}</strong></td>
        <td>
          <select onchange="adminChangeOrderStatus('${o.id}', this.value)" style="padding:4px 8px; border-radius:var(--radius-md); font-weight:700; font-size:0.78rem;">
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending 🟡</option>
            <option value="paid" ${status === 'paid' ? 'selected' : ''}>Paid 🟢</option>
            <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing 📦</option>
            <option value="shipped" ${status === 'shipped' ? 'selected' : ''}>Shipped 🚚</option>
            <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered ✅</option>
            <option value="canceled" ${status === 'canceled' ? 'selected' : ''}>Canceled 🚫</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline btn-sm" onclick="openAdminOrderDetailModal('${o.id}')">Detail</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="openAdminEditOrderModal('${o.id}')">✏️ Edit</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="openInvoicePrintModal('${o.id}')">Invoice 🖨️</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteAdminOrder('${o.id}')" style="color:var(--color-error); border-color:rgba(186,50,50,0.3);">🗑️ Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminOrdersList() {
  renderAdminOrdersTable();
}

function openAdminEditOrderModal(orderId) {
  const globalOrders = getAllOrdersCombined();
  const o = globalOrders.find(item => item.id === orderId);
  if (!o) return;

  const modal = document.getElementById('admin-edit-order-modal');
  const title = document.getElementById('admin-edit-order-title');
  if (!modal) return;

  if (title) title.innerText = `Edit Pesanan Supabase #${o.id}`;

  const custName = o.customerName || (o.customer && o.customer.name) || '';
  const custPhone = o.customerPhone || (o.customer && o.customer.phone) || '';
  const custEmail = o.customerEmail || (o.customer && o.customer.email) || '';
  const address = o.shippingAddress || (o.customer && o.customer.city) || '';

  document.getElementById('admin-edit-order-id').value = o.id;
  document.getElementById('admin-edit-order-display-id').value = `#${o.id}`;
  document.getElementById('admin-edit-order-status').value = o.status || 'processing';
  document.getElementById('admin-edit-order-cust-name').value = custName;
  document.getElementById('admin-edit-order-cust-phone').value = custPhone;
  document.getElementById('admin-edit-order-cust-email').value = custEmail;
  document.getElementById('admin-edit-order-total').value = o.total || 0;
  document.getElementById('admin-edit-order-address').value = address;
  document.getElementById('admin-edit-order-tracking').value = o.trackingNumber || `SIC-ECO-${o.id}`;
  document.getElementById('admin-edit-order-courier').value = o.courier || 'SiCepat BEST Eco-Fleet';

  modal.style.display = 'flex';
}

function closeAdminEditOrderModal() {
  const modal = document.getElementById('admin-edit-order-modal');
  if (modal) modal.style.display = 'none';
}

async function saveAdminEditOrderForm(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('admin-edit-order-id').value;
  const customerName = document.getElementById('admin-edit-order-cust-name').value;
  const customerPhone = document.getElementById('admin-edit-order-cust-phone').value;
  const customerEmail = document.getElementById('admin-edit-order-cust-email').value;
  const shippingAddress = document.getElementById('admin-edit-order-address').value;
  const total = parseInt(document.getElementById('admin-edit-order-total').value) || 0;
  const status = document.getElementById('admin-edit-order-status').value;
  const trackingNumber = document.getElementById('admin-edit-order-tracking').value;
  const courier = document.getElementById('admin-edit-order-courier').value;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .update({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          total_price: total,
          status: status,
          tracking_number: trackingNumber,
          courier: courier
        })
        .eq('id', id);

      if (error) console.warn('Supabase update order error:', error);
    } catch (err) {
      console.warn('Supabase update order exception:', err);
    }
  }

  const globalOrders = store.getGlobalOrders();
  const targetG = globalOrders.find(o => o.id === id);
  if (targetG) {
    targetG.customerName = customerName;
    targetG.customerPhone = customerPhone;
    targetG.customerEmail = customerEmail;
    targetG.shippingAddress = shippingAddress;
    targetG.total = total;
    targetG.status = status;
    targetG.trackingNumber = trackingNumber;
    targetG.courier = courier;
    if (targetG.customer) {
      targetG.customer.name = customerName;
      targetG.customer.email = customerEmail;
      targetG.customer.phone = customerPhone;
      targetG.customer.city = shippingAddress;
    }
    store.saveGlobalOrder(targetG);
  }

  const targetCur = (store.orders || []).find(o => o.id === id);
  if (targetCur) {
    targetCur.customerName = customerName;
    targetCur.customerPhone = customerPhone;
    targetCur.customerEmail = customerEmail;
    targetCur.shippingAddress = shippingAddress;
    targetCur.total = total;
    targetCur.status = status;
    targetCur.trackingNumber = trackingNumber;
    targetCur.courier = courier;
    if (targetCur.customer) {
      targetCur.customer.name = customerName;
      targetCur.customer.email = customerEmail;
      targetCur.customer.phone = customerPhone;
      targetCur.customer.city = shippingAddress;
    }
  }

  closeAdminEditOrderModal();
  renderAdminOrdersTable();
  renderAdminKPIs();
  showToast(`Pesanan #${id} berhasil diperbarui di Supabase!`, 'success');
}

async function deleteAdminOrder(orderId) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pesanan #${orderId} ini secara permanen dari Supabase & Toko?`)) return;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) console.warn('Supabase delete order error:', error);
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }

  store.orders = (store.orders || []).filter(o => o.id !== orderId);
  let globalOrders = store.getGlobalOrders();
  globalOrders = globalOrders.filter(o => o.id !== orderId);
  localStorage.setItem('byharians_global_orders', JSON.stringify(globalOrders));

  showToast(`Pesanan #${orderId} telah dihapus dari Supabase & Toko!`, 'success');
  renderAdminOrdersTable();
  renderAdminKPIs();
}

async function adminChangeOrderStatus(orderId, newStatus) {
  const globalOrders = getAllOrdersCombined();
  const target = globalOrders.find(o => o.id === orderId);

  if (target) {
    target.status = newStatus;
    store.saveGlobalOrder(target);
  }

  if (supabaseClient) {
    try {
      await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    } catch (err) {
      console.warn('Supabase order status update error:', err);
    }
  }

  showToast(`Status Order #${orderId} diperbarui ke: ${newStatus.toUpperCase()}`, 'success');
  renderAdminOrdersTable();
}

function openAdminOrderDetailModal(orderId) {
  const globalOrders = getAllOrdersCombined();
  const o = globalOrders.find(item => item.id === orderId);

  if (!o) return;

  const modal = document.getElementById('admin-order-detail-modal');
  const title = document.getElementById('admin-order-detail-title');
  const body = document.getElementById('admin-order-detail-body');
  if (!modal || !body) return;

  if (title) title.innerText = `Detail Pesanan #${o.id}`;

  const itemsHtml = (o.items || []).map(i => `
    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--color-border); font-size:0.88rem;">
      <span><strong>${i.quantity || i.qty || 1}x</strong> ${i.name} (${i.packOptionName || i.subType || 'Standard'})</span>
      <span style="font-weight:700;">${store.formatPrice((i.price || 39000) * (i.quantity || i.qty || 1))}</span>
    </div>
  `).join('');

  body.innerHTML = `
    <div style="background:var(--color-bg-warm); padding:16px; border-radius:var(--radius-lg); margin-bottom:18px;">
      <h4 style="font-size:0.95rem; color:var(--color-primary); margin-bottom:8px;">Informasi Pembeli & Alamat</h4>
      <p style="margin:0; font-size:0.85rem; line-height:1.5;">
        <strong>Nama:</strong> ${o.customerName || 'Pelanggan BYHARIANS'}<br>
        <strong>Telepon:</strong> ${o.customerPhone || '0812-8921-3401'}<br>
        <strong>Email:</strong> ${o.customerEmail || 'pelanggan@byharians.id'}<br>
        <strong>Alamat Kirim:</strong> ${o.shippingAddress || 'Jakarta, Indonesia'}
      </p>
    </div>

    <div style="margin-bottom:18px;">
      <h4 style="font-size:0.95rem; color:var(--color-primary); margin-bottom:8px;">Rincian Item Produk</h4>
      ${itemsHtml || '<p>1x BYHARIANS Ultra-Thin Day Pads</p>'}
      <div style="display:flex; justify-content:space-between; margin-top:12px; font-weight:800; font-size:1.05rem; color:var(--color-primary);">
        <span>Total Pembayaran:</span>
        <span>${store.formatPrice(o.total)}</span>
      </div>
    </div>

    <div style="background:#fff; border:1px solid var(--color-border); padding:16px; border-radius:var(--radius-lg);">
      <h4 style="font-size:0.95rem; color:var(--color-primary); margin-bottom:10px;">Input Logistik & Nomor Resi</h4>
      <div style="display:flex; gap:10px; align-items:center;">
        <input type="text" id="admin-logistics-tracking-input" class="form-input" value="${o.trackingNumber || 'SIC-ECO-' + Date.now().toString().slice(-4)}" style="font-weight:700;">
        <button type="button" class="btn btn-primary btn-sm" onclick="saveAdminLogisticsTracking('${o.id}')">Simpan Resi</button>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; margin-top:20px;">
      <button type="button" class="btn btn-secondary btn-sm" onclick="openInvoicePrintModal('${o.id}')">🖨️ Cetak Invoice & Packing Slip</button>
      <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminOrderDetailModal()">Tutup</button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeAdminOrderDetailModal() {
  const modal = document.getElementById('admin-order-detail-modal');
  if (modal) modal.style.display = 'none';
}

function saveAdminLogisticsTracking(orderId) {
  const trackingInput = document.getElementById('admin-logistics-tracking-input');
  if (!trackingInput) return;

  const trackingVal = trackingInput.value.trim();
  const globalOrders = getAllOrdersCombined();
  const target = globalOrders.find(o => o.id === orderId);

  if (target) {
    target.trackingNumber = trackingVal;
    target.status = 'shipped';
    store.saveGlobalOrder(target);
  }

  showToast(`Nomor resi ${trackingVal} berhasil disimpan!`, 'success');
  closeAdminOrderDetailModal();
  renderAdminOrdersTable();
}

function openInvoicePrintModal(orderId) {
  const globalOrders = getAllOrdersCombined();
  const o = globalOrders.find(item => item.id === orderId);

  if (!o) return;

  const modal = document.getElementById('admin-print-modal');
  const container = document.getElementById('admin-print-document-content');
  if (!modal || !container) return;

  const itemsList = (o.items || []).map(i => `
    <tr>
      <td style="padding:8px; border-bottom:1px solid #ddd;">${i.name}</td>
      <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${i.quantity || i.qty || 1}</td>
      <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">${store.formatPrice(i.price || 39000)}</td>
      <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right; font-weight:700;">${store.formatPrice((i.price || 39000) * (i.quantity || i.qty || 1))}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:0.88rem;">
      <div>
        <strong>DITERBITKAN OLEH:</strong><br>
        BYHARIANS Organic Store<br>
        Jakarta Selatan, DKI Jakarta<br>
        WA: 0812-8921-3401 | care@byharians.id
      </div>
      <div style="text-align:right;">
        <strong>INVOICE NO: #${o.id}</strong><br>
        Tanggal: ${o.date || new Date().toISOString().split('T')[0]}<br>
        Resi: <code>${o.trackingNumber || 'SIC-ECO-LIVE'}</code><br>
        Kurir: ${o.courier || 'SiCepat BEST'}
      </div>
    </div>

    <div style="background:#FBF8EE; border:1px solid #E8E5D8; padding:14px; border-radius:8px; margin-bottom:20px; font-size:0.88rem;">
      <strong>TUJUAN PENGIRIMAN (PELANGGAN):</strong><br>
      ${o.customerName || 'Pelanggan BYHARIANS'} (${o.customerPhone || '0812-8921-3401'})<br>
      ${o.shippingAddress || 'Jakarta, Indonesia'}
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:0.88rem; margin-bottom:20px;">
      <thead>
        <tr style="background:#0F301D; color:#fff;">
          <th style="padding:8px; text-align:left;">Produk</th>
          <th style="padding:8px; text-align:center;">Qty</th>
          <th style="padding:8px; text-align:right;">Harga Unit</th>
          <th style="padding:8px; text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList || '<tr><td colspan="4" style="padding:8px;">BYHARIANS Day Pads</td></tr>'}
      </tbody>
    </table>

    <div style="text-align:right; font-size:1.1rem; font-weight:800; color:#0F301D; border-top:2px solid #0F301D; padding-top:10px;">
      GRAND TOTAL: ${store.formatPrice(o.total)}
    </div>
  `;

  modal.style.display = 'flex';
}

function closeAdminPrintModal() {
  const modal = document.getElementById('admin-print-modal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// 5. CUSTOMER MANAGEMENT & CRM (/admin/customers)
// ==========================================
function renderAdminCustomersTable() {
  const container = document.getElementById('admin-customers-tbody');
  if (!container) return;

  const searchInput = document.getElementById('admin-customer-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const realCustomers = getCustomersFromSupabaseOrders();

  let list = realCustomers;
  if (query) {
    list = list.filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:32px; color:var(--color-text-muted);">
          Belum ada transaksi pelanggan terdaftar di database Supabase.<br>
          <small style="color:var(--color-secondary);">Setiap order yang dibuat oleh customer di toko akan otomatis terdaftar dan terdeteksi di sini secara real-time.</small>
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = list.map(c => `
    <tr>
      <td><code>${c.id}</code></td>
      <td><strong>${c.name}</strong><br><small style="color:var(--color-text-muted);">${c.phone}</small></td>
      <td>${c.email}</td>
      <td><strong>${c.totalOrders} Pesanan</strong></td>
      <td style="color:var(--color-primary); font-weight:800;">${store.formatPrice(c.lifetimeSpend)}</td>
      <td><span class="badge badge-primary">✨ ${c.ecoPoints} Poin</span></td>
      <td>${c.joinDate}</td>
      <td>
        <button type="button" class="btn btn-outline btn-sm" onclick="openCustomerDetailModal('${c.email}')">Riwayat Belanja</button>
      </td>
    </tr>
  `).join('');
}

function filterAdminCustomersList() {
  renderAdminCustomersTable();
}

function openCustomerDetailModal(customerEmail) {
  const modal = document.getElementById('admin-customer-detail-modal');
  const nameEl = document.getElementById('admin-cust-modal-name');
  const body = document.getElementById('admin-customer-detail-body');
  if (!modal || !body) return;

  const realCustomers = getCustomersFromSupabaseOrders();
  const targetCust = realCustomers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());

  if (nameEl) nameEl.innerText = `Profil CRM: ${targetCust ? targetCust.name : customerEmail}`;

  if (!targetCust || targetCust.orders.length === 0) {
    body.innerHTML = `
      <p style="padding:20px; text-align:center; color:var(--color-text-muted);">
        Belum ada riwayat pesanan untuk pelanggan ini di database Supabase.
      </p>
      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminCustomerDetailModal()">Tutup</button>
      </div>
    `;
    modal.style.display = 'flex';
    return;
  }

  const orderRowsHtml = targetCust.orders.map(o => `
    <tr>
      <td style="padding:10px; border-top:1px solid #eee;"><strong>#${o.id}</strong></td>
      <td style="padding:10px; border-top:1px solid #eee;">${o.date || new Date().toISOString().split('T')[0]}</td>
      <td style="padding:10px; border-top:1px solid #eee; font-weight:700;">${store.formatPrice(o.total)}</td>
      <td style="padding:10px; border-top:1px solid #eee;">
        <span class="badge badge-primary" style="text-transform:uppercase;">${o.status || 'processing'}</span>
      </td>
    </tr>
  `).join('');

  body.innerHTML = `
    <div style="background:var(--color-bg-warm); padding:18px; border-radius:var(--radius-lg); margin-bottom:18px; border:1px solid var(--color-border);">
      <h4 style="font-size:0.95rem; color:var(--color-primary); margin-bottom:8px;">Ringkasan CRM Supabase</h4>
      <p style="margin:0; font-size:0.85rem; line-height:1.6; color:var(--color-primary);">
        <strong>Nama:</strong> ${targetCust.name}<br>
        <strong>Email:</strong> ${targetCust.email}<br>
        <strong>Telepon:</strong> ${targetCust.phone}<br>
        <strong>Total Belanja:</strong> ${store.formatPrice(targetCust.lifetimeSpend)} (${targetCust.totalOrders} Pesanan)<br>
        <strong>Poin Loyalitas Eco-Club:</strong> ✨ ${targetCust.ecoPoints} Poin
      </p>
    </div>

    <h4 style="font-size:0.95rem; color:var(--color-primary); margin-bottom:10px;">Riwayat Transaksi Real di Supabase DB</h4>
    <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
      <table style="width:100%; border-collapse:collapse; font-size:0.84rem;">
        <thead>
          <tr style="background:#FBF8EE; text-align:left; color:var(--color-primary);">
            <th style="padding:10px;">Order ID</th>
            <th style="padding:10px;">Tanggal</th>
            <th style="padding:10px;">Total</th>
            <th style="padding:10px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${orderRowsHtml}
        </tbody>
      </table>
    </div>

    <div style="display:flex; justify-content:flex-end; margin-top:20px;">
      <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminCustomerDetailModal()">Tutup</button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeAdminCustomerDetailModal() {
  const modal = document.getElementById('admin-customer-detail-modal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// 6. PROMOTIONS & DISCOUNT MANAGEMENT (/admin/promotions)
// ==========================================
function renderAdminPromotionsTable() {
  const container = document.getElementById('admin-promotions-tbody');
  if (!container) return;

  const promos = store.promotions || [];
  container.innerHTML = promos.map(p => `
    <tr>
      <td><code style="font-size:0.85rem; font-weight:800; color:var(--color-primary);">${p.code}</code></td>
      <td>${p.type === 'percentage' ? 'Persentase (%)' : 'Nominal Tetap (Rp)'}</td>
      <td><strong>${p.type === 'percentage' ? p.value + '%' : store.formatPrice(p.value)}</strong></td>
      <td>${store.formatPrice(p.minSpend)}</td>
      <td>${p.used || 0} / ${p.quota || 500} Kuota</td>
      <td>${p.expiry}</td>
      <td><span class="badge ${p.status === 'active' ? 'badge-primary' : 'badge-secondary'}">${p.status.toUpperCase()}</span></td>
      <td>
        <button type="button" class="btn btn-outline btn-sm" onclick="toggleCouponStatus('${p.id}')">${p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</button>
      </td>
    </tr>
  `).join('');
}

function openCreateCouponModal() {
  const modal = document.getElementById('admin-coupon-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAdminCouponModal() {
  const modal = document.getElementById('admin-coupon-modal');
  if (modal) modal.style.display = 'none';
}

function saveAdminCouponForm(e) {
  if (e) e.preventDefault();

  const code = document.getElementById('admin-coupon-code').value.toUpperCase().trim();
  const type = document.getElementById('admin-coupon-type').value;
  const value = parseInt(document.getElementById('admin-coupon-val').value) || 0;
  const minSpend = parseInt(document.getElementById('admin-coupon-min-spend').value) || 0;
  const quota = parseInt(document.getElementById('admin-coupon-quota').value) || 500;
  const expiry = document.getElementById('admin-coupon-expiry').value;

  const newPromo = {
    id: `PROM-${Date.now().toString().slice(-3)}`,
    code, type, value, minSpend, quota, used: 0, expiry, status: 'active'
  };

  store.promotions.unshift(newPromo);
  store.coupons.push({ code, discountPercent: type === 'percentage' ? value : 15, description: `Diskon ${value}` });
  store.save();

  closeAdminCouponModal();
  renderAdminPromotionsTable();
  showToast(`Voucher ${code} berhasil dibuat!`, 'success');
}

function toggleCouponStatus(couponId) {
  const p = (store.promotions || []).find(item => item.id === couponId);
  if (p) {
    p.status = p.status === 'active' ? 'expired' : 'active';
    store.save();
    renderAdminPromotionsTable();
    showToast(`Status promo ${p.code} diperbarui!`, 'info');
  }
}

function saveBannerAnnouncement() {
  const bannerInput = document.getElementById('admin-banner-text-input');
  if (bannerInput) {
    store.storeSettings.bannerText = bannerInput.value;
    store.save();
    showToast('Banner pengumuman storefront diperbarui!', 'success');
  }
}

// ==========================================
// 7. SYSTEM SETTINGS (/admin/settings)
// ==========================================
function loadAdminSettingsForm() {
  const s = store.storeSettings || {};

  const nameEl = document.getElementById('setting-store-name');
  const cityEl = document.getElementById('setting-origin-city');
  const phoneEl = document.getElementById('setting-phone');
  const emailEl = document.getElementById('setting-email');

  if (nameEl) nameEl.value = s.storeName || 'BYHARIANS Organic Store';
  if (cityEl) cityEl.value = s.originCity || 'Jakarta Selatan, DKI Jakarta';
  if (phoneEl) phoneEl.value = s.phone || '0812-8921-3401';
  if (emailEl) emailEl.value = s.email || 'care@byharians.id';
}

function saveAdminStoreSettings() {
  const storeName = document.getElementById('setting-store-name').value;
  const originCity = document.getElementById('setting-origin-city').value;
  const phone = document.getElementById('setting-phone').value;
  const email = document.getElementById('setting-email').value;

  store.storeSettings = {
    ...store.storeSettings,
    storeName, originCity, phone, email
  };

  store.save();
  showToast('Pengaturan toko & kurir berhasil disimpan!', 'success');
}

// ==========================================
// PACKAGES & DISPATCH MANAGEMENT (/admin/packages)
// ==========================================
let adminCustomerPackagesList = [];

async function renderAdminPackagesTable() {
  const container = document.getElementById('admin-packages-tbody');
  if (!container) return;

  const searchInput = document.getElementById('admin-package-search');
  const statusFilter = document.getElementById('admin-package-status-filter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('customer_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        adminCustomerPackagesList = data.map(r => store.normalizePackage(r)).filter(Boolean);
        store.customerPackages = adminCustomerPackagesList;
      }
    } catch (err) {
      console.warn('Fetch admin customer packages warning:', err);
    }
  }

  let list = adminCustomerPackagesList || store.customerPackages || [];
  if (selectedStatus !== 'all') {
    list = list.filter(p => (p.status || 'active').toLowerCase() === selectedStatus.toLowerCase());
  }
  if (query) {
    list = list.filter(p =>
      p.id.toLowerCase().includes(query) ||
      (p.customerName && p.customerName.toLowerCase().includes(query)) ||
      (p.customerEmail && p.customerEmail.toLowerCase().includes(query)) ||
      (p.trackingNumber && p.trackingNumber.toLowerCase().includes(query))
    );
  }

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--color-text-muted);">Tidak ada jadwal paket ditemukan.</td></tr>`;
    return;
  }

  container.innerHTML = list.map(p => {
    let badgeClass = 'badge-primary';
    let statusLabel = '🔴 PAUSED';
    if (p.status === 'active') {
      badgeClass = 'badge-success';
      statusLabel = '🟢 AKTIF';
    } else if (p.status === 'dispatched') {
      badgeClass = 'badge-primary';
      statusLabel = '🚚 DISPATCHED TODAY';
    }

    return `
      <tr>
        <td>
          <strong>#${p.id}</strong><br>
          <small style="color:var(--color-text-muted);">Tgl Buat: ${p.lastDispatched || 'Hari Ini'}</small>
        </td>
        <td>
          <strong>${p.customerName}</strong><br>
          <small style="color:var(--color-text-muted);">${p.customerEmail}</small><br>
          <small style="color:var(--color-text-muted);">${p.phone || ''}</small>
        </td>
        <td>
          <strong>${p.packageName}</strong><br>
          <small style="color:var(--color-text-muted);">${p.itemsSummary}</small>
        </td>
        <td><span class="badge badge-secondary">${p.frequency}</span></td>
        <td>
          <strong>${p.nextDeliveryDate}</strong><br>
          <small style="color:var(--color-text-muted);">${p.courier}</small>
        </td>
        <td>
          <span class="badge ${badgeClass}" style="text-transform:uppercase; margin-bottom:4px; display:inline-block;">${statusLabel}</span><br>
          <code style="background:rgba(15,48,29,0.06); padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">${p.trackingNumber || 'SIC-ECO-PENDING'}</code>
        </td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" onclick="adminDispatchPackageNow('${p.id}')">🚚 Dispatch</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="openEditPackageModal('${p.id}')">✏️ Edit</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteAdminPackage('${p.id}')" style="color:var(--color-error); border-color:rgba(186,50,50,0.3);">🗑️ Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterAdminPackagesList() {
  renderAdminPackagesTable();
}

function openCreatePackageModal() {
  const modal = document.getElementById('admin-package-modal');
  const title = document.getElementById('admin-package-modal-title');
  if (!modal) return;

  if (title) title.innerText = 'Buat Jadwal Paket Baru';
  document.getElementById('admin-pkg-id').value = '';
  document.getElementById('admin-pkg-cust-name').value = '';
  document.getElementById('admin-pkg-cust-email').value = '';
  document.getElementById('admin-pkg-phone').value = '';
  document.getElementById('admin-pkg-name').value = 'Paket Pembalut Organik Bambu Bulanan';
  document.getElementById('admin-pkg-items').value = '1x Day Pads (24-Pcs), 1x Night Pads (16-Pcs)';
  document.getElementById('admin-pkg-freq').value = 'Setiap 4 Minggu';
  
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 7);
  document.getElementById('admin-pkg-next-date').value = nextMonth.toISOString().split('T')[0];
  document.getElementById('admin-pkg-courier').value = 'SiCepat BEST Eco-Fleet';
  document.getElementById('admin-pkg-tracking').value = `SIC-ECO-${Math.floor(10000 + Math.random() * 90000)}`;
  document.getElementById('admin-pkg-address').value = 'Jakarta Selatan, DKI Jakarta';

  modal.style.display = 'flex';
}

function openEditPackageModal(packageId) {
  const list = adminCustomerPackagesList || store.customerPackages || [];
  const p = list.find(item => item.id === packageId);
  if (!p) return;

  const modal = document.getElementById('admin-package-modal');
  const title = document.getElementById('admin-package-modal-title');
  if (!modal) return;

  if (title) title.innerText = `Edit Jadwal Paket #${p.id}`;
  document.getElementById('admin-pkg-id').value = p.id;
  document.getElementById('admin-pkg-cust-name').value = p.customerName;
  document.getElementById('admin-pkg-cust-email').value = p.customerEmail;
  document.getElementById('admin-pkg-phone').value = p.phone || '';
  document.getElementById('admin-pkg-name').value = p.packageName;
  document.getElementById('admin-pkg-items').value = p.itemsSummary;
  document.getElementById('admin-pkg-freq').value = p.frequency;
  document.getElementById('admin-pkg-next-date').value = p.nextDeliveryDate;
  document.getElementById('admin-pkg-courier').value = p.courier || 'SiCepat BEST Eco-Fleet';
  document.getElementById('admin-pkg-tracking').value = p.trackingNumber || '';
  document.getElementById('admin-pkg-address').value = p.shippingAddress || '';

  modal.style.display = 'flex';
}

function closeAdminPackageModal() {
  const modal = document.getElementById('admin-package-modal');
  if (modal) modal.style.display = 'none';
}

async function saveAdminPackageForm(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('admin-pkg-id').value || `PKG-${Math.floor(10000 + Math.random() * 90000)}`;
  const customerName = document.getElementById('admin-pkg-cust-name').value.trim();
  const customerEmail = document.getElementById('admin-pkg-cust-email').value.trim().toLowerCase();
  const phone = document.getElementById('admin-pkg-phone').value.trim();
  const packageName = document.getElementById('admin-pkg-name').value.trim();
  const itemsSummary = document.getElementById('admin-pkg-items').value.trim();
  const frequency = document.getElementById('admin-pkg-freq').value;
  const nextDeliveryDate = document.getElementById('admin-pkg-next-date').value;
  const courier = document.getElementById('admin-pkg-courier').value.trim();
  const trackingNumber = document.getElementById('admin-pkg-tracking').value.trim() || `SIC-ECO-${Math.floor(10000 + Math.random() * 90000)}`;
  const shippingAddress = document.getElementById('admin-pkg-address').value.trim();

  const packageData = {
    id,
    customerName,
    customerEmail,
    phone,
    packageName,
    itemsSummary,
    frequency,
    nextDeliveryDate,
    courier,
    trackingNumber,
    shippingAddress,
    status: 'active',
    statusText: 'Aktif / Berlangganan',
    lastDispatched: new Date().toISOString().split('T')[0]
  };

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('customer_packages').upsert({
        id,
        customer_name: customerName,
        customer_email: customerEmail,
        phone,
        package_name: packageName,
        items_summary: itemsSummary,
        frequency,
        next_delivery_date: nextDeliveryDate,
        courier,
        tracking_number: trackingNumber,
        shipping_address: shippingAddress,
        status: 'active',
        status_text: 'Aktif / Berlangganan',
        last_dispatched: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.warn('Supabase package upsert notice:', err);
    }
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/packages/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });
  } catch (err) {
    console.warn('Backend packages API notice:', err);
  }

  closeAdminPackageModal();
  renderAdminPackagesTable();
  showToast(`Jadwal paket #${id} berhasil disimpan ke Supabase!`, 'success');
}

async function adminDispatchPackageNow(packageId) {
  const newTracking = `SIC-ECO-DISPATCH-${Math.floor(10000 + Math.random() * 90000)}`;
  const today = new Date().toISOString().split('T')[0];

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('customer_packages').update({
        last_dispatched: today,
        tracking_number: newTracking,
        status: 'dispatched',
        status_text: 'Telah Dikirim Hari Ini'
      }).eq('id', packageId);
    } catch (err) {
      console.warn('Supabase dispatch update warning:', err);
    }
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/packages/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: packageId, trackingNumber: newTracking })
    });
  } catch (err) {
    console.warn('Backend dispatch notice:', err);
  }

  showToast(`Paket #${packageId} berhasil didispatch! No. Resi: ${newTracking}`, 'success');
  renderAdminPackagesTable();
}

async function deleteAdminPackage(packageId) {
  if (!confirm(`Apakah Anda yakin ingin menghapus jadwal paket #${packageId}?`)) return;

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      await supabaseClient.from('customer_packages').delete().eq('id', packageId);
    } catch (err) {
      console.warn('Delete package warning:', err);
    }
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/packages/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: packageId })
    });
  } catch (err) {
    console.warn('Backend delete package notice:', err);
  }

  showToast(`Jadwal paket #${packageId} berhasil dihapus.`, 'info');
  renderAdminPackagesTable();
}

// Close modals when clicking backdrop overlay
document.addEventListener('click', (e) => {
  if (e.target && (e.target.classList.contains('phase-popup-modal-backdrop') || e.target.classList.contains('modal-backdrop'))) {
    e.target.style.display = 'none';
  }
});
