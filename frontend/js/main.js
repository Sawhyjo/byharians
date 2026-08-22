/**
 * BYHARIANS MAIN ENTRY POINT, ROUTER & VIEW ENGINE
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('global-toast-container') || document.getElementById('toast-container') || createToastContainer();
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
  let target = viewId || 'home';
  let param = null;

  if (target.includes('/')) {
    const parts = target.split('/');
    target = parts[0];
    param = parts[1];
  }

  if (target === 'admin') {
    if (!store.isAdmin) {
      target = 'admin-login';
    } else {
      setTimeout(() => {
        if (typeof switchAdminMainTab === 'function') switchAdminMainTab(currentAdminSubTab || 'overview');
        if (typeof applyRBACPermissionsUI === 'function') applyRBACPermissionsUI();
      }, 50);
    }
  }

  store.currentView = target;

  const standaloneView = document.getElementById(`view-${target}`);

  if (standaloneView) {
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    standaloneView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    const homeView = document.getElementById('view-home');
    if (homeView) homeView.style.display = 'block';

    const anchorElem = document.getElementById(target);
    if (anchorElem) {
      anchorElem.scrollIntoView({ behavior: 'smooth' });
    } else if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === target);
  });

  if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
  if (target === 'cart' && typeof renderFullCartPage === 'function') renderFullCartPage();
  if (target === 'checkout' && typeof renderCheckoutView === 'function') renderCheckoutView();
  if (target === 'cycle-tracker' && typeof renderCycleTrackerView === 'function') renderCycleTrackerView();
  if (target === 'track') {
    if (param && typeof lookupOrder === 'function') {
      lookupOrder(param);
    } else if (store.orders && store.orders.length > 0 && typeof lookupOrder === 'function') {
      lookupOrder(store.orders[0].id);
    }
  }
  if (target === 'admin' && typeof switchAdminSubTab === 'function') switchAdminSubTab('all');
  if (target === 'account' && typeof updateAccountDashboardUI === 'function') updateAccountDashboardUI();

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
  if (typeof closeCartDrawer === 'function') closeCartDrawer();
  navigateTo(initialHash);
  renderCatalogGrid();
  updateCartBadgeAndDrawer();
});

function scrollToAboutSection(sectionId) {
  navigateTo('story');
  setTimeout(() => {
    const target = document.getElementById(`story-${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}
