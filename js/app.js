/**
 * Emarket - Main Application JavaScript
 * Cart, Search, and shared UI functionality
 */
(function () {
  'use strict';

  const CART_KEY = 'emarket_cart';
  const DELIVERY_FEE = 5.99;

  function getCart() {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(function (item) { return item.id === product.id; });
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: 1
      });
    }
    saveCart(cart);
    animateCartIcon();
  }

  function updateCartItemQty(id, delta) {
    const cart = getCart();
    const item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart.splice(cart.indexOf(item), 1);
    }
    saveCart(cart);
  }

  function removeCartItem(id) {
    const cart = getCart().filter(function (i) { return i.id !== id; });
    saveCart(cart);
  }

  function getCartCount() {
    return getCart().reduce(function (sum, i) { return sum + i.quantity; }, 0);
  }

  function getCartSubtotal() {
    return getCart().reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
  }

  function getCartTotal() {
    return getCartSubtotal() + DELIVERY_FEE;
  }

  function updateCartUI() {
    const count = getCartCount();
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    const totalEl = document.getElementById('cart-dropdown-total');
    if (totalEl) totalEl.textContent = getCartSubtotal().toFixed(2);
    renderCartDropdown();
  }

  function animateCartIcon() {
    const wrap = document.querySelector('.cart-icon-wrap');
    if (wrap) {
      wrap.classList.add('cart-bump');
      setTimeout(function () { wrap.classList.remove('cart-bump'); }, 300);
    }
  }

  function renderCartDropdown() {
    const container = document.getElementById('cart-dropdown-items');
    if (!container) return;
    const cart = getCart();
    if (cart.length === 0) {
      container.innerHTML = '<p class="cart-empty-msg">Your cart is empty</p>';
      return;
    }
    container.innerHTML = cart.map(function (item) {
      const subtotal = (item.price * item.quantity).toFixed(2);
      return (
        '<div class="cart-dropdown-item" data-id="' + item.id + '">' +
        '<img src="' + item.image + '" alt="">' +
        '<div class="cart-dropdown-item-info">' +
        '<span class="cart-dropdown-name">' + item.name + '</span>' +
        '<span class="cart-dropdown-price">$' + item.price.toFixed(2) + '</span>' +
        '<div class="cart-dropdown-qty">' +
        '<button type="button" class="cart-qty-btn cart-qty-minus" aria-label="Decrease">−</button>' +
        '<span>' + item.quantity + '</span>' +
        '<button type="button" class="cart-qty-btn cart-qty-plus" aria-label="Increase">+</button>' +
        '</div>' +
        '</div>' +
        '<button type="button" class="cart-remove-btn" aria-label="Remove">×</button>' +
        '</div>'
      );
    }).join('');
    container.querySelectorAll('.cart-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.closest('.cart-dropdown-item').dataset.id;
        updateCartItemQty(id, -1);
      });
    });
    container.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.closest('.cart-dropdown-item').dataset.id;
        updateCartItemQty(id, 1);
      });
    });
    container.querySelectorAll('.cart-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = this.closest('.cart-dropdown-item').dataset.id;
        removeCartItem(id);
      });
    });
  }

  function initCartDropdown() {
    const iconWrap = document.querySelector('.cart-icon-wrap');
    const dropdown = document.getElementById('cart-dropdown');
    const searchIcon = document.getElementById('search-icon');
    const searchDropdown = document.getElementById('search-dropdown');
    if (iconWrap && dropdown) {
      iconWrap.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        e.preventDefault();
        if (searchDropdown) searchDropdown.classList.remove('open');
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !iconWrap.contains(e.target)) {
          dropdown.classList.remove('open');
        }
      });
    }
    if (searchIcon && searchDropdown) {
      searchIcon.addEventListener('click', function (e) {
        e.preventDefault();
        dropdown && dropdown.classList.remove('open');
        searchDropdown.classList.toggle('open');
        if (searchDropdown.classList.contains('open')) {
          setTimeout(function () {
            var input = document.getElementById('search-input');
            if (input) input.focus();
          }, 100);
        }
      });
      document.addEventListener('click', function (e) {
        if (!searchDropdown.contains(e.target) && !searchIcon.contains(e.target)) {
          searchDropdown.classList.remove('open');
        }
      });
    }
    var searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        filterProductsBySearch(searchInput.value.trim());
      }, 200));
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') searchDropdown && searchDropdown.classList.remove('open');
      });
    }
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function filterProductsBySearch(query) {
    var cards = document.querySelectorAll('.product-card');
    var resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;
    query = query.toLowerCase();
    if (!query) {
      cards.forEach(function (c) { c.style.display = ''; });
      resultsEl.innerHTML = '';
      return;
    }
    var matched = [];
    cards.forEach(function (card) {
      var name = (card.dataset.productName || '').toLowerCase();
      var show = name.indexOf(query) !== -1;
      card.style.display = show ? '' : 'none';
      if (show) {
        matched.push({
          name: card.dataset.productName,
          price: card.dataset.productPrice,
          image: card.dataset.productImage,
          id: card.dataset.productId
        });
      }
    });
    if (resultsEl.parentElement && resultsEl.parentElement.classList.contains('search-dropdown')) {
      resultsEl.innerHTML = matched.slice(0, 6).map(function (p) {
        return '<a href="products.html" class="search-result-item">' +
          '<img src="' + p.image + '" alt="">' +
          '<span>' + p.name + ' - $' + parseFloat(p.price).toFixed(2) + '</span></a>';
      }).join('');
    }
  }

  function initAddToCart() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.add-to-cart-btn');
      if (!btn) return;
      var card = btn.closest('.product-card');
      if (!card) return;
      e.preventDefault();
      addToCart({
        id: card.dataset.productId,
        name: card.dataset.productName,
        price: card.dataset.productPrice,
        image: card.dataset.productImage
      });
    });
  }

  function renderCartPage() {
    var tbody = document.getElementById('cart-table-body');
    var subtotalEl = document.getElementById('cart-subtotal');
    var deliveryEl = document.getElementById('cart-delivery');
    var totalEl = document.getElementById('cart-total');
    if (!tbody) return;
    var cart = getCart();
    var deliveryFee = window.EmarketCart ? window.EmarketCart.DELIVERY_FEE : 5.99;
    if (cart.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="cart-empty-cell">Your cart is empty. <a href="products.html">Continue shopping</a></td></tr>';
      if (subtotalEl) subtotalEl.textContent = '0.00';
      if (deliveryEl) deliveryEl.textContent = '0.00';
      if (totalEl) totalEl.textContent = '0.00';
      var proceedBtn = document.querySelector('.btn-proceed-checkout');
      if (proceedBtn) proceedBtn.style.display = 'none';
      return;
    }
    var proceedBtn = document.querySelector('.btn-proceed-checkout');
    if (proceedBtn) proceedBtn.style.display = '';
    tbody.innerHTML = cart.map(function (item) {
      var itemTotal = (item.price * item.quantity).toFixed(2);
      return '<tr data-id="' + item.id + '">' +
        '<td><img src="' + item.image + '" alt="" class="cart-table-img"></td>' +
        '<td>' + item.name + '</td>' +
        '<td>$' + item.price.toFixed(2) + '</td>' +
        '<td><div class="cart-qty-wrap">' +
        '<button type="button" class="cart-qty-btn cart-qty-minus">−</button>' +
        '<span class="cart-qty-num">' + item.quantity + '</span>' +
        '<button type="button" class="cart-qty-btn cart-qty-plus">+</button></div></td>' +
        '<td class="cart-item-total">$' + itemTotal + '</td>' +
        '<td><button type="button" class="cart-remove-btn" aria-label="Remove">×</button></td></tr>';
    }).join('');
    var subtotal = cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
    var total = subtotal + deliveryFee;
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (deliveryEl) deliveryEl.textContent = deliveryFee.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
    tbody.querySelectorAll('.cart-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.closest('tr').dataset.id;
        updateCartItemQty(id, -1);
        renderCartPage();
      });
    });
    tbody.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.closest('tr').dataset.id;
        updateCartItemQty(id, 1);
        renderCartPage();
      });
    });
    tbody.querySelectorAll('.cart-remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.closest('tr').dataset.id;
        removeCartItem(id);
        renderCartPage();
      });
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector('header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('header-scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initHamburger() {
    var hamburger = document.getElementById('nav-hamburger');
    var nav = document.querySelector('.nav-menu');
    var body = document.body;
    if (!hamburger || !nav) return;
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      body.classList.toggle('nav-open', nav.classList.contains('is-open'));
    });
    var navLinks = nav.querySelectorAll('.navbar a');
    navLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('is-open');
        nav.classList.remove('is-open');
        body.classList.remove('nav-open');
      });
    });
  }

  function init() {
    updateCartUI();
    initCartDropdown();
    initAddToCart();
    renderCartPage();
    initHeaderScroll();
    initHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.EmarketCart = {
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    updateCartItemQty: updateCartItemQty,
    removeCartItem: removeCartItem,
    getCartCount: getCartCount,
    getCartSubtotal: getCartSubtotal,
    getCartTotal: getCartTotal,
    DELIVERY_FEE: DELIVERY_FEE,
    updateCartUI: updateCartUI
  };
})();
