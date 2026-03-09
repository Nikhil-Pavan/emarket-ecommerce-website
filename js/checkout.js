/**
 * Emarket - Checkout page: address, order summary, place order
 */
(function () {
  'use strict';

  const ADDRESS_KEY = 'emarket_addresses';
  const CART_KEY = 'emarket_cart';
  const DELIVERY_FEE = 5.99;

  function getCart() {
    try {
      var cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  }

  function getAddresses() {
    try {
      var raw = localStorage.getItem(ADDRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAddress(addr) {
    var addrs = getAddresses();
    addrs.push(addr);
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addrs));
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    if (window.EmarketCart && window.EmarketCart.updateCartUI) {
      window.EmarketCart.updateCartUI();
    }
  }

  function renderOrderSummary() {
    var cart = getCart();
    var container = document.getElementById('checkout-order-items');
    var totalEl = document.getElementById('checkout-total');
    if (!container) return;
    if (cart.length === 0) {
      container.innerHTML = '<p>Your cart is empty.</p>';
      if (totalEl) totalEl.textContent = '0.00';
      return;
    }
    var subtotal = cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
    var total = subtotal + DELIVERY_FEE;
    container.innerHTML = cart.map(function (item) {
      return '<div class="checkout-item">' +
        '<img src="' + item.image + '" alt="">' +
        '<span>' + item.name + ' × ' + item.quantity + '</span>' +
        '<span>$' + (item.price * item.quantity).toFixed(2) + '</span></div>';
    }).join('');
    if (totalEl) totalEl.textContent = total.toFixed(2);
  }

  function renderSavedAddresses() {
    var addrs = getAddresses();
    var container = document.getElementById('saved-addresses');
    var form = document.getElementById('new-address-form');
    if (!container) return;
    if (addrs.length === 0) {
      container.innerHTML = '';
      if (form) form.classList.add('show');
      return;
    }
    container.innerHTML = '<h3>Saved Address</h3>' + addrs.map(function (addr, i) {
      return '<label class="saved-address-card">' +
        '<input type="radio" name="selected-address" value="' + i + '">' +
        '<div class="address-details">' +
        '<strong>' + (addr.name || '') + '</strong><br>' +
        (addr.phone || '') + '<br>' +
        (addr.street || '') + '<br>' +
        (addr.city || '') + ', ' + (addr.state || '') + ' - ' + (addr.pincode || '') +
        '</div></label>';
    }).join('');
    if (form) form.classList.add('show');
  }

  function getSelectedAddress() {
    var radio = document.querySelector('input[name="selected-address"]:checked');
    var addrs = getAddresses();
    if (radio && addrs.length) {
      var idx = parseInt(radio.value, 10);
      return addrs[idx];
    }
    var name = document.getElementById('addr-name');
    var phone = document.getElementById('addr-phone');
    var street = document.getElementById('addr-street');
    var city = document.getElementById('addr-city');
    var state = document.getElementById('addr-state');
    var pincode = document.getElementById('addr-pincode');
    if (!name || !name.value.trim()) return null;
    return {
      name: name.value.trim(),
      phone: (phone && phone.value.trim()) || '',
      street: (street && street.value.trim()) || '',
      city: (city && city.value.trim()) || '',
      state: (state && state.value.trim()) || '',
      pincode: (pincode && pincode.value.trim()) || ''
    };
  }

  function init() {
    if (getCart().length === 0) {
      window.location.href = 'cart.html';
      return;
    }
    renderSavedAddresses();
    renderOrderSummary();

    var btnSave = document.querySelector('.btn-save-address');
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        var name = document.getElementById('addr-name');
        var phone = document.getElementById('addr-phone');
        var street = document.getElementById('addr-street');
        var city = document.getElementById('addr-city');
        var state = document.getElementById('addr-state');
        var pincode = document.getElementById('addr-pincode');
        if (!name || !name.value.trim()) {
          alert('Please enter your name.');
          return;
        }
        saveAddress({
          name: name.value.trim(),
          phone: (phone && phone.value.trim()) || '',
          street: (street && street.value.trim()) || '',
          city: (city && city.value.trim()) || '',
          state: (state && state.value.trim()) || '',
          pincode: (pincode && pincode.value.trim()) || ''
        });
        name.value = '';
        if (phone) phone.value = '';
        if (street) street.value = '';
        if (city) city.value = '';
        if (state) state.value = '';
        if (pincode) pincode.value = '';
        renderSavedAddresses();
      });
    }

    var btnPlace = document.getElementById('btn-place-order');
    var modal = document.getElementById('order-confirm-modal');
    var btnOk = document.getElementById('btn-modal-ok');
    if (btnPlace) {
      btnPlace.addEventListener('click', function () {
        var cart = getCart();
        if (cart.length === 0) {
          alert('Your cart is empty.');
          return;
        }
        var addr = getSelectedAddress();
        if (!addr || !addr.name) {
          alert('Please select a saved address or fill in and save a new address.');
          return;
        }
        if (modal) modal.classList.add('open');
      });
    }
    if (btnOk && modal) {
      btnOk.addEventListener('click', function () {
        modal.classList.remove('open');
        clearCart();
        window.location.href = 'order-success.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
