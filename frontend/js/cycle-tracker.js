/**
 * BYHARIANS INTERACTIVE MENSTRUAL CYCLE TRACKER & CALENDAR ENGINE
 */
let currentCalYear = 2026;
let currentCalMonth = 7; // 0-indexed: 7 = August

let activeCycleConfig = {
  startDate: '2026-08-01',
  cycleLength: 28,
  periodLength: 5
};

const userLoggedNotes = {};

function renderCycleTrackerView() {
  // Populate default inputs if empty
  const startDateInput = document.getElementById('cycle-start-date-input');
  const avgLenInput = document.getElementById('cycle-avg-length-input');
  const durationInput = document.getElementById('cycle-duration-input');

  if (startDateInput && !startDateInput.value) {
    startDateInput.value = activeCycleConfig.startDate;
  }
  if (avgLenInput && !avgLenInput.value) {
    avgLenInput.value = activeCycleConfig.cycleLength;
  }
  if (durationInput && !durationInput.value) {
    durationInput.value = activeCycleConfig.periodLength;
  }

  updateCycleCalculation();
}

function updateCycleCalculation() {
  const startDateInput = document.getElementById('cycle-start-date-input');
  const avgLenInput = document.getElementById('cycle-avg-length-input');
  const durationInput = document.getElementById('cycle-duration-input');

  if (startDateInput?.value) activeCycleConfig.startDate = startDateInput.value;
  if (avgLenInput?.value) activeCycleConfig.cycleLength = parseInt(avgLenInput.value) || 28;
  if (durationInput?.value) activeCycleConfig.periodLength = parseInt(durationInput.value) || 5;

  renderTodayStatusBar();
  renderCalendarDaysGrid();
  renderPhaseTimelineCards();
  renderRecommendedPads();
}

function handleCalculateCycle() {
  updateCycleCalculation();
  if (typeof showToast === 'function') {
    showToast('Prediksi siklus berhasil diperbarui!', 'success');
  }
}

function prefillCycleDemoData() {
  const startDateInput = document.getElementById('cycle-start-date-input');
  const avgLenInput = document.getElementById('cycle-avg-length-input');
  const durationInput = document.getElementById('cycle-duration-input');

  if (startDateInput) startDateInput.value = '2026-08-01';
  if (avgLenInput) avgLenInput.value = '28';
  if (durationInput) durationInput.value = '5';

  updateCycleCalculation();
  if (typeof showToast === 'function') {
    showToast('Contoh siklus 28 hari dimuat!', 'info');
  }
}

function renderTodayStatusBar() {
  const statusBar = document.getElementById('cycle-today-status-bar');
  if (!statusBar) return;

  const start = new Date(activeCycleConfig.startDate);
  const today = new Date();
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cycleLen = activeCycleConfig.cycleLength;
  const periodLen = activeCycleConfig.periodLength;

  let currentDay = (diffDays % cycleLen) + 1;
  if (currentDay <= 0) currentDay += cycleLen;

  const nextPeriod = new Date(start);
  const cyclesPassed = Math.floor(diffDays / cycleLen) + (diffDays >= 0 ? 1 : 0);
  nextPeriod.setDate(start.getDate() + (cyclesPassed * cycleLen));

  let phaseName = 'Fase Folikular (Estrogen Naik)';
  let phaseColor = 'var(--color-success)';

  if (currentDay <= periodLen) {
    phaseName = 'Fase Menstruasi (Pendarahan)';
    phaseColor = '#e74c3c';
  } else if (currentDay >= 12 && currentDay <= 16) {
    phaseName = 'Masa Subur & Ovulasi';
    phaseColor = '#f1c40f';
  } else if (currentDay > 16) {
    phaseName = 'Fase Luteal (Progesteron)';
    phaseColor = '#8e44ad';
  }

  statusBar.innerHTML = `
    <div style="background: #FFF9F5; border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 20px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center; margin-bottom: 24px;">
      <div>
        <small style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Hari Dalam Siklus Saat Ini</small>
        <div style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary); margin-top: 4px;">Hari ke-${currentDay}</div>
      </div>
      <div>
        <small style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Fase Biologis</small>
        <div style="font-size: 1.05rem; font-weight: 800; color: ${phaseColor}; margin-top: 8px;">${phaseName}</div>
      </div>
      <div>
        <small style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Estimasi Haid Berikutnya</small>
        <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-primary); margin-top: 8px;">${nextPeriod.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  `;
}

