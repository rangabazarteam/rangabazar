/* Rangabazar.com — vanilla JS, no dependencies */
(function () {
  'use strict';

  // ---- Settings you may change before launch ----
  var NEWSLETTER_ENDPOINT = ''; // e.g. a Formspree / Getform / Brevo form URL that accepts POST

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
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
  // category buttons: scroll to the featured product
  $$('.cat').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $('#featured'); if (t) t.scrollIntoView({ behavior: 'smooth' });
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

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (panel && !panel.hidden) { panel.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); searchBtn.focus(); }
    else if (nav && nav.classList.contains('is-open')) { setNav(false); menuBtn.focus(); }
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
