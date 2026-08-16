/**
 * BYHARIANS FLO HEALTH-STYLE MENSTRUAL CYCLE TRACKER & CALENDAR ENGINE
 */
let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth(); // 0-indexed

let activeCycleConfig = {
  startDate: new Date().toISOString().split('T')[0],
  cycleLength: 28,
  periodLength: 5
};

// Persistent User Logs (Flow, Mood, Symptoms, Notes per date)
let userLoggedNotes = {};

try {
  const savedNotes = localStorage.getItem('byharians_cycle_notes');
  if (savedNotes) userLoggedNotes = JSON.parse(savedNotes);
  const savedConfig = localStorage.getItem('byharians_cycle_config');
  if (savedConfig) activeCycleConfig = { ...activeCycleConfig, ...JSON.parse(savedConfig) };
} catch (e) {
  console.warn('Cycle storage init note:', e);
}

function renderCycleTrackerView() {
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

  try {
    localStorage.setItem('byharians_cycle_config', JSON.stringify(activeCycleConfig));
  } catch (e) {}

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

function setCyclePreset(cycleLen, periodLen) {
  const avgLenInput = document.getElementById('cycle-avg-length-input');
  const durationInput = document.getElementById('cycle-duration-input');

  if (avgLenInput) avgLenInput.value = cycleLen;
  if (durationInput) durationInput.value = periodLen;

  updateCycleCalculation();
  if (typeof showToast === 'function') {
    showToast(`Preset ${cycleLen} hari diterapkan!`, 'info');
  }
}

function prefillCycleDemoData() {
  const startDateInput = document.getElementById('cycle-start-date-input');
  const avgLenInput = document.getElementById('cycle-avg-length-input');
  const durationInput = document.getElementById('cycle-duration-input');

  const now = new Date();
  now.setDate(now.getDate() - 3); // 3 days ago
  const dateStr = now.toISOString().split('T')[0];

  if (startDateInput) startDateInput.value = dateStr;
  if (avgLenInput) avgLenInput.value = '28';
  if (durationInput) durationInput.value = '5';

  updateCycleCalculation();
  if (typeof showToast === 'function') {
    showToast('Contoh siklus 28 hari dimuat!', 'info');
  }
}

function getCyclePhaseForDay(dayInCycle, periodLen) {
  if (dayInCycle <= periodLen) {
    return {
      name: 'Fase Menstruasi (Pendarahan)',
      shortName: 'Menstruasi',
      color: '#E35E34',
      badgeClass: 'phase-period',
      icon: '🩸',
      tip: 'Waktu untuk istirahat, hidrasi air hangat, dan perawatan lembut dengan pembalut bambu organik ultra-lembut.'
    };
  } else if (dayInCycle >= 12 && dayInCycle <= 16) {
    return {
      name: 'Masa Subur & Ovulasi',
      shortName: 'Ovulasi / Subur',
      color: '#B47C04',
      badgeClass: 'phase-fertile',
      icon: '✨',
      tip: 'Puncak masa subur & sel telur matang. Energi, suasana hati, dan kepercayaan diri berada di level tertinggi.'
    };
  } else if (dayInCycle > 16) {
    return {
      name: 'Fase Luteal (Progesteron)',
      shortName: 'Luteal (PMS)',
      color: '#5B21B6',
      badgeClass: 'phase-luteal',
      icon: '🌙',
      tip: 'Hormon Progesteron mendominasi. Tubuh bersiap untuk siklus berikutnya. Cocok untuk teh hangat & relaksasi.'
    };
  } else {
    return {
      name: 'Fase Folikular (Estrogen Naik)',
      shortName: 'Folikular',
      color: '#1E824C',
      badgeClass: 'phase-follicular',
      icon: '🌱',
      tip: 'Hormon Estrogen meningkat pesat. Energi tubuh, stamina olahraga, dan daya fokus Anda berkembang.'
    };
  }
}

function renderTodayStatusBar() {
  const statusBar = document.getElementById('cycle-today-status-bar');
  if (!statusBar) return;

  const start = new Date(activeCycleConfig.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleLen = activeCycleConfig.cycleLength;
  const periodLen = activeCycleConfig.periodLength;

  let currentDay = (diffDays % cycleLen);
  if (currentDay < 0) currentDay += cycleLen;
  currentDay += 1; // 1-indexed

  const phaseInfo = getCyclePhaseForDay(currentDay, periodLen);

  const daysToNextPeriod = cycleLen - currentDay + 1;
  const nextPeriodDate = new Date(today);
  nextPeriodDate.setDate(today.getDate() + daysToNextPeriod - 1);

  statusBar.innerHTML = `
    <div style="background: #FFF9F5; border: 1.5px solid var(--color-border); border-radius: 20px; padding: 22px 26px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; align-items: center; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
      <div style="text-align: center; border-right: 1px solid var(--color-border); padding-right: 14px;">
        <span style="color: var(--color-text-muted); font-size: 0.74rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.06em;">Hari Dalam Siklus Saat Ini</span>
        <div style="font-size: 2.2rem; font-weight: 900; color: var(--color-primary); margin-top: 4px;">Hari ke-${currentDay}</div>
        <small style="color: var(--color-text-muted); font-size: 0.78rem;">dari ${cycleLen} hari siklus</small>
      </div>
      <div>
        <span style="color: var(--color-text-muted); font-size: 0.74rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.06em;">Fase Biologis Tubuh</span>
        <div style="font-size: 1.15rem; font-weight: 800; color: ${phaseInfo.color}; margin-top: 6px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.25rem;">${phaseInfo.icon}</span> <span>${phaseInfo.name}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 6px; line-height: 1.45;">${phaseInfo.tip}</p>
      </div>
      <div style="text-align: center; border-left: 1px solid var(--color-border); padding-left: 14px;">
        <span style="color: var(--color-text-muted); font-size: 0.74rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.06em;">Prediksi Haid Berikutnya</span>
        <div style="font-size: 1.2rem; font-weight: 900; color: var(--color-primary); margin-top: 6px;">${daysToNextPeriod} Hari Lagi</div>
        <small style="color: var(--color-secondary); font-weight: 800; font-size: 0.82rem;">${nextPeriodDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
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
  cycleStart.setHours(0, 0, 0, 0);
  const cycleLen = activeCycleConfig.cycleLength;
  const periodLen = activeCycleConfig.periodLength;

  let html = '';

  // Blank slots for days before 1st of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += `<div class="cal-day-cell other-month"></div>`;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Render days
  for (let day = 1; day <= daysInMonth; day++) {
    const thisDate = new Date(currentCalYear, currentCalMonth, day);
    thisDate.setHours(0, 0, 0, 0);
    const dateStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const diffDays = Math.floor((thisDate.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
    let dayInCycle = (diffDays % cycleLen);
    if (dayInCycle < 0) dayInCycle += cycleLen;
    dayInCycle += 1;

    const phaseInfo = getCyclePhaseForDay(dayInCycle, periodLen);

    const isToday = dateStr === todayStr;
    const logData = userLoggedNotes[dateStr] || {};
    const hasNote = logData.notes || logData.flow || (logData.symptoms && logData.symptoms.length > 0) || logData.mood;

    let badgeText = '';
    if (dayInCycle <= periodLen) badgeText = `Haid ${dayInCycle}`;
    else if (dayInCycle === 14) badgeText = 'Ovulasi 👑';
    else if (dayInCycle >= 12 && dayInCycle <= 16) badgeText = 'Subur';

    html += `
      <div class="cal-day-cell ${phaseInfo.badgeClass} ${isToday ? 'is-today' : ''} ${hasNote ? 'has-note' : ''}" onclick="openCycleDatePopup('${dateStr}')">
        <span class="cal-day-number">${day}</span>
        ${badgeText ? `<span class="cal-day-badge">${badgeText}</span>` : ''}
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
    { title: '1. Fase Menstruasi', days: `Hari 1–${activeCycleConfig.periodLength}`, desc: 'Pendarahan meluruhkan dinding rahim. Istirahat cukup & gunakan pembalut bambu organik hypoallergenic.', color: '#E35E34' },
    { title: '2. Fase Folikular', days: `Hari ${activeCycleConfig.periodLength + 1}–11`, desc: 'Estrogen naik pesat. Energi tubuh, metabolisme, dan daya fokus berada di puncaknya.', color: '#1E824C' },
    { title: '3. Ovulasi & Masa Subur', days: 'Hari 12–16', desc: 'Sel telur matang (Ovulasi hari ke-14). Puncak fertilitas dan kepercayaan diri maksimal.', color: '#B47C04' },
    { title: '4. Fase Luteal (PMS)', days: `Hari 17–${activeCycleConfig.cycleLength}`, desc: 'Progesteron mendominasi. Waktu sempurna untuk teh herbal hangat dan relaksasi alami.', color: '#5B21B6' }
  ];

  container.innerHTML = phases.map(p => `
    <div class="phase-card" style="background:#fff; padding:20px; border-radius:18px; border:1.5px solid var(--color-border); border-top:4px solid ${p.color}; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
      <span style="font-size:0.75rem; font-weight:800; color:${p.color}; text-transform:uppercase; letter-spacing:0.04em;">${p.days}</span>
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
      <div style="background:#FFF9F5; padding:16px; border-radius:16px; border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block; font-size: 0.95rem;">${dayPadsNeeded}x Ultra-Thin Day Pads</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Siang & Aktivitas (240mm)</span>
      </div>
      <div style="background:#FFF9F5; padding:16px; border-radius:16px; border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block; font-size: 0.95rem;">${nightPadsNeeded}x Overnight Heavy Pads</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Malam & Tidur Nyenyak (330mm)</span>
      </div>
      <div style="background:#FFF9F5; padding:16px; border-radius:16px; border:1px solid var(--color-border); text-align:center;">
        <strong style="color:var(--color-primary); display:block; font-size: 0.95rem;">${linersNeeded}x Daily Panty Liners</strong>
        <span style="font-size:0.76rem; color:var(--color-text-muted);">Flek & Perawatan Harian (155mm)</span>
      </div>
    </div>
  `;
}

// Flo Health Popup Logger state
let activePopupDate = null;
let activeSelectedFlow = 'none';
let activeSelectedMood = '';
let activeSelectedSymptoms = [];

function openCycleDatePopup(dateStr) {
  activePopupDate = dateStr;
  const modal = document.getElementById('cycle-date-popup-modal');
  const title = document.getElementById('popup-date-title');
  const phaseBadge = document.getElementById('popup-phase-badge');
  const notesInput = document.getElementById('popup-notes-input');

  const logData = userLoggedNotes[dateStr] || {};
  activeSelectedFlow = logData.flow || 'none';
  activeSelectedMood = logData.mood || '';
  activeSelectedSymptoms = Array.isArray(logData.symptoms) ? [...logData.symptoms] : [];

  if (title) {
    const d = new Date(dateStr);
    title.innerText = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (phaseBadge) {
    const start = new Date(activeCycleConfig.startDate);
    const thisDate = new Date(dateStr);
    const diffDays = Math.floor((thisDate - start) / (1000 * 60 * 60 * 24));
    let dayInCycle = (diffDays % activeCycleConfig.cycleLength);
    if (dayInCycle < 0) dayInCycle += activeCycleConfig.cycleLength;
    dayInCycle += 1;

    const phaseInfo = getCyclePhaseForDay(dayInCycle, activeCycleConfig.periodLength);
    phaseBadge.innerText = `${phaseInfo.name} • Hari ke-${dayInCycle}`;
  }

  if (notesInput) {
    notesInput.value = logData.notes || '';
  }

  setPopupFlow(activeSelectedFlow);
  renderSymptomsChips();

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

function setPopupFlow(flow) {
  activeSelectedFlow = flow;
  const flowLabel = document.getElementById('popup-flow-selected-label');
  const flowMap = {
    none: 'Tidak Haid',
    spotting: 'Flek / Spotting',
    light: 'Pendarahan Ringan',
    medium: 'Pendarahan Sedang',
    heavy: 'Pendarahan Deras'
  };
  if (flowLabel) flowLabel.innerText = flowMap[flow] || 'Tidak Haid';

  document.querySelectorAll('#popup-flow-grid .flow-pill-btn').forEach(btn => {
    const f = btn.getAttribute('data-flow');
    btn.classList.toggle('active', f === flow);
  });
}

function togglePopupMood(mood) {
  activeSelectedMood = activeSelectedMood === mood ? '' : mood;
  document.querySelectorAll('#popup-mood-grid .mood-pill-btn').forEach(btn => {
    const m = btn.getAttribute('data-mood');
    btn.classList.toggle('active', m === activeSelectedMood);
  });
}

function renderSymptomsChips() {
  const container = document.getElementById('popup-symptoms-chips');
  if (!container) return;

  const defaultSymptoms = [
    '⚡ Kram Perut', '🧠 Sakit Kepala', '🌸 Jerawat Hormonal',
    '💖 Nyeri Payudara', '🌊 Kembung / Begah', '☁️ Sensitif / PMS',
    '🛋️ Lelah / Pegal', '🍯 Ngidam Manis', '🌙 Sulit Tidur'
  ];

  container.innerHTML = defaultSymptoms.map(sym => {
    const isSelected = activeSelectedSymptoms.includes(sym);
    return `
      <button type="button" class="popup-symptom-tag ${isSelected ? 'active' : ''}" onclick="toggleSymptom('${sym}', this)">
        ${sym}
      </button>
    `;
  }).join('');
}

function toggleSymptom(sym, btn) {
  if (activeSelectedSymptoms.includes(sym)) {
    activeSelectedSymptoms = activeSelectedSymptoms.filter(s => s !== sym);
    if (btn) btn.classList.remove('active');
  } else {
    activeSelectedSymptoms.push(sym);
    if (btn) btn.classList.add('active');
  }
}

function savePopupDataDirectly() {
  const notesInput = document.getElementById('popup-notes-input');
  if (activePopupDate) {
    userLoggedNotes[activePopupDate] = {
      flow: activeSelectedFlow,
      mood: activeSelectedMood,
      symptoms: [...activeSelectedSymptoms],
      notes: notesInput ? notesInput.value.trim() : ''
    };

    try {
      localStorage.setItem('byharians_cycle_notes', JSON.stringify(userLoggedNotes));
    } catch (e) {}
  }

  closeCycleDatePopup();
  renderCalendarDaysGrid();
  if (typeof showToast === 'function') {
    showToast('Catatan & gejala harian Flo Health berhasil disimpan!', 'success');
  }
}

function setPopupDateAsCycleStart() {
  if (activePopupDate) {
    const startDateInput = document.getElementById('cycle-start-date-input');
    if (startDateInput) startDateInput.value = activePopupDate;
    updateCycleCalculation();
    closeCycleDatePopup();
    if (typeof showToast === 'function') {
      showToast(`Hari pertama haid baru diset ke ${activePopupDate}!`, 'success');
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
