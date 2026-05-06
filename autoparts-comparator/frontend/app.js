'use strict';

const form         = document.getElementById('searchForm');
const refInput     = document.getElementById('refInput');
const searchBtn    = document.getElementById('searchBtn');
const statusBar    = document.getElementById('statusBar');
const resultsSection = document.getElementById('resultsSection');
const refLabel     = document.getElementById('refLabel');
const rowCount     = document.getElementById('rowCount');
const resultsBody  = document.getElementById('resultsBody');
const errorsSection = document.getElementById('errorsSection');
const errorsList   = document.getElementById('errorsList');
const emptyState   = document.getElementById('emptyState');

// ── Helpers ──────────────────────────────────────────────────────────────

function show(...els) { els.forEach((el) => el.classList.remove('hidden')); }
function hide(...els) { els.forEach((el) => el.classList.add('hidden')); }

function setStatus(msg, isError = false) {
  statusBar.innerHTML = msg;
  statusBar.className = 'status-bar' + (isError ? ' error' : '');
  show(statusBar);
}

function formatPrice(price, currency = 'EUR') {
  if (price == null) return '<span class="avail-no">N/A</span>';
  return `<span class="price">${Number(price).toFixed(2)} ${currency}</span>`;
}

function formatAvailability(avail) {
  if (avail == null || avail === '') return '—';
  const n = Number(avail);
  if (!isNaN(n)) {
    if (n <= 0) return '<span class="avail-no">Rupture</span>';
    if (n <= 3) return `<span class="avail-low">${n} en stock</span>`;
    return `<span class="avail-yes">${n} en stock</span>`;
  }
  const lower = String(avail).toLowerCase();
  if (['true', 'yes', 'disponible', 'in stock'].includes(lower))
    return '<span class="avail-yes">Disponible</span>';
  if (['false', 'no', 'indisponible', 'out of stock'].includes(lower))
    return '<span class="avail-no">Indisponible</span>';
  return avail;
}

function formatDelivery(days) {
  if (days == null || days === '') return '—';
  const n = Number(days);
  if (!isNaN(n)) return `${n} j ouvré${n > 1 ? 's' : ''}`;
  return days;
}

function buildRow(row) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${escHtml(row.supplier ?? '—')}</td>
    <td>${escHtml(row.brand ?? '—')}</td>
    <td>${formatPrice(row.price, row.currency)}</td>
    <td>${formatAvailability(row.availability)}</td>
    <td>${formatDelivery(row.deliveryDays)}</td>
  `;
  return tr;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Search ───────────────────────────────────────────────────────────────

async function doSearch(ref) {
  hide(resultsSection, emptyState, errorsSection, statusBar);
  resultsBody.innerHTML = '';
  errorsList.innerHTML  = '';

  searchBtn.disabled = true;
  searchBtn.innerHTML = '<span class="loader"></span>Recherche…';
  setStatus(`Interrogation des fournisseurs pour <strong>${escHtml(ref)}</strong>…`);

  try {
    const res  = await fetch(`/api/search?ref=${encodeURIComponent(ref)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? `Erreur serveur ${res.status}`);
    }

    hide(statusBar);
    refLabel.textContent = ref;
    rowCount.textContent = `${data.rows.length} résultat${data.rows.length !== 1 ? 's' : ''}`;

    if (data.rows.length === 0) {
      show(emptyState);
    } else {
      data.rows.forEach((row) => resultsBody.appendChild(buildRow(row)));
      show(resultsSection);
    }

    if (data.errors && data.errors.length > 0) {
      errorsList.innerHTML = data.errors
        .map((e) => `<li><strong>${escHtml(e.supplier)}</strong> — ${escHtml(e.error)}</li>`)
        .join('');
      show(errorsSection, resultsSection);
    }
  } catch (err) {
    setStatus(`Erreur : ${err.message}`, true);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Rechercher';
  }
}

// ── Event listeners ───────────────────────────────────────────────────────

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ref = refInput.value.trim().toUpperCase();
  if (ref) doSearch(ref);
});

// Auto-uppercase while typing
refInput.addEventListener('input', () => {
  const pos = refInput.selectionStart;
  refInput.value = refInput.value.toUpperCase();
  refInput.setSelectionRange(pos, pos);
});
