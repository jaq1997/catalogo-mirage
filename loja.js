/* ─── CONFIG ──────────────────────────────────────────────────────────────── */
const WPP = '5551989912555';
const R2  = 'https://pub-9eb15062e53d4ad1a85362ac330e3002.r2.dev';

/* ─── STATE ───────────────────────────────────────────────────────────────── */
let activeFilters = { tipo: 'todos', marca: 'todos' };
let curProd = null;
let curSize = null;

/* ─── REGION TOGGLE ───────────────────────────────────────────────────────── */
function toggleRegion() {
  const btn = document.getElementById('regionBtn');
  if (!btn) return;
  const isEu = btn.dataset.eu === '1';
  btn.dataset.eu = isEu ? '0' : '1';
  btn.textContent = isEu ? '🇧🇷 Brasil' : '🇪🇺 Europa';
  renderGrid();
}

function isEu() {
  return document.getElementById('regionBtn')?.dataset.eu === '1';
}

/* ─── PRICE HELPERS ───────────────────────────────────────────────────────── */
function price(p) {
  return isEu()
    ? `€${p.eur.toFixed(2).replace('.', ',')}`
    : `R$ ${p.brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
function priceAlt(p) {
  return isEu()
    ? `Também em R$ ${p.brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : `Também em €${p.eur.toFixed(2).replace('.', ',')}`;
}

/* ─── WHATSAPP ────────────────────────────────────────────────────────────── */
function wppMsg(p, sz) {
  const pr = isEu() ? `€${p.eur}` : `R$${p.brl}`;
  const s  = sz ? ` | Tamanho: ${sz}` : '';
  return encodeURIComponent(
    `Olá! Tenho interesse no produto:\n\n*${p.nome}* (${p.marca.toUpperCase()})\nTipo: ${p.tipo}${s}\nPreço: ${pr}\n\nPoderia me dar mais informações?`
  );
}

const wppSvg = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L.057 23.633a.5.5 0 0 0 .61.61l5.775-1.478A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.088-1.392l-.363-.216-3.763.963.982-3.637-.237-.376A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;

/* ─── FILTERS ─────────────────────────────────────────────────────────────── */
function setFilter(group, value) {
  activeFilters[group] = value;
  document.querySelectorAll(`.fb[data-g="${group}"]`).forEach(b => {
    b.classList.toggle('active', b.dataset.v === value);
  });
  renderGrid();
}

/* ─── RENDER GRID ─────────────────────────────────────────────────────────── */
function renderGrid() {
  // Use window.produtos if set by brand page, else window.todos
  const source = window.produtos || window.todos || [];
  const list = source.filter(p =>
    (activeFilters.tipo  === 'todos' || p.tipo  === activeFilters.tipo) &&
    (activeFilters.marca === 'todos' || activeFilters.marca === 'todas' || p.marca === activeFilters.marca)
  );

  const countEl = document.getElementById('pcount');
  if (countEl) countEl.textContent = `${list.length} produto${list.length !== 1 ? 's' : ''}`;

  const grid = document.getElementById('grid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '<div class="empty"><big>MIRAGE</big>Nenhum produto nessa combinação.</div>';
    return;
  }

  grid.innerHTML = list.map((p, i) => `
    <div class="card" style="animation-delay:${Math.min(i * 0.03, 0.4)}s" onclick="openModal(${p.id})">
      <div class="card-img">
        <img src="${p.imgs[0]}" alt="${p.nome}" loading="lazy">
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      </div>
      <div class="card-info">
        <div class="card-brand">${p.marca.toUpperCase()}</div>
        <div class="card-name">${p.nome}</div>
        <div class="card-type">${p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)}</div>
        <div class="card-footer">
          <div class="card-price">${price(p)}</div>
          <button class="wpp-btn" onclick="event.stopPropagation();window.open('https://wa.me/${WPP}?text=${wppMsg(p,null)}','_blank')">${wppSvg} Pedir</button>
        </div>
      </div>
    </div>`).join('');
}

/* ─── MODAL ───────────────────────────────────────────────────────────────── */
function openModal(id) {
  const source = window.produtos || window.todos || [];
  curProd = source.find(x => x.id === id);
  if (!curProd) return;
  curSize = null;

  document.getElementById('mImg').src = curProd.imgs[0];
  document.getElementById('mBrand').textContent = curProd.marca.toUpperCase();
  document.getElementById('mName').textContent  = curProd.nome;
  document.getElementById('mType').textContent  = curProd.tipo.charAt(0).toUpperCase() + curProd.tipo.slice(1);
  document.getElementById('mPrice').textContent    = price(curProd);
  document.getElementById('mPriceAlt').textContent = priceAlt(curProd);
  document.getElementById('mDesc').textContent     = curProd.desc;

  document.getElementById('mSizes').innerHTML = curProd.sizes
    .map(s => `<button class="sz" onclick="selSize('${s}',this)">${s}</button>`)
    .join('');

  document.getElementById('mThumbs').innerHTML = curProd.imgs
    .map((src, i) => `<img src="${src}" class="${i === 0 ? 'active' : ''}" onclick="switchImg('${src}',this)" loading="lazy">`)
    .join('');

  updateWpp();
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchImg(src, el) {
  document.getElementById('mImg').src = src;
  document.querySelectorAll('#mThumbs img').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

function selSize(s, btn) {
  curSize = s;
  document.querySelectorAll('.sz').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  updateWpp();
}

function updateWpp() {
  if (!curProd) return;
  document.getElementById('mWpp').onclick = () =>
    window.open(`https://wa.me/${WPP}?text=${wppMsg(curProd, curSize)}`, '_blank');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('overlay')) return;
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── KEYBOARD CLOSE ──────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─── INIT ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
});
