/* Rangabazar.com — vanilla JS, no dependencies */
(function () {
  'use strict';

  // ---- Settings you may change before launch ----
  var NEWSLETTER_ENDPOINT = ''; // e.g. a Formspree / Getform / Brevo form URL that accepts POST
  var ORDER_URL = 'https://www.facebook.com/rangabazarofficial';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var money = function (n) { return '৳ ' + n.toLocaleString('en-US'); };

  // ---- Toast ----
  var toast = $('#toast'), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  // ---- Mobile navigation ----
  var menuBtn = $('#menu-btn'), nav = $('#primary-nav');
  function setNav(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  }

  // ---- Product filtering (category + search) ----
  var cards = $$('.card'), state = { cat: '', q: '' };
  var note = $('#filter-note'), noteText = $('#filter-text'), emptyMsg = $('#empty');
  function applyFilter() {
    var shown = 0, q = state.q.trim().toLowerCase();
    cards.forEach(function (c) {
      var okCat = !state.cat || c.dataset.cat.split(' ').indexOf(state.cat) > -1;
      var okQ = !q || (c.dataset.name + ' ' + c.dataset.bn + ' ' + c.dataset.desc).toLowerCase().indexOf(q) > -1;
      c.hidden = !(okCat && okQ);
      if (!c.hidden) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown > 0;
    var label = [];
    if (state.cat) { var b = $('.cat[data-cat="' + state.cat + '"] strong'); if (b) label.push(b.textContent); }
    if (q) label.push('“' + state.q.trim() + '”');
    if (note) { note.hidden = !label.length; if (noteText) noteText.textContent = 'Showing: ' + label.join(' · '); }
    $$('.cat').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)); });
  }
  // category buttons
  $$('.cat').forEach(function (b) {
    b.addEventListener('click', function () {
      state.cat = state.cat === b.dataset.cat ? '' : b.dataset.cat;
      applyFilter();
      if (state.cat) { var t = $('#featured'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
  var clear = $('#filter-clear');
  if (clear) clear.addEventListener('click', function () { state.cat = ''; state.q = ''; var i = $('#search-input'); if (i) i.value = ''; applyFilter(); });

  // ---- Search panel ----
  var searchBtn = $('#search-btn'), panel = $('#search-panel'), sInput = $('#search-input');
  if (searchBtn && panel) {
    searchBtn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      searchBtn.setAttribute('aria-expanded', String(open));
      if (open) sInput.focus();
    });
    $('#search-form').addEventListener('submit', function (e) {
      e.preventDefault();
      state.q = sInput.value; applyFilter();
      var t = $('#featured'); if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
    sInput.addEventListener('input', function () { state.q = sInput.value; applyFilter(); });
    $('#search-close').addEventListener('click', function () { panel.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); searchBtn.focus(); });
  }

  // ---- Wishlist ----
  var wish = store.get('rb_wish', []);
  $$('.wish').forEach(function (b) {
    var id = b.closest('.card').dataset.id;
    var on = wish.indexOf(id) > -1;
    b.setAttribute('aria-pressed', String(on));
    b.addEventListener('click', function () {
      var i = wish.indexOf(id);
      if (i > -1) wish.splice(i, 1); else wish.push(id);
      store.set('rb_wish', wish);
      var now = i === -1;
      b.setAttribute('aria-pressed', String(now));
      say(now ? 'Saved to your wishlist' : 'Removed from your wishlist');
    });
  });

  // ---- Cart ----
  var cart = store.get('rb_cart', {});
  var drawer = $('#cart'), scrim = $('#scrim'), cartBtn = $('#cart-btn'), lastFocus;
  var catalog = {};
  cards.forEach(function (c) {
    catalog[c.dataset.id] = { id: c.dataset.id, name: c.dataset.name, price: +c.dataset.price, img: $('img', c).getAttribute('src') };
  });
  function save() { store.set('rb_cart', cart); }
  function count() { return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0); }
  function render() {
    var ids = Object.keys(cart).filter(function (id) { return catalog[id] && cart[id] > 0; });
    var body = $('#cart-items'), total = 0;
    body.innerHTML = '';
    if (!ids.length) {
      body.innerHTML = '<p class="drawer__empty">Your cart is empty.<br>Add something from the hills of Rangamati.</p>';
    }
    ids.forEach(function (id) {
      var p = catalog[id], q = cart[id]; total += p.price * q;
      var el = document.createElement('div'); el.className = 'line';
      el.innerHTML = '<img src="' + p.img + '" alt="" width="64" height="80">' +
        '<div><h3></h3><div class="qty"><button type="button" data-d="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">' + q + '</span><button type="button" data-d="1" aria-label="Increase quantity">+</button></div></div>' +
        '<div style="text-align:right"><div class="price">' + money(p.price * q) + '</div><button type="button" class="rm" data-rm="1">Remove</button></div>';
      $('h3', el).textContent = p.name;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.rm) delete cart[id];
        else { cart[id] = Math.max(0, cart[id] + (+b.dataset.d)); if (!cart[id]) delete cart[id]; }
        save(); render();
      });
      body.appendChild(el);
    });
    $('#cart-total').textContent = money(total);
    $('#checkout').hidden = !ids.length;
    var n = count(), badge = $('#cart-count');
    badge.textContent = n; badge.hidden = n === 0;
    cartBtn.setAttribute('aria-label', 'Open cart, ' + n + (n === 1 ? ' item' : ' items'));
  }
  function openCart() { lastFocus = document.activeElement; drawer.classList.add('is-open'); scrim.classList.add('is-open'); $('#cart-close').focus(); document.body.style.overflow = 'hidden'; }
  function closeCart() { drawer.classList.remove('is-open'); scrim.classList.remove('is-open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  if (drawer) {
    cartBtn.addEventListener('click', openCart);
    $('#cart-close').addEventListener('click', closeCart);
    scrim.addEventListener('click', closeCart);
    $('#checkout').href = ORDER_URL;
    $$('.add').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.closest('.card').dataset.id;
        cart[id] = (cart[id] || 0) + 1; save(); render();
        say('Added to cart: ' + catalog[id].name);
      });
    });
    render();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer && drawer.classList.contains('is-open')) closeCart();
    else if (panel && !panel.hidden) { panel.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); searchBtn.focus(); }
    else if (nav && nav.classList.contains('is-open')) { setNav(false); menuBtn.focus(); }
  });
  // keep focus inside the open cart
  document.addEventListener('focusin', function (e) {
    if (drawer && drawer.classList.contains('is-open') && !drawer.contains(e.target)) $('#cart-close').focus();
  });

  // ---- Account ----
  var acct = $('#account-btn');
  if (acct) acct.addEventListener('click', function () { say('Customer accounts are not open yet. Order through our Facebook page.'); });

  // ---- Newsletter ----
  var nf = $('#news-form');
  if (nf) nf.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#news-email').value.trim(), msg = $('#news-msg');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = 'Enter a valid email address, like name@example.com.'; $('#news-email').focus(); return; }
    if (!NEWSLETTER_ENDPOINT) { msg.textContent = 'Email signup is not switched on yet. Follow @rangabazarofficial for updates.'; return; }
    msg.textContent = 'Sending…';
    fetch(NEWSLETTER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: email }) })
      .then(function (r) { if (!r.ok) throw new Error(); msg.textContent = 'Thank you. You are on the list.'; nf.reset(); })
      .catch(function () { msg.textContent = 'Could not subscribe right now. Please try again in a moment.'; });
  });

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
