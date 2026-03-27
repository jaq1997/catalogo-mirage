/* ─── CONFIGURAÇÕES ─────────────────────────────────────────────────────── */
const WPP = '5551989912555';
const BASE_URL_FOTOS = 'https://pub-9eb15062e53d4ad1a85362ac330e3002.r2.dev/';

/* ─── ESTADO DA APLICAÇÃO ────────────────────────────────────────────────── */
const path = window.location.pathname.split("/").pop();
const pageBrand = path.replace(".html", "").toLowerCase();
const marcasValidas = ['adidas', 'nike', 'supreme', 'bape', 'carhartt'];

const marcaFixa = marcasValidas.includes(pageBrand) ? pageBrand : 'todos';
let activeFilters = {
  tipo: 'todos'
};
let searchQuery = '';
let curProd = null;
let curSize = null;

/* ─── HELPERS DE PREÇO E MOEDA ───────────────────────────────────────────── */
function isEu() { return document.getElementById('regionBtn')?.dataset.eu === '1'; }
function price(p) { return isEu() ? `Price on request` : `Preço sob consulta`; }

function wppMsg(p, sz) {
  const pr = price(p);
  const s = sz ? ` | Tamanho: ${sz}` : '';
  return encodeURIComponent(`Olá! Tenho interesse no produto:\n\n*${p.nome}*\nPreço: ${pr}${s}\n\nVi no catálogo Mirage Co.`);
}

const wppSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle; margin-right:5px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L.057 23.633a.5.5 0 0 0 .61.61l5.775-1.478A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.088-1.392l-.363-.216-3.763.963.982-3.637-.237-.376A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;

/* ─── FILTROS E BUSCA ───────────────────────────────────────────────────── */
function setFilter(group, value) {
  const val = value.toLowerCase();

  if (group === 'marca') {
    if (val === 'todos' || val === 'todas') window.location.href = 'index.html';
    else window.location.href = `${val}.html`;
    return;
  }

  activeFilters[group] = val;
  document.querySelectorAll(`.fb[data-g="${group}"]`).forEach(b => {
    b.classList.toggle('active', b.dataset.v.toLowerCase() === val);
  });
  renderGrid();
}

function isMobile() {
  return window.innerWidth <= 768;
}

