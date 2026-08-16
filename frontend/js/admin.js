/**
 * BYHARIANS OPERATIONS & ADMIN MANAGEMENT MODULE
 */
function switchAdminSubTab(tabName = 'all') {
  const secKpis = document.getElementById('admin-section-kpis');
  const secChart = document.getElementById('admin-section-chart');
  const secGroc = document.getElementById('admin-section-groceries');
  const secPkg = document.getElementById('admin-section-packages');
  const secOrders = document.getElementById('admin-section-orders');
  const secInv = document.getElementById('admin-section-inventory');

  if (secKpis) secKpis.style.display = 'grid';
  if (secChart) secChart.style.display = 'block';
  if (secGroc) secGroc.style.display = 'block';
  if (secPkg) secPkg.style.display = 'block';
  if (secOrders) secOrders.style.display = 'block';
  if (secInv) secInv.style.display = 'block';

  renderAdminKPIs();
  renderAdminOrders();
  renderAdminCustomerGroceries();
  renderAdminCustomerPackages();
}

function renderAdminKPIs() {
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiOrders = document.getElementById('kpi-orders');
  const kpiSubs = document.getElementById('kpi-subs');
  const kpiPlastic = document.getElementById('kpi-plastic');
  const kpiAov = document.getElementById('kpi-aov');

  // Base metrics
  const baseRevenue = 128400000;
  const baseOrders = 386;
  const baseSubs = 142;
  const basePlasticKg = 1312;

  // Calculate live dynamic metrics from completed transactions
  const liveRevenueSum = (store.orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const liveOrderCount = (store.orders || []).length;
  
  const totalRevenue = baseRevenue + liveRevenueSum;
  const totalOrders = baseOrders + liveOrderCount;
  const totalSubs = baseSubs + Math.floor(liveOrderCount * 0.3);
  const totalPlasticDiverted = basePlasticKg + Math.floor(liveOrderCount * 2.5);

  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 332600;

  if (kpiRevenue) kpiRevenue.innerText = store.formatPrice(totalRevenue);
  if (kpiOrders) kpiOrders.innerText = totalOrders;
  if (kpiSubs) kpiSubs.innerText = totalSubs;
  if (kpiPlastic) kpiPlastic.innerText = `${totalPlasticDiverted.toLocaleString('id-ID')} kg`;
  if (kpiAov) kpiAov.innerText = store.formatPrice(aov);
}

function renderAdminOrders() {
  const container = document.getElementById('admin-orders-tbody');
  if (!container) return;

  const orders = store.orders || [];
  if (orders.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:24px; color:var(--color-text-muted);">
          Belum ada pesanan baru terdaftar hari ini.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = orders.map(o => `
    <tr>
      <td><strong>#${o.id}</strong><br><code style="font-size:0.7rem; background:rgba(15,48,29,0.06); padding:2px 6px; border-radius:4px;">${o.trackingNumber || 'N/A'}</code></td>
      <td>${o.date || new Date().toISOString().split('T')[0]}</td>
      <td><strong>${o.customer?.name || 'Pelanggan'}</strong><br><small style="color:var(--color-text-muted);">${o.customer?.email || ''}</small></td>
      <td>
        <ul style="margin:0; padding-left:14px; font-size:0.78rem;">
          ${(o.items || []).map(i => `<li>${i.name} x${i.qty || i.quantity || 1} (${i.size || i.packName || ''})</li>`).join('')}
        </ul>
      </td>
      <td><strong>${store.formatPrice(o.total || 0)}</strong><br><small style="color:var(--color-success); font-weight:700;">${o.paymentMethod || 'QRIS'}</small></td>
      <td>
        <span class="status-badge status-delivered">${(o.status || 'PROSES').toUpperCase()}</span>
      </td>
    </tr>
  `).join('');
}

function renderAdminCustomerGroceries(list) {
  const container = document.getElementById('admin-groceries-tbody') || document.getElementById('admin-groceries-table-body');
  if (!container) return;
  const items = list || store.customerGroceries;

  if (items.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px; color:var(--color-text-muted);">
          Belum ada daftar keranjang langganan harian (groceries) terdaftar.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = items.map(g => `
    <tr>
      <td><strong>#${g.id}</strong></td>
      <td><strong>${g.customerName}</strong><br><small style="color:var(--color-text-muted);">${g.customerEmail}</small></td>
      <td><span class="badge badge-success">${g.basketName}</span></td>
      <td><strong>${store.formatPrice(g.monthlyPrice)}</strong> / ${g.frequency}</td>
      <td>${g.nextRefillDate}</td>
      <td><span class="badge badge-primary">${g.statusText || 'Auto-Refill ON'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="adminOpenEditGroceryModal('${g.id}')">Edit</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminCustomerPackages(list) {
  const container = document.getElementById('admin-packages-table-body');
  if (!container) return;
  const items = list || store.customerPackages;

  if (items.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px; color:var(--color-text-muted);">
          Belum ada paket langganan siklus terdaftar.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = items.map(p => `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td><strong>${p.customerName}</strong><br><small style="color:var(--color-text-muted);">${p.customerEmail}</small></td>
      <td>${p.packageName}</td>
      <td><code style="background:rgba(15,48,29,0.06); padding:2px 6px; border-radius:4px;">${p.trackingNumber}</code></td>
      <td>${p.nextDeliveryDate}</td>
      <td><span class="badge badge-primary">${p.statusText || 'Aktif'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="adminOpenEditPackageModal('${p.id}')">Edit</button>
      </td>
    </tr>
  `).join('');
}

async function adminSaveGroceryForm(e) {
  if (e) e.preventDefault();
  const hiddenId = document.getElementById('admin-groc-id-hidden').value;

  const item = hiddenId ? store.customerGroceries.find(g => g.id === hiddenId) : {};
  item.customerName = document.getElementById('admin-groc-cust-name').value.trim();
  item.customerEmail = document.getElementById('admin-groc-cust-email').value.trim();
  item.phone = document.getElementById('admin-groc-phone').value.trim();
  item.basketName = document.getElementById('admin-groc-basket-name').value.trim();
  item.itemsSummary = document.getElementById('admin-groc-items').value.trim();
  item.monthlyPrice = parseFloat(document.getElementById('admin-groc-total-price').value) || 128000;
  item.frequency = document.getElementById('admin-groc-freq').value;
  item.nextRefillDate = document.getElementById('admin-groc-next-date').value;
  item.courier = document.getElementById('admin-groc-courier').value;
  item.shippingAddress = document.getElementById('admin-groc-address').value.trim();
  item.status = document.getElementById('admin-groc-status').value;

  if (!hiddenId) {
    item.id = `GROC-${801 + store.customerGroceries.length}`;
    store.customerGroceries.unshift(item);
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/groceries/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  } catch (err) {
    console.warn('Backend Grocery API warning:', err);
  }

  store.save();
  adminCloseEditGroceryModal();
  renderAdminCustomerGroceries();
  showToast(`Keranjang Belanjaan #${item.id} disimpan!`, 'success');
}

function adminOpenEditGroceryModal(id) {
  const item = store.customerGroceries.find(g => g.id === id);
  if (!item) return;
  document.getElementById('admin-groc-id-hidden').value = item.id;
  document.getElementById('admin-groc-cust-name').value = item.customerName;
  document.getElementById('admin-groc-cust-email').value = item.customerEmail;
  document.getElementById('admin-groc-phone').value = item.phone || '';
  document.getElementById('admin-groc-basket-name').value = item.basketName;
  document.getElementById('admin-groc-items').value = item.itemsSummary;
  document.getElementById('admin-groc-total-price').value = item.monthlyPrice;
  document.getElementById('admin-groc-freq').value = item.frequency;
  document.getElementById('admin-groc-next-date').value = item.nextRefillDate;
  document.getElementById('admin-groc-courier').value = item.courier;
  document.getElementById('admin-groc-address').value = item.shippingAddress;
  const modal = document.getElementById('admin-grocery-edit-modal');
  if (modal) modal.style.display = 'flex';
}

function adminCloseEditGroceryModal() {
  const modal = document.getElementById('admin-grocery-edit-modal');
  if (modal) modal.style.display = 'none';
}

async function adminSavePackageForm(e) {
  if (e) e.preventDefault();
  const hiddenId = document.getElementById('admin-pkg-id-hidden').value;

  const pkg = hiddenId ? store.customerPackages.find(p => p.id === hiddenId) : {};
  pkg.customerName = document.getElementById('admin-pkg-cust-name').value.trim();
  pkg.customerEmail = document.getElementById('admin-pkg-cust-email').value.trim();
  pkg.phone = document.getElementById('admin-pkg-phone').value.trim();
  pkg.packageName = document.getElementById('admin-pkg-name').value.trim();
  pkg.itemsSummary = document.getElementById('admin-pkg-items').value.trim();
  pkg.frequency = document.getElementById('admin-pkg-freq').value;
  pkg.nextDeliveryDate = document.getElementById('admin-pkg-next-date').value;
  pkg.courier = document.getElementById('admin-pkg-courier').value;
  pkg.trackingNumber = document.getElementById('admin-pkg-tracking-num').value.trim();
  pkg.shippingAddress = document.getElementById('admin-pkg-address').value.trim();
  pkg.status = document.getElementById('admin-pkg-status').value;

  if (!hiddenId) {
    pkg.id = `PKG-${1001 + store.customerPackages.length}`;
    store.customerPackages.unshift(pkg);
  }

  try {
    await fetch(`${CONFIG.API_BASE_URL}/packages/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg)
    });
  } catch (err) {
    console.warn('Backend Package API warning:', err);
  }

  store.save();
  adminCloseEditPackageModal();
  renderAdminCustomerPackages();
  showToast(`Paket #${pkg.id} disimpan!`, 'success');
}

function adminOpenEditPackageModal(id) {
  const pkg = store.customerPackages.find(p => p.id === id);
  if (!pkg) return;
  document.getElementById('admin-pkg-id-hidden').value = pkg.id;
  document.getElementById('admin-pkg-cust-name').value = pkg.customerName;
  document.getElementById('admin-pkg-cust-email').value = pkg.customerEmail;
  document.getElementById('admin-pkg-phone').value = pkg.phone || '';
  document.getElementById('admin-pkg-name').value = pkg.packageName;
  document.getElementById('admin-pkg-items').value = pkg.itemsSummary;
  document.getElementById('admin-pkg-freq').value = pkg.frequency;
  document.getElementById('admin-pkg-next-date').value = pkg.nextDeliveryDate;
  document.getElementById('admin-pkg-courier').value = pkg.courier;
  document.getElementById('admin-pkg-tracking-num').value = pkg.trackingNumber;
  document.getElementById('admin-pkg-address').value = pkg.shippingAddress;
  const modal = document.getElementById('admin-package-edit-modal');
  if (modal) modal.style.display = 'flex';
}

function adminCloseEditPackageModal() {
  const modal = document.getElementById('admin-package-edit-modal');
  if (modal) modal.style.display = 'none';
}
