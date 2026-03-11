/**
 * paypal.js
 * Handles PayPal JS SDK integration for checkout.
 *
 * Setup:
 *   1. Add your PayPal sandbox client ID to .env: PAYPAL_CLIENT_ID=...
 *   2. The PayPal SDK script is loaded dynamically when the checkout page loads.
 *   3. On approval, the backend /api/payments/<order_id>/paypal/capture is called.
 *
 * In production:
 *   - Replace PAYPAL_CLIENT_ID with your live client ID
 *   - Set PAYPAL_MODE=live in backend .env
 *
 * Depends on: api.js, ui.js
 */

const paypalCheckout = (() => {
  // Replace with your actual PayPal sandbox/live client ID
  // In production this comes from the backend /api/payments/<id>/paypal/create response
  const SANDBOX_CLIENT_ID = 'sb'; // 'sb' uses PayPal sandbox demo mode

  let _orderId = null;  // Internal PitBros order ID
  let _onSuccess = null;
  let _onError   = null;

  /**
   * Load the PayPal JS SDK dynamically.
   * @param {string} clientId - PayPal client ID
   * @returns {Promise<void>}
   */
  function loadSDK(clientId) {
    return new Promise((resolve, reject) => {
      if (window.paypal) { resolve(); return; }
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Render PayPal smart buttons into a container element.
   *
   * @param {string} containerId - DOM element ID to render buttons in
   * @param {string} pitbrosOrderId - PitBros order ID (from /api/orders response)
   * @param {function} onSuccess - called with payment data on success
   * @param {function} onError - called with error message on failure
   */
  async function renderButtons(containerId, pitbrosOrderId, onSuccess, onError) {
    _orderId  = pitbrosOrderId;
    _onSuccess = onSuccess;
    _onError   = onError;

    const container = document.getElementById(containerId);
    if (!container) { onError?.('PayPal container not found'); return; }

    // Step 1: Get PayPal order ID from backend
    let paypalOrderId;
    let clientId = SANDBOX_CLIENT_ID;
    try {
      const res = await api.post(`/payments/${pitbrosOrderId}/paypal/create`);
      paypalOrderId = res.paypal_order_id;
      if (res.client_id && res.client_id !== 'SANDBOX_CLIENT_ID') clientId = res.client_id;
    } catch (err) {
      onError?.(err.message);
      return;
    }

    // Step 2: Load PayPal SDK with correct client ID
    try {
      await loadSDK(clientId);
    } catch (err) {
      onError?.('Could not load PayPal. Check your internet connection.');
      return;
    }

    // Step 3: Render buttons
    container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'white',
        shape: 'rect',
        label: 'pay',
        tagline: false,
      },

      // Return the already-created PayPal order ID
      createOrder: () => paypalOrderId,

      // Called after user approves payment on PayPal
      onApprove: async (data) => {
        container.innerHTML = '<p class="text-muted text-sm text-center" style="padding:1rem;">Capturing payment…</p>';
        try {
          const payment = await api.post(`/payments/${_orderId}/paypal/capture`, {
            paypal_order_id: data.orderID,
            payer_id: data.payerID,
          });
          _onSuccess?.(payment);
        } catch (err) {
          container.innerHTML = '';
          _onError?.(err.message);
          await renderButtons(containerId, pitbrosOrderId, onSuccess, onError);
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        _onError?.('PayPal encountered an error. Please try again.');
      },

      onCancel: () => {
        showToast('Payment cancelled', 'error');
      },

    }).render(`#${containerId}`);
  }

  return { renderButtons, loadSDK };
})();

window.paypalCheckout = paypalCheckout;
