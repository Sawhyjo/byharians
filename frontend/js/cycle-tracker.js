/**
 * BYHARIANS MENSTRUAL CYCLE TRACKER MODULE
 */
function renderCycleTrackerView() {
  const container = document.getElementById('cycle-tracker-container');
  if (!container) return;

  const lastDate = store.userAccount?.lastCycleDate || '2026-07-28';
  const cycleLen = store.userAccount?.cycleLengthDays || 28;
  const periodLen = store.userAccount?.periodLengthDays || 5;

  const startDate = new Date(lastDate);
  const nextDate = new Date(startDate);
  nextDate.setDate(startDate.getDate() + cycleLen);

  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const currentDayInCycle = (Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLen) + 1;

  let currentPhase = 'Follicular Phase';
  let phaseDescription = 'Rising estrogen levels bringing energy, skin glow, and mental clarity.';

  if (currentDayInCycle <= periodLen) {
    currentPhase = 'Menstrual Phase';
    phaseDescription = 'Time for rest, hydration, and gentle soothing care with BYHARIANS organic bamboo pads.';
  } else if (currentDayInCycle >= 12 && currentDayInCycle <= 16) {
    currentPhase = 'Ovulation Phase';
    phaseDescription = 'Peak fertility window with maximum energy and confidence.';
  } else if (currentDayInCycle > 16) {
    currentPhase = 'Luteal Phase';
    phaseDescription = 'Progesterone dominates. Ideal for relaxing rituals and warm tea.';
  }

  container.innerHTML = `
    <div style="background:#fff; border-radius:var(--radius-xl); padding:32px; border:1px solid var(--color-border); box-shadow:var(--shadow-md);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:28px;">
        <div>
          <span class="section-tag">PERSONAL CYCLE INSIGHTS</span>
          <h2 style="font-size:1.8rem; color:var(--color-primary);">Haid & Siklus Anda</h2>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="openCycleLogModal()">+ Catat Gejala Hari Ini</button>
      </div>

      <div class="cycle-today-status-bar" style="background:var(--color-bg-subtle); border-radius:var(--radius-lg); padding:20px 24px; margin-bottom:28px; display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; text-align:center;">
        <div>
          <small style="color:var(--color-text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Hari Dalam Siklus</small>
          <div style="font-size:1.8rem; font-weight:800; color:var(--color-primary); margin-top:4px;">Hari ke-${currentDayInCycle}</div>
        </div>
        <div>
          <small style="color:var(--color-text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Fase Saat Ini</small>
          <div style="font-size:1.1rem; font-weight:800; color:var(--color-secondary); margin-top:8px;">${currentPhase}</div>
        </div>
        <div>
          <small style="color:var(--color-text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; font-weight:700;">Haid Berikutnya</small>
          <div style="font-size:1.1rem; font-weight:800; color:var(--color-primary); margin-top:8px;">${nextDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      <p style="color:var(--color-text-muted); font-size:0.9rem; line-height:1.6; margin-bottom:24px;">${phaseDescription}</p>
    </div>
  `;
}
