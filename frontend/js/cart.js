/**
 * cart.js
 * Manages the shopping cart: fetching state, rendering the drawer,
 * add/update/remove operations, and cart count badge.
 * Depends on: api.js, ui.js, auth.js
 */

const cart = (() => {
  let _data = null; // cached cart data

  /* ── DRAWER DOM ELEMENTS ── */
  function getDrawer()  { return document.getElementById('cart-drawer'); }
  function getOverlay() { return document.getElementById('cart-drawer-overlay'); }
  function getBody()    { return document.getElementById('cart-body'); }
  function getFoot()    { return document.getElementById('cart-foot'); }
  function getCountBadge() { return document.getElementById('cart-count-badge'); }

  /* ── OPEN / CLOSE ── */
  function openDrawer() {
    getDrawer()?.classList.add('open');
    getOverlay()?.classList.add('open');
    load();
  }

  function closeDrawer() {
    getDrawer()?.classList.remove('open');
    getOverlay()?.classList.remove('open');
  }

  /* ── LOAD FROM API ── */
  async function load() {
    if (!auth.isLoggedIn()) return;
    try {
      const res = await api.get('/cart');
      _data = res.cart;
      render();
      updateBadge();
    } catch { /* silent */ }
  }

  /* ── BADGE ── */
  function updateBadge() {
    const badge = getCountBadge();
    if (!badge) return;
    const count = _data?.item_count || 0;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  /* ── RENDER DRAWER ── */
  function render() {
    const body = getBody();
    const foot = getFoot();
    if (!body) return;

    if (!_data?.items?.length) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p class="mt-2">Your cart is empty</p>
          <button class="btn btn-white btn-sm mt-3" onclick="cart.closeDrawer()">Continue Shopping</button>
        </div>`;
      if (foot) foot.style.display = 'none';
      return;
    }

    body.innerHTML = _data.items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-thumb">
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.product_name}" />`
            : (CATEGORY_ICONS[item.category] || '👕')}
        </div>
        <div>
          <div class="cart-item-name">${item.product_name}</div>
          <div class="cart-item-meta">${[item.size, item.color].filter(Boolean).join(' · ')}</div>
          <div class="qty-control mt-1">
            <button class="qty-btn" data-action="dec" data-item="${item.id}" data-qty="${item.quantity - 1}">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" data-action="inc" data-item="${item.id}" data-qty="${item.quantity + 1}">+</button>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="cart-item-price">${formatCurrency(item.line_total)}</div>
          <button class="cart-remove" data-item="${item.id}" data-qty="0" title="Remove">✕</button>
        </div>
      </div>`).join('');

    // Bind qty / remove buttons
    body.querySelectorAll('[data-item]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const itemId = btn.dataset.item;
        const qty    = parseInt(btn.dataset.qty);
        await updateItem(itemId, qty);
      });
    });

    if (foot) {
      foot.style.display = 'block';
      const totalEl = document.getElementById('cart-total-val');
      if (totalEl) totalEl.textContent = formatCurrency(_data.total);
    }
  }

  /* ── ADD ITEM ── */
  async function addItem(variantId, quantity = 1) {
    if (!auth.isLoggedIn()) {
      window.location.href = 'user_login.html';
      return;
    }
    try {
      const res = await api.post('/cart/items', { variant_id: variantId, quantity });
      _data = res.cart;
      render();
      updateBadge();
      showToast('Added to cart');
      openDrawer();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /* ── UPDATE / REMOVE ITEM ── */
  async function updateItem(itemId, quantity) {
    try {
      if (quantity <= 0) {
        await api.delete(`/cart/items/${itemId}`) // backend may not have DELETE per item
          .catch(() => api.put(`/cart/items/${itemId}`, { quantity: 0 }));
      } else {
        await api.put(`/cart/items/${itemId}`, { quantity });
      }
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  /* ── CLEAR CART ── */
  async function clear() {
    try {
      await api.delete('/cart');
      _data = null;
      render();
      updateBadge();
    } catch { /* silent */ }
  }

  /* ── GET CACHED DATA ── */
  function getData() { return _data; }

  return { openDrawer, closeDrawer, load, addItem, updateItem, clear, getData };
})();

window.cart = cart;

/* ── INIT DRAWER BINDINGS ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cart-toggle-btn')?.addEventListener('click', cart.openDrawer);
  document.getElementById('cart-drawer-overlay')?.addEventListener('click', cart.closeDrawer);
  document.getElementById('cart-drawer-close')?.addEventListener('click', cart.closeDrawer);

  // Lazy-load cart count if user is logged in
  if (auth.isLoggedIn()) cart.load();
});
