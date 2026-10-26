const rail = document.querySelector('#museum-rail');
const prev = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
const detailTitle = document.querySelector('#detail-title');
const detailCopy = document.querySelector('#detail-copy');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

let dragging = false;
let startX = 0;
let startScroll = 0;

const exhibitionCopy = {
  China: 'A planned gallery combining community-selected festivals, visual symbols, literature and language with original illustration.',
  Indonesia: 'A planned gallery exploring community-contributed traditions, stories and visual references through original artwork.',
  India: 'A planned gallery connecting festivals, diverse cultural practices and community voice without reducing India to one narrative.',
  Japan: 'A planned gallery linking visual culture, language, stories and contemporary community perspectives.',
  Italy: 'A planned gallery interpreting art, architecture, literature and personal cultural associations shared by the community.',
  'New Zealand': 'A planned gallery developed with attention to Māori cultural representation, consultation and appropriate attribution.',
  Canada: 'A planned gallery connecting place, cultural plurality and community-selected imagery.',
  'United States': 'A planned gallery recognising regional and cultural diversity rather than presenting a single national story.',
  'United Kingdom': 'A planned gallery bringing together literature, architecture, language and community memories.',
  Greece: 'A planned gallery connecting mythology, visual heritage and contemporary cultural identity.',
  Australia: 'The supplied collage now anchors this gallery through wildlife, coastline, landmarks, plants and geographic references.',
  Spain: 'A planned gallery connecting regional diversity, language, art and community-selected cultural stories.'
};

prev.addEventListener('click', () => rail.scrollBy({ left: -380, behavior: 'smooth' }));
next.addEventListener('click', () => rail.scrollBy({ left: 380, behavior: 'smooth' }));

rail.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;
  dragging = true;
  startX = event.clientX;
  startScroll = rail.scrollLeft;
  rail.classList.add('dragging');
  rail.setPointerCapture(event.pointerId);
});

rail.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  rail.scrollLeft = startScroll - (event.clientX - startX);
});

const stopDragging = () => {
  dragging = false;
  rail.classList.remove('dragging');
};

rail.addEventListener('pointerup', stopDragging);
rail.addEventListener('pointercancel', stopDragging);

document.querySelectorAll('.gallery-card button').forEach((button) => {
  button.addEventListener('click', (event) => {
    const card = event.currentTarget.closest('.gallery-card');
    const gallery = card.dataset.gallery;
    detailTitle.textContent = gallery;
    detailCopy.textContent = exhibitionCopy[gallery];
    document.querySelectorAll('.gallery-card').forEach((item) => item.removeAttribute('aria-current'));
    card.setAttribute('aria-current', 'true');
  });
});

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
