/**
 * ui.js
 * Reusable UI helpers: toasts, button loading states, alerts,
 * tab switching, section navigation, formatting utilities.
 */

/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2800);
  setTimeout(() => toast.remove(), 3200);
}
window.showToast = showToast;

/* ── BUTTON LOADING STATE ── */
function setLoading(btn, loading) {
  if (loading) {
    btn._originalHTML = btn.innerHTML;
    btn.classList.add('loading');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (btn._originalHTML !== undefined) btn.innerHTML = btn._originalHTML;
  }
}
window.setLoading = setLoading;

/* ── ALERT HELPERS ── */
function showAlert(el, message, type = 'error') {
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAlert(el) {
  if (!el) return;
  el.className = 'alert';
  el.textContent = '';
}
window.showAlert = showAlert;
window.hideAlert = hideAlert;

/* ── TABS ── */
function initTabs(containerEl) {
  if (!containerEl) return;
  const buttons = containerEl.querySelectorAll('.tab-btn');
  const panels  = containerEl.querySelectorAll('.tab-panel');

  function activate(tabId) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    panels.forEach(p  => p.classList.toggle('active',  p.dataset.panel === tabId));
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.tab));
  });

  // Activate first by default
  if (buttons.length) activate(buttons[0].dataset.tab);
}
window.initTabs = initTabs;

/* ── SIDEBAR SECTIONS ── */
function showSection(sectionId) {
  document.querySelectorAll('.section-panel').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(`section-${sectionId}`);
  if (target) target.classList.remove('hidden');

  const sidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionId}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  // Hook for lazy-loading section data
  if (typeof window.onSectionShow === 'function') window.onSectionShow(sectionId);
}
window.showSection = showSection;

/* ── FORMAT CURRENCY ── */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
window.formatCurrency = formatCurrency;

/* ── FORMAT DATE ── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
window.formatDate = formatDate;

/* ── STATUS BADGE ── */
function statusBadge(status) {
  const map = {
    pending:    'warn',
    processing: 'warn',
    confirmed:  'warn',
    shipped:    'white',
    delivered:  'success',
    completed:  'success',
    active:     'success',
    cancelled:  'error',
    failed:     'error',
    refunded:   'error',
    inactive:   'error',
    admin:      'white',
    customer:   'outline',
  };
  return `<span class="badge badge-${map[status] || 'outline'}">${status}</span>`;
}
window.statusBadge = statusBadge;

/* ── MODAL HELPERS ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.matches('.modal-overlay')) e.target.classList.remove('open');
});
window.openModal  = openModal;
window.closeModal = closeModal;

/* ── ENTER KEY SUBMIT ── */
function onEnter(inputEl, callback) {
  inputEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') callback(); });
}
window.onEnter = onEnter;

/* ── DEBOUNCE ── */
function debounce(fn, ms = 350) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
window.debounce = debounce;

/* ── CATEGORY LABEL MAP ── */
const CATEGORY_LABELS = {
  tshirts:    'T-Shirts',
  tracksuits: 'Tracksuits',
  sport_shoes:'Sport Shoes',
};
window.CATEGORY_LABELS = CATEGORY_LABELS;

/* ── CATEGORY ICON MAP ── */
const CATEGORY_ICONS = {
  tshirts:    '👕',
  tracksuits: '🧥',
  sport_shoes:'👟',
};
window.CATEGORY_ICONS = CATEGORY_ICONS;
