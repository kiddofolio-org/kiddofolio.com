/* ==========================================================================
   Kiddofolio — pricing configurator
   --------------------------------------------------------------------------
   EVERYTHING EDITABLE LIVES IN KIDDOFOLIO_CONFIG BELOW.
   To change a price, a label, or a Stripe Payment Link, edit only that object.
   No other part of this file needs to be touched.
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     1. CONFIGURATION  — edit here and nowhere else
     ====================================================================== */
  var KIDDOFOLIO_CONFIG = {

    /* Deposit taken at checkout, as a fraction of the total. */
    depositRate: 0.5,

    /* Question 1 — collection service (the pile we receive). */
    collection: [
      { id: 'c100', label: 'Up to 100 pieces',      price: 750 },
      { id: 'c250', label: 'Up to 250 pieces',      price: 1250 },
      { id: 'c500', label: 'Up to 500 pieces',      price: 2000 },
      { id: 'cXL',  label: 'More than 500 pieces',  custom: true }
    ],

    /* Question 2 — featured-work website (how many works go on the site). */
    website: [
      { id: 'w25',  label: 'Feature 25 works',       price: 1500 },
      { id: 'w50',  label: 'Feature 50 works',       price: 2000 },
      { id: 'w100', label: 'Feature 100 works',      price: 3250 },
      { id: 'wXL',  label: 'More than 100 works',    custom: true }
    ],

    /* Stripe Payment Links — one per standard combination.
       Key format: '<collectionId>|<websiteId>'.
       Leave a value as '' and that combination will route to the custom-quote
       form instead of Stripe, so the page never sends anyone to a dead link. */
    stripeLinks: {
      'c100|w25':  '',   /* $2,250 total / $1,125 deposit */
      'c100|w50':  '',   /* $2,750 total / $1,375 deposit */
      'c100|w100': '',   /* $4,000 total / $2,000 deposit */
      'c250|w25':  '',   /* $2,750 total / $1,375 deposit */
      'c250|w50':  '',   /* $3,250 total / $1,625 deposit */
      'c250|w100': '',   /* $4,500 total / $2,250 deposit */
      'c500|w25':  '',   /* $3,500 total / $1,750 deposit */
      'c500|w50':  '',   /* $4,000 total / $2,000 deposit */
      'c500|w100': ''    /* $5,250 total / $2,625 deposit */
    },

    /* Copy that changes often enough to be worth centralising. */
    copy: {
      collectionHelp: 'An estimate is fine. You don\u2019t need to count every piece\u2014a small overage is okay. If the collection materially exceeds your selection, we\u2019ll contact you before proceeding.',
      websiteHelp: 'We\u2019ll curate the strongest pieces for the website. You\u2019ll review our selection and can request changes during your included revision round.',
      emptyPrompt: 'Select both options to see your total.',
      shipping: 'Shipping included within the contiguous U.S.',
      ackLabel: 'I understand that my order is final and the deposit is nonrefundable.',
      ackError: 'Please confirm the acknowledgment above to continue to checkout.'
    },

    /* Where the custom-quote form posts. */
    quoteEndpoint: 'https://formspree.io/f/xlgyvqyp'
  };

  /* ======================================================================
     2. Wiring — no business values below this line
     ====================================================================== */
  var root = document.querySelector('[data-cfg]');
  if (!root) return;

  var STORE_KEY = 'kf-cfg-v2';

  var el = {
    collectionInputs: root.querySelectorAll('input[name="cfg-collection"]'),
    websiteInputs: root.querySelectorAll('input[name="cfg-website"]'),
    prompt: root.querySelector('[data-cfg-prompt]'),
    promptSub: root.querySelector('[data-cfg-prompt-sub]'),
    lines: root.querySelector('[data-cfg-lines]'),
    valCollection: root.querySelector('[data-cfg-val="collection"]'),
    valWebsite: root.querySelector('[data-cfg-val="website"]'),
    valTotal: root.querySelector('[data-cfg-val="total"]'),
    valDeposit: root.querySelector('[data-cfg-val="deposit"]'),
    valBalance: root.querySelector('[data-cfg-val="balance"]'),
    rowCollection: root.querySelector('[data-cfg-row="collection"]'),
    rowWebsite: root.querySelector('[data-cfg-row="website"]'),
    split: root.querySelector('[data-cfg-split]'),
    note: root.querySelector('[data-cfg-note]'),
    ackWrap: root.querySelector('[data-cfg-ack-wrap]'),
    ack: root.querySelector('[data-cfg-ack]'),
    cta: root.querySelector('[data-cfg-cta]'),
    error: root.querySelector('[data-cfg-error]'),
    quote: root.querySelector('[data-cfg-quote]'),
    standard: root.querySelector('[data-cfg-standard]'),
    quoteCollection: root.querySelector('[data-cfg-quote-collection]'),
    quoteWebsite: root.querySelector('[data-cfg-quote-website]'),
    quoteSummary: root.querySelector('[data-cfg-quote-summary]')
  };

  var money = (function () {
    try {
      var f = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
      });
      return function (n) { return f.format(n); };
    } catch (e) {
      return function (n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    }
  })();

  function find(list, id) {
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }

  var state = { collection: null, website: null };

  /* ---- Session persistence (survives in-page navigation and back/forward) ---- */
  function save() {
    try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function restore() {
    var raw;
    try { raw = window.sessionStorage.getItem(STORE_KEY); } catch (e) { return; }
    if (!raw) return;
    var saved;
    try { saved = JSON.parse(raw); } catch (e) { return; }
    if (!saved) return;
    [['collection', el.collectionInputs], ['website', el.websiteInputs]].forEach(function (pair) {
      var id = saved[pair[0]];
      if (!id) return;
      Array.prototype.forEach.call(pair[1], function (input) {
        if (input.value === id) { input.checked = true; state[pair[0]] = id; }
      });
    });
  }

  function isCustom() {
    var c = state.collection ? find(KIDDOFOLIO_CONFIG.collection, state.collection) : null;
    var w = state.website ? find(KIDDOFOLIO_CONFIG.website, state.website) : null;
    return !!((c && c.custom) || (w && w.custom));
  }

  function labelFor(kind, id) {
    var item = id ? find(KIDDOFOLIO_CONFIG[kind], id) : null;
    return item ? item.label : '';
  }

  function render() {
    var c = state.collection ? find(KIDDOFOLIO_CONFIG.collection, state.collection) : null;
    var w = state.website ? find(KIDDOFOLIO_CONFIG.website, state.website) : null;

    /* --- Custom quote path --- */
    if (isCustom()) {
      el.standard.hidden = true;
      el.quote.hidden = false;
      if (el.quoteCollection) el.quoteCollection.value = c ? c.label : '';
      if (el.quoteWebsite) el.quoteWebsite.value = w ? w.label : '';
      if (el.quoteSummary) {
        el.quoteSummary.value =
          'Collection: ' + (c ? c.label : 'not selected') +
          ' | Featured works: ' + (w ? w.label : 'not selected');
      }
      return;
    }
    el.quote.hidden = true;
    el.standard.hidden = false;

    var bothChosen = !!(c && w);

    /* --- Nothing selected --- */
    if (!c && !w) {
      el.prompt.hidden = false;
      el.prompt.textContent = KIDDOFOLIO_CONFIG.copy.emptyPrompt;
      el.promptSub.hidden = true;
      el.lines.hidden = true;
      el.split.hidden = true;
      el.note.hidden = true;
      el.ackWrap.hidden = true;
      el.cta.hidden = true;
      el.error.hidden = true;
      return;
    }

    /* --- One selected: show the chosen component, prompt for the other --- */
    if (!bothChosen) {
      el.prompt.hidden = true;
      el.lines.hidden = false;
      el.rowCollection.hidden = !c;
      el.rowWebsite.hidden = !w;
      if (c) el.valCollection.textContent = money(c.price);
      if (w) el.valWebsite.textContent = money(w.price);
      /* Deliberately no total shown — an incomplete amount is never a total. */
      el.split.hidden = true;
      el.note.hidden = true;
      el.ackWrap.hidden = true;
      el.cta.hidden = true;
      el.error.hidden = true;
      el.promptSub.hidden = false;
      el.promptSub.textContent = c
        ? 'Next, choose how many works to feature to see your total.'
        : 'Next, choose how big the pile is to see your total.';
      return;
    }

    /* --- Both selected: full breakdown --- */
    var total = c.price + w.price;
    var deposit = Math.round(total * KIDDOFOLIO_CONFIG.depositRate);
    var balance = total - deposit;

    el.prompt.hidden = true;
    el.promptSub.hidden = true;
    el.lines.hidden = false;
    el.rowCollection.hidden = false;
    el.rowWebsite.hidden = false;
    el.valCollection.textContent = money(c.price);
    el.valWebsite.textContent = money(w.price);
    el.valTotal.textContent = money(total);
    el.valDeposit.textContent = money(deposit);
    el.valBalance.textContent = money(balance);
    el.split.hidden = false;
    el.note.hidden = false;
    el.ackWrap.hidden = false;
    el.cta.hidden = false;
    el.error.hidden = true;

    /* Non-breaking space keeps "$X deposit" together, so on narrow screens the
       label wraps after the em dash rather than orphaning the word "deposit". */
    el.cta.textContent = 'Reserve your Kiddofolio \u2014 ' + money(deposit) + '\u00a0deposit';
    el.cta.setAttribute('aria-disabled', el.ack.checked ? 'false' : 'true');

    el.cta.dataset.total = String(total);
    el.cta.dataset.deposit = String(deposit);
    el.cta.dataset.balance = String(balance);
    el.cta.dataset.combo = c.id + '|' + w.id;
  }

  /* ---- Selection handlers ---- */
  function bind(inputs, key) {
    Array.prototype.forEach.call(inputs, function (input) {
      input.addEventListener('change', function () {
        state[key] = input.value;
        if (el.ack) el.ack.checked = false;
        save();
        render();
      });
    });
  }
  bind(el.collectionInputs, 'collection');
  bind(el.websiteInputs, 'website');

  if (el.ack) {
    el.ack.addEventListener('change', function () {
      el.cta.setAttribute('aria-disabled', el.ack.checked ? 'false' : 'true');
      if (el.ack.checked) el.error.hidden = true;
    });
  }

  /* ---- Checkout ---- */
  if (el.cta) {
    el.cta.addEventListener('click', function (event) {
      event.preventDefault();

      if (!el.ack.checked) {
        el.error.hidden = false;
        el.error.textContent = KIDDOFOLIO_CONFIG.copy.ackError;
        el.ack.focus();
        return;
      }

      var combo = el.cta.dataset.combo;
      var url = KIDDOFOLIO_CONFIG.stripeLinks[combo];

      /* No link configured for this combination — fall back to the quote form
         rather than sending the customer to a broken checkout. */
      if (!url) {
        el.standard.hidden = true;
        el.quote.hidden = false;
        if (el.quoteCollection) el.quoteCollection.value = labelFor('collection', state.collection);
        if (el.quoteWebsite) el.quoteWebsite.value = labelFor('website', state.website);
        if (el.quoteSummary) {
          el.quoteSummary.value =
            labelFor('collection', state.collection) + ' + ' +
            labelFor('website', state.website) + ' \u2014 total ' +
            money(Number(el.cta.dataset.total)) + ', deposit ' +
            money(Number(el.cta.dataset.deposit));
        }
        el.quote.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      /* Tag the Stripe session so the order is identifiable on our side. */
      var ref = 'KF-' + combo.replace('|', '-');
      window.location.href = url + (url.indexOf('?') === -1 ? '?' : '&') +
        'client_reference_id=' + encodeURIComponent(ref);
    });
  }

  /* ---- Init ---- */
  restore();
  render();
})();
