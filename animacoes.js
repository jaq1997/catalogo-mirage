/* ─── ANIMAÇÕES & EFEITOS ─────────────────────────────────────────────────── */

/* PAGE ENTER — fade-in suave ao carregar */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-enter');
});

/* SCROLL REVEAL — cards aparecem conforme scrollam para a tela */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function observeCards() {
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity .4s ease ${Math.min(i * 0.04, 0.5)}s, transform .4s ease ${Math.min(i * 0.04, 0.5)}s`;
    revealObserver.observe(card);
  });
}

/* NAV SHADOW — sombra aparece ao scrollar */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 10
    ? '0 2px 24px rgba(0,0,0,.6)'
    : 'none';
}, { passive: true });

/* HERO PARALLAX — efeito leve de parallax no banner hero */
window.addEventListener('scroll', () => {
  const heroImg = document.querySelector('.hero img');
  if (!heroImg) return;
  const offset = window.scrollY * 0.15;
  heroImg.style.transform = `translateY(${offset}px) scale(1.02)`;
}, { passive: true });

/* MODAL IMAGE ZOOM — clique na imagem principal do modal dá zoom */
document.addEventListener('DOMContentLoaded', () => {
  const mImg = document.getElementById('mImg');
  if (!mImg) return;
  let zoomed = false;
  mImg.style.cursor = 'zoom-in';
  mImg.addEventListener('click', () => {
    zoomed = !zoomed;
    mImg.style.transform = zoomed ? 'scale(1.5)' : 'scale(1)';
    mImg.style.transition = 'transform .3s ease';
    mImg.style.cursor = zoomed ? 'zoom-out' : 'zoom-in';
    mImg.style.objectFit = zoomed ? 'contain' : 'cover';
  });

  // reset zoom when switching thumbnail
  const origSwitch = window.switchImg;
  window.switchImg = (src, el) => {
    zoomed = false;
    mImg.style.transform = 'scale(1)';
    mImg.style.objectFit = 'cover';
    mImg.style.cursor = 'zoom-in';
    if (origSwitch) origSwitch(src, el);
  };
});

/* FILTER BUTTON RIPPLE — efeito ripple nos botões de filtro */
document.addEventListener('click', e => {
  const btn = e.target.closest('.fb');
  if (!btn) return;
  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  ripple.style.cssText = `
    position:absolute;border-radius:50%;
    width:60px;height:60px;
    background:rgba(255,255,255,.15);
    transform:scale(0);
    animation:ripple .5s ease;
    left:${e.clientX - rect.left - 30}px;
    top:${e.clientY - rect.top - 30}px;
    pointer-events:none;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});

/* RIPPLE KEYFRAME — injeta a keyframe dinamicamente */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }`;
document.head.appendChild(rippleStyle);

/* RE-OBSERVE após renderGrid */
const origRender = window.renderGrid;
window.renderGrid = function () {
  if (origRender) origRender();
  requestAnimationFrame(observeCards);
};

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(observeCards);
});
