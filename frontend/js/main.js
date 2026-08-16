/**
 * BYHARIANS MAIN ENTRY POINT, ROUTER & VIEW ENGINE
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  div.className = 'toast-container';
  document.body.appendChild(div);
  return div;
}

function navigateTo(viewId) {
  let target = viewId;
  let param = null;

  if (viewId.includes('/')) {
    const parts = viewId.split('/');
    target = parts[0];
    param = parts[1];
  }

  if (target === 'admin' && !store.isAdmin) {
    target = 'admin-login';
  }

  store.currentView = target;
  document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');

  const targetView = document.getElementById(`view-${target}`);
  if (targetView) {
    targetView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === target);
  });

  if (target === 'home' || target === 'shop') renderCatalogGrid();
  if (target === 'cart') renderFullCartPage();
  if (target === 'checkout') renderCheckoutView();
  if (target === 'cycle-tracker') renderCycleTrackerView();
  if (target === 'admin') switchAdminSubTab('all');
  if (target === 'account') {
    if (typeof updateAccountDashboardUI === 'function') {
      updateAccountDashboardUI();
    }
  }

  updateHeaderAuthUI();
}

function updateHeaderAuthUI() {
  const userBtn = document.getElementById('header-user-btn');
  if (userBtn) {
    userBtn.title = store.isLoggedIn ? `Account (${store.userAccount.name})` : 'Sign In / Register';
  }
}

function handleHeaderAccountClick(e) {
  if (e) e.preventDefault();
  if (store.isLoggedIn) {
    navigateTo(store.isAdmin ? 'admin' : 'account');
  } else {
    navigateTo('login');
  }
}

// Global Currency Switcher
document.addEventListener('DOMContentLoaded', () => {
  const currSelect = document.getElementById('currency-select');
  if (currSelect) {
    currSelect.addEventListener('change', (e) => {
      store.currency = e.target.value;
      renderCatalogGrid();
      updateCartBadgeAndDrawer();
      if (store.currentView === 'cart') renderFullCartPage();
      if (store.currentView === 'checkout') renderCheckoutSummary();
    });
  }

  // Hash Navigation Handler
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  });

  // Initial Route
  const initialHash = window.location.hash.replace('#', '') || 'home';
  navigateTo(initialHash);
  renderCatalogGrid();
  updateCartBadgeAndDrawer();
});