function handleSearch(val) {
  searchQuery = (val || '').toLowerCase().trim();
  renderGrid();

  // Comportamento mobile: esconde hero + promo e faz scroll pro grid
  if (isMobile()) {
    const hero = document.getElementById('heroSlider');
    const promo = document.querySelector('.promo-strip');
    const filterSection = document.querySelector('.filter-section');

    if (searchQuery.length > 0) {
      // Esconde o hero e o promo strip
      if (hero) hero.classList.add('search-hidden');
      if (promo) promo.classList.add('search-hidden');

      // Scroll suave até a seção de filtros/grid
      if (filterSection) {
        setTimeout(() => {
          filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    } else {
      // Quando limpa a busca, restaura o hero e o promo
      if (hero) hero.classList.remove('search-hidden');
      if (promo) promo.classList.remove('search-hidden');
    }
  }
}

function toggleRegion() {
  const btn = document.getElementById('regionBtn');
  if (!btn) return;
  const isEu = btn.dataset.eu === '1';
  btn.dataset.eu = isEu ? '0' : '1';
  btn.textContent = isEu ? '🇧🇷 Brasil' : '🇪🇺 Europa';
  renderGrid();
}

/* ─── ALGORITMO DE RANDOMIZAÇÃO (FISHER-YATES) ─── */
function embaralhar(array) {
  let lista = [...array];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista.slice(0, 20);
}

/* ─── RENDERIZAÇÃO ──────────────────────────────────────────────────────── */
function renderGrid() {
  const source = window.todos || [];

  // HOME: curadoria de 20 produtos aleatórios divididos nas duas seções
  if (marcaFixa === 'todos') {
    const selecionados = embaralhar(source);
    desenharCards('grid-drop-exclusivo', selecionados.slice(0, 10));
    desenharCards('grid-mais-vistos', selecionados.slice(10, 20));
  } else {
    // Páginas de marca: mostra tudo daquela marca com filtros ativos
    const list = source.filter(p => {
      const pMarca = (p.marca || "").toLowerCase();
      const pTipo = (p.tipo || "").toLowerCase();
      const pNome = (p.nome || "").toLowerCase();

      const matchMarca = pMarca === marcaFixa;
      const matchTipo = activeFilters.tipo === 'todos' || pTipo === activeFilters.tipo || (activeFilters.tipo === 'calcas' && pTipo === 'calças');
      const matchBusca = !searchQuery || pNome.includes(searchQuery) || pMarca.includes(searchQuery);

      return matchMarca && matchTipo && matchBusca;
    });

    const countEl = document.getElementById('pcount');
    if (countEl) countEl.textContent = `${list.length} produtos`;

    desenharCards('grid', list);

    // Banner dinâmico para páginas internas
    const slideTitle = document.querySelector('.slide-title');
    const slideSub = document.querySelector('.slide-subtitle');
    const slideBtn = document.querySelector('.slide-btn');
    if (slideTitle) slideTitle.innerHTML = `${marcaFixa.toUpperCase()}<br>COLLECTION`;
    if (slideSub) slideSub.textContent = "EXPLORE O DROP";
    if (slideBtn) slideBtn.style.display = 'none';
  }
}

/* ─── FUNÇÃO AUXILIAR PARA CRIAR OS CARDS ─── */
function desenharCards(containerId, lista) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = '<div class="empty">Nenhum produto encontrado.</div>';
    return;
  }

  grid.innerHTML = lista.map(p => {
    const fotoUrl = encodeURI(BASE_URL_FOTOS + p.imgs[0]);
    return `
    <div class="card" onclick="openModal(${p.id})">
      <div class="card-img">
        <img src="${fotoUrl}" alt="${p.nome}" loading="lazy" onerror="this.src='https://placehold.co/400x500?text=Foto+Indisponível'">
        ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
      </div>
      <div class="card-info">
        <div class="card-brand">${p.marca.toUpperCase()}</div>
        <div class="card-name">${p.nome}</div>
        <div class="card-footer">
          <div class="card-price">${price(p)}</div>
          <button class="wpp-btn" onclick="event.stopPropagation();window.open('https://wa.me/${WPP}?text=${wppMsg(p, null)}','_blank')">
            ${wppSvg} DETALHES
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ─── MODAL ─────────────────────────────────────────────────────────────── */
function openModal(id) {
  const list = window.todos || [];
  const pid = typeof id === 'number' ? id : Number(id);
  const p = list.find(x => Number(x.id) === pid);
  if (!p) return;
  curProd = p; curSize = null;

  const mImg = document.getElementById('mImg');
  const mBrand = document.getElementById('mBrand');
  const mName = document.getElementById('mName');
  const mType = document.getElementById('mType');
  const mPrice = document.getElementById('mPrice');
  const mDesc = document.getElementById('mDesc');
  const mSizes = document.getElementById('mSizes');
  const mThumbs = document.getElementById('mThumbs');
  const overlay = document.getElementById('overlay');

  if (!mImg || !mBrand || !mName || !mType || !mPrice || !mDesc || !mSizes || !mThumbs || !overlay) return;

  mImg.src = encodeURI(BASE_URL_FOTOS + p.imgs[0]);
  mBrand.textContent = p.marca.toUpperCase();
  mName.textContent = p.nome;
  mType.textContent = p.tipo.toUpperCase();
  mPrice.textContent = price(p);
  mDesc.textContent = p.desc || "Exclusividade Mirage Co.";

  mSizes.innerHTML = (p.sizes || ["P", "M", "G", "GG"])
    .map(s => `<button class="sz" onclick="selSize('${s}',this)">${s}</button>`).join('');

  mThumbs.innerHTML = p.imgs
    .map((img, i) => `<img src="${encodeURI(BASE_URL_FOTOS + img)}" class="${i === 0 ? 'active' : ''}" onclick="switchImg(this.src,this)">`).join('');

  // Define o handler do botão WPP inicial (sem tamanho selecionado)
  const wppBtn = document.getElementById('mWpp');
  if (wppBtn) wppBtn.onclick = () => window.open(`https://wa.me/${WPP}?text=${wppMsg(curProd, curSize)}`, '_blank');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('overlay') || e.target.className === 'mcls') {
    document.getElementById('overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}

function selSize(s, btn) {
  curSize = s;
  document.querySelectorAll('.sz').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  const wppBtn = document.getElementById('mWpp');
  if (wppBtn) wppBtn.onclick = () => window.open(`https://wa.me/${WPP}?text=${wppMsg(curProd, curSize)}`, '_blank');
}

function switchImg(src, el) {
  document.getElementById('mImg').src = src;
  document.querySelectorAll('#mThumbs img').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

/* ─── DROPDOWN BRANDS ────────────────────────────────────────────────────── */
function toggleBrandsDropdown(e) {
  if (e) e.stopPropagation();
  document.getElementById('brandsDropdown')?.classList.toggle('open');
}

/* ─── INICIALIZAÇÃO ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Fecha dropdown de marcas ao clicar fora
  document.addEventListener('click', e => {
    const dropdown = document.getElementById('brandsDropdown');
    if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.brands-toggle-mobile')) {
      dropdown.classList.remove('open');
    }
  });

  // Sincroniza os dois inputs de busca (desktop e mobile)
  const inputs = document.querySelectorAll('.nav-search-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const val = input.value;
      // Sincroniza o outro input
      inputs.forEach(other => { if (other !== input) other.value = val; });
      handleSearch(val);
    });
  });
});
