/**
 * BYHARIANS ORDER TRACKING & CUSTOMER RESOLUTION MODULE
 */

let activeTrackingOrder = null;
let selectedRatingStars = 5;

function lookupOrder(customQuery) {
  const input = document.getElementById('track-order-input');
  const query = (customQuery || input?.value || '').trim().toUpperCase();

  if (!query) {
    if (typeof showToast === 'function') showToast('Masukkan Nomor Pesanan (BYH-XXXX) atau Nomor Resi (SIC-ECO-XXXX)', 'warning');
    return;
  }

  // Search in user orders & global store orders
  let order = (store.orders || []).find(o => 
    (o.id && o.id.toUpperCase() === query) ||
    (o.trackingNumber && o.trackingNumber.toUpperCase() === query) ||
    (o.customer?.email && o.customer.email.toUpperCase() === query)
  );

  // Fallback demonstration orders if query is a demo number
  if (!order) {
    if (query === 'BYH-89421' || query === 'SIC-ECO-89421') {
      order = {
        id: 'BYH-89421',
        date: '2026-08-16',
        customer: { name: 'Elena Rostova', email: 'elena@domain.com', phone: '0812-8921-3401', city: 'Jakarta Selatan, DKI Jakarta' },
        items: [
          { name: 'BYHARIANS Ultra-Thin Bamboo Day Pads', qty: 2, size: '24-Pcs Hemat Duo', price: 78000 },
          { name: 'BYHARIANS Overnight Super Heavy Flow Pads', qty: 1, size: '16-Pcs Night Duo Pack', price: 45000 }
        ],
        total: 123000,
        paymentMethod: 'QRIS',
        status: 'shipped',
        trackingNumber: 'SIC-ECO-89421',
        courier: 'SiCepat BEST Eco-Fleet EV'
      };
    }
  }

  const resultsBox = document.getElementById('track-results-box');

  if (!order) {
    if (resultsBox) resultsBox.style.display = 'none';
    if (typeof showToast === 'function') {
      showToast(`Nomor Resi atau Order ID "${query}" tidak ditemukan. Pastikan format penulisan benar.`, 'error');
    }
    return;
  }

  activeTrackingOrder = order;

  if (input) input.value = order.id;
  if (resultsBox) resultsBox.style.display = 'block';

  // Render Order Header Info
  const dispId = document.getElementById('track-disp-id');
  const dispCourier = document.getElementById('track-disp-courier');
  const dispEta = document.getElementById('track-disp-eta');
  const dispStatus = document.getElementById('track-disp-status');

  if (dispId) dispId.innerText = `#${order.id} (${order.trackingNumber || 'N/A'})`;
  if (dispCourier) dispCourier.innerText = order.courier || 'SiCepat BEST Eco-Fleet';
  if (dispEta) dispEta.innerText = order.status === 'delivered' ? 'Sudah Tiba' : 'Estimasi: 1-2 Hari Kerja';

  // Render Status Badge
  if (dispStatus) {
    const statusTextMap = {
      processing: 'DI PROSES (DI KEMAS)',
      shipped: 'DI JALAN (PENGIRIMAN)',
      delivered: 'SAMPAI (SUDAH DITERIMA)'
    };
    const statusClassMap = {
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered'
    };
    dispStatus.innerText = statusTextMap[order.status] || order.status.toUpperCase();
    dispStatus.className = `status-badge ${statusClassMap[order.status] || 'status-shipped'}`;
  }

  // Render 3-Stage Visual Timeline
  renderTrackingTimeline(order.status);

  // Render Items List & Address
  const itemsContainer = document.getElementById('tracking-items-list');
  if (itemsContainer) {
    itemsContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
        ${(order.items || []).map(i => `
          <div style="display:flex; justify-space-between; align-items:center; font-size:0.85rem; padding-bottom:8px; border-bottom:1px dashed var(--color-border);">
            <div>
              <strong style="color:var(--color-primary);">${i.name}</strong>
              <div style="font-size:0.76rem; color:var(--color-text-muted);">Jumlah: ${i.qty || i.quantity || 1} • ${i.size || i.packName || ''}</div>
            </div>
            <strong style="color:var(--color-primary);">${store.formatPrice(i.price || (i.unitPrice * i.quantity) || 0)}</strong>
          </div>
        `).join('')}
      </div>
      <div style="font-size:0.82rem; color:var(--color-text-muted); background:var(--color-bg-warm); padding:10px 14px; border-radius:8px;">
        <strong>Alamat Tujuan:</strong> ${order.customer?.city || 'Jakarta, Indonesia'}<br>
        <strong>Penerima:</strong> ${order.customer?.name || 'Pelanggan'} (${order.customer?.phone || ''})
      </div>
    `;
  }

  // Render Delivery Action Controls Box
  renderTrackingActionButtons(order);
}

function renderTrackingTimeline(status) {
  const lineEl = document.getElementById('tracking-progress-line');
  const nodesEl = document.getElementById('tracking-timeline-nodes');
  if (!nodesEl) return;

  let pct = '33%';
  if (status === 'shipped') pct = '66%';
  if (status === 'delivered') pct = '100%';
  if (lineEl) lineEl.style.width = pct;

  nodesEl.innerHTML = `
    <div class="timeline-step ${status === 'processing' || status === 'shipped' || status === 'delivered' ? 'completed' : ''}">
      <div class="step-node-icon">📦</div>
      <div class="step-label">DI PROSES</div>
      <div class="step-subtext">Pesanan Dikonfirmasi & Dikemas FSC</div>
    </div>
    <div class="timeline-step ${status === 'shipped' || status === 'delivered' ? 'completed' : ''}">
      <div class="step-node-icon">🚚</div>
      <div class="step-label">DI JALAN</div>
      <div class="step-subtext">Kurir SiCepat EV Mengantar ke Alamat</div>
    </div>
    <div class="timeline-step ${status === 'delivered' ? 'completed' : ''}">
      <div class="step-node-icon">🏡</div>
      <div class="step-label">SAMPAI</div>
      <div class="step-subtext">Tiba di Tujuan & Konfirmasi Diterima</div>
    </div>
  `;
}

function renderTrackingActionButtons(order) {
  const container = document.getElementById('tracking-actions-control-card');
  if (!container) return;

  if (order.status === 'delivered') {
    container.innerHTML = `
      <div style="background: rgba(39, 154, 94, 0.08); border: 1.5px solid var(--color-success); border-radius: var(--radius-lg); padding: 20px; margin-top: 24px; text-align: center;">
        <h4 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 6px;">🎉 Pesanan Telah Diterima!</h4>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 14px;">Terima kasih telah menggunakan produk ramah lingkungan BYHARIANS.</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="openProductReviewModal()">⭐ Berikan Ulasan Produk (+50 Pts)</button>
          <button class="btn btn-outline btn-sm" onclick="openDeliveryIssueModal()" style="color: var(--color-error); border-color: rgba(186, 50, 50, 0.3);">⚠️ Kendala Produk / Rusak?</button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="background: #FFFDF4; border: 1.5px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px; margin-top: 24px;">
        <h4 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 6px;">Konfirmasi & Bantuan Pengiriman</h4>
        <p style="font-size: 0.83rem; color: var(--color-text-muted); margin-bottom: 16px;">Jika paket telah sampai di tangan Anda, silakan konfirmasi pesanan diterima di bawah ini.</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="confirmOrderReceipt()" style="flex: 1;">✅ Konfirmasi Pesanan Sudah Diterima</button>
          <button class="btn btn-outline btn-sm" onclick="openDeliveryIssueModal()" style="color: var(--color-error); border-color: rgba(186, 50, 50, 0.4);">⚠️ Barang Belum Sampai / Rusak?</button>
        </div>
      </div>
    `;
  }
}

function confirmOrderReceipt() {
  if (!activeTrackingOrder) return;

  activeTrackingOrder.status = 'delivered';
  store.userAccount.ecoPoints = (store.userAccount.ecoPoints || 0) + 50;
  store.save();

  lookupOrder(activeTrackingOrder.id);
  if (typeof renderAdminKPIs === 'function') renderAdminKPIs();
  if (typeof renderAdminOrders === 'function') renderAdminOrders();
  if (typeof updateAccountDashboardUI === 'function') updateAccountDashboardUI();

  if (typeof showToast === 'function') {
    showToast('Terima kasih! Pesanan dikonfirmasi selesai (+50 Eco-Points ditambahkan).', 'success');
  }

  openProductReviewModal();
}

function openDeliveryIssueModal() {
  const modal = document.getElementById('delivery-issue-modal');
  if (modal) modal.style.display = 'flex';
}

function closeDeliveryIssueModal() {
  const modal = document.getElementById('delivery-issue-modal');
  if (modal) modal.style.display = 'none';
}

function submitDeliveryComplaintTicket(e) {
  if (e) e.preventDefault();
  const issueType = document.getElementById('issue-type-select')?.value;
  const issueDesc = document.getElementById('issue-desc-input')?.value?.trim();

  if (!issueDesc) {
    if (typeof showToast === 'function') showToast('Harap jelaskan kendala atau kerusakan yang dialami.', 'error');
    return;
  }

  const ticketId = `TICKET-${Math.floor(1000 + Math.random() * 9000)}`;
  closeDeliveryIssueModal();

  if (typeof showToast === 'function') {
    showToast(`Tiket Bantuan #${ticketId} berhasil dikirim ke Tim Ops Admin BYHARIANS.`, 'success');
  }

  // Trigger direct WhatsApp support chat
  const orderId = activeTrackingOrder?.id || 'BYH-89421';
  const waText = encodeURIComponent(`Halo Admin BYHARIANS,\nSaya mau lapor kendala pesanan #${orderId}.\nKendala: ${issueType}\nCatatan: ${issueDesc}`);
  window.open(`https://wa.me/6281289213401?text=${waText}`, '_blank');
}

function openProductReviewModal() {
  const modal = document.getElementById('product-review-modal');
  if (modal) modal.style.display = 'flex';
}

function closeProductReviewModal() {
  const modal = document.getElementById('product-review-modal');
  if (modal) modal.style.display = 'none';
}

function selectReviewStars(stars) {
  selectedRatingStars = stars;
  const starBtns = document.querySelectorAll('.review-star-btn');
  starBtns.forEach((b, i) => {
    b.style.color = (i < stars) ? '#F7C828' : '#D1DED7';
  });
}

function submitProductReview(e) {
  if (e) e.preventDefault();
  const text = document.getElementById('review-text-input')?.value?.trim();
  closeProductReviewModal();

  if (typeof showToast === 'function') {
    showToast(`Ulasan Bintang ${selectedRatingStars} berhasil dikirim! Terima kasih atas masukan Anda.`, 'success');
  }
}