function renderCalendarDaysGrid() {
  const grid = document.getElementById('calendar-days-grid');
  const label = document.getElementById('calendar-month-year-label');
  if (!grid) return;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (label) {
    label.innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`;
  }

  const firstDay = new Date(currentCalYear, currentCalMonth, 1);
  const lastDay = new Date(currentCalYear, currentCalMonth + 1, 0);
  const daysInMonth = lastDay.getDate();

  // 0 = Sunday, convert to Monday-first (0 = Mon, 6 = Sun)
  let startingDayOfWeek = firstDay.getDay() - 1;
  if (startingDayOfWeek < 0) startingDayOfWeek = 6;

  const cycleStart = new Date(activeCycleConfig.startDate);
  const cycleLen = activeCycleConfig.cycleLength;
  const periodLen = activeCycleConfig.periodLength;

  let html = '';

  // Blank slots for days before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  // Render days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const thisDate = new Date(currentCalYear, currentCalMonth, day);
    const dateStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Calculate cycle day relative to start
    const diffDays = Math.floor((thisDate - cycleStart) / (1000 * 60 * 60 * 24));
    let dayInCycle = (diffDays % cycleLen);
    if (dayInCycle < 0) dayInCycle += cycleLen;
    dayInCycle += 1; // 1-indexed

    let dayClass = 'normal';
    let badgeText = '';

    if (dayInCycle <= periodLen) {
      dayClass = 'period';
      badgeText = 'Haid';
    } else if (dayInCycle >= 12 && dayInCycle <= 16) {
      dayClass = 'fertile';
      badgeText = dayInCycle === 14 ? 'Ovulasi' : 'Subur';
    } else if (dayInCycle > 16) {
      dayClass = 'luteal';
    } else {
      dayClass = 'follicular';
    }

    const isToday = new Date().toDateString() === thisDate.toDateString();
    const hasNote = userLoggedNotes[dateStr];

    html += `
      <div class="cal-day ${dayClass} ${isToday ? 'today' : ''} ${hasNote ? 'has-note' : ''}" onclick="openCycleDatePopup('${dateStr}')">
        <span class="day-num">${day}</span>
        ${badgeText ? `<span class="day-badge">${badgeText}</span>` : ''}
        ${hasNote ? `<span class="note-indicator">●</span>` : ''}
      </div>
    `;
  }

  grid.innerHTML = html;
}

function changeCalendarMonth(delta) {
  currentCalMonth += delta;
  if (currentCalMonth > 11) {
    currentCalMonth = 0;
    currentCalYear += 1;
  } else if (currentCalMonth < 0) {
    currentCalMonth = 11;
    currentCalYear -= 1;
  }
  renderCalendarDaysGrid();
}

function goToCurrentMonth() {
  const now = new Date();
  currentCalYear = now.getFullYear();
  currentCalMonth = now.getMonth();
  renderCalendarDaysGrid();
}

function renderPhaseTimelineCards() {
  const container = document.getElementById('cycle-phases-cards-grid');
  if (!container) return;

  const phases = [
    { title: '1. Fase Menstruasi', days: `Hari 1–${activeCycleConfig.periodLength}`, desc: 'Pendarahan meluruhkan dinding rahim. Butuh istirahat, kehangatan, dan pembalut bambu organik ultra-lembut.', color: '#e74c3c' },
    { title: '2. Fase Folikular', days: `Hari ${activeCycleConfig.periodLength + 1}–11`, desc: 'Hormon Estrogen meningkat pesat. Energi tubuh, fokus pikiran, dan kilau kulit berada pada puncaknya.', color: 'var(--color-success)' },
    { title: '3. Masa Subur & Ovulasi', days: 'Hari 12–16', desc: 'Pelepasan sel telur (Ovulasi hari ke-14). Waktu fertilitas tertinggi dengan vitalitas dan kepercayaan diri maksimal.', color: '#f1c40f' },
    { title: '4. Fase Luteal (PMS)', days: `Hari 17–${activeCycleConfig.cycleLength}`, desc: 'Hormon Progesteron mendominasi. Tubuh bersiap untuk siklus berikutnya. Cocok untuk perawatan rileks & hangat.', color: '#8e44ad' }
  ];

  container.innerHTML = phases.map(p => `
    <div class="phase-card" style="background:#fff; padding:20px; border-radius:var(--radius-lg); border:1px solid var(--color-border); border-top:4px solid ${p.color};">
      <span style="font-size:0.75rem; font-weight:700; color:${p.color}; text-transform:uppercase;">${p.days}</span>
      <h4 style="font-size:1.05rem; color:var(--color-primary); margin:6px 0 8px;">${p.title}</h4>
      <p style="font-size:0.82rem; color:var(--color-text-muted); line-height:1.5;">${p.desc}</p>
    </div>
  `).join('');
}

function renderRecommendedPads() {
  const container = document.getElementById('recommended-pad-breakdown');
  if (!container) return;

  const periodLen = activeCycleConfig.periodLength;
  const dayPadsNeeded = periodLen * 3;
  const nightPadsNeeded = periodLen * 2;
  const linersNeeded = 10;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:16px;">
      <div style="background:#FFF9F5; padding:14px; border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block;">${dayPadsNeeded}x Ultra-Thin Day Pads</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Siang & Aktivitas (240mm)</span>
      </div>
      <div style="background:#FFF9F5; padding:14px; border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block;">${nightPadsNeeded}x Overnight Heavy Pads</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Malam & Tidur Nyenyak (330mm)</span>
      </div>
      <div style="background:#FFF9F5; padding:14px; border-radius:var(--radius-md); border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block;">${linersNeeded}x Daily Panty Liners</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Flek & Perawatan Harian (155mm)</span>
      </div>
    </div>
  `;
}

let activePopupDate = null;

function openCycleDatePopup(dateStr) {
  activePopupDate = dateStr;
  const modal = document.getElementById('cycle-date-popup-modal');
  const title = document.getElementById('popup-date-title');
  const notesInput = document.getElementById('popup-notes-input');

  if (title) {
    const d = new Date(dateStr);
    title.innerText = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (notesInput) {
    notesInput.value = userLoggedNotes[dateStr] || '';
  }

  if (modal) modal.style.display = 'flex';
}

function closeCycleDatePopup() {
  const modal = document.getElementById('cycle-date-popup-modal');
  if (modal) modal.style.display = 'none';
}

function handleCyclePopupBackdropClick(e) {
  if (e.target.id === 'cycle-date-popup-modal') {
    closeCycleDatePopup();
  }
}

function savePopupDataDirectly() {
  const notesInput = document.getElementById('popup-notes-input');
  if (activePopupDate && notesInput) {
    userLoggedNotes[activePopupDate] = notesInput.value.trim();
  }
  closeCycleDatePopup();
  renderCalendarDaysGrid();
  if (typeof showToast === 'function') {
    showToast('Catatan tanggal berhasil disimpan!', 'success');
  }
}

function setPopupDateAsCycleStart() {
  if (activePopupDate) {
    const startDateInput = document.getElementById('cycle-start-date-input');
    if (startDateInput) startDateInput.value = activePopupDate;
    updateCycleCalculation();
    closeCycleDatePopup();
    if (typeof showToast === 'function') {
      showToast(`Hari pertama haid diset ke ${activePopupDate}`, 'success');
    }
  }
}

function addCycleBundleToCart() {
  if (typeof addToCart === 'function') {
    addToCart('byh-pad-day-reg');
    addToCart('byh-pad-night-heavy');
    if (typeof showToast === 'function') {
      showToast('Paket Pembalut Sesuai Siklus telah ditambahkan ke Keranjang!', 'success');
    }
  }
}
