// ─── MOTEUR DE RÉSERVATION ───
function selectFormule(card) {
  document.querySelectorAll('.formule-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  const f = card.dataset.formule;
  document.getElementById('input-formule').value = f;
  document.getElementById('recap-formule').textContent = f;
}

// ─── SUIVI ÉVÉNEMENTS CLÉS : téléphone, email, formulaire contact ───
function trackContactForm() {
  if (typeof gtag === 'function') {
    gtag('event', 'contact_envoye', {
      'event_category': 'engagement',
      'event_label': 'Formulaire de contact bas de page'
    });
  }
  // Ne pas bloquer l'envoi natif du formulaire
  return true;
}

document.addEventListener('DOMContentLoaded', function() {
  // Suivi de tous les clics sur les numéros de téléphone
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
      if (typeof gtag === 'function') {
        gtag('event', 'clic_telephone', {
          'event_category': 'engagement',
          'event_label': link.href
        });
      }
    });
  });
  // Suivi de tous les clics sur les liens email
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function() {
      if (typeof gtag === 'function') {
        gtag('event', 'clic_email', {
          'event_category': 'engagement',
          'event_label': link.href
        });
      }
    });
  });
});

async function handleResa(e) {
  e.preventDefault();
  const btn = document.getElementById('resa-btn');
  const success = document.getElementById('resa-success');
  btn.disabled = true;
  btn.textContent = currentLang === 'en' ? '⏳ Sending…' : '⏳ Envoi en cours…';
  try {
    const resp = await fetch(e.target.action, {
      method: 'POST',
      body: new FormData(e.target),
      headers: { 'Accept': 'application/json' }
    });
    if (resp.ok) {
      success.style.display = 'block';
      btn.textContent = currentLang === 'en' ? '✓ Request sent!' : '✓ Demande envoyée !';
      btn.style.background = '#4a7558';
      // ─── SUIVI ÉVÉNEMENT CLÉ : réservation envoyée ───
      if (typeof gtag === 'function') {
        gtag('event', 'reservation_envoyee', {
          'event_category': 'engagement',
          'event_label': 'Formulaire de réservation'
        });
      }
      e.target.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = currentLang === 'en' ? '→ Send my booking request' : '→ Envoyer ma demande de réservation';
        btn.style.background = '';
        success.style.display = 'none';
      }, 6000);
    } else {
      throw new Error();
    }
  } catch {
    btn.disabled = false;
    btn.textContent = currentLang === 'en' ? '→ Send my booking request' : '→ Envoyer ma demande de réservation';
    alert(currentLang === 'en' ? 'An error occurred. Contact Pierre-François directly at +33 7 48 16 98 03.' : 'Une erreur est survenue. Contactez Pierre-François directement au 07 48 16 98 03.');
  }
}

// ─── CALENDRIER DES DISPONIBILITÉS ───
let calSelectedDate = '';

// Définir la date minimale sur aujourd'hui
document.addEventListener('DOMContentLoaded', function() {
  const calInput = document.getElementById('cal-date-select');
  if (calInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    calInput.min = `${yyyy}-${mm}-${dd}`;
  }
});

function onCalDateChange(val) {
  calSelectedDate = val;
  // Pré-remplir aussi le champ date du formulaire Formspree (section #pricing)
  const resaDateInput = document.querySelector('.resa-form input[name="date"]');
  if (resaDateInput && val) resaDateInput.value = val;
}

function openGcalBooking(e) {
  e.preventDefault();
  if (!calSelectedDate) {
    alert(currentLang === 'en' ? 'Please select a date first.' : 'Veuillez d\'abord sélectionner une date dans le calendrier.');
    return false;
  }
  // Construire dates Google Calendar format YYYYMMDD
  const d = new Date(calSelectedDate + 'T09:00:00');
  const start = calSelectedDate.replace(/-/g, '') + 'T090000';
  const end   = calSelectedDate.replace(/-/g, '') + 'T170000';
  const title = encodeURIComponent('Sortie guidée Ardèche — Explora Guide');
  const details = encodeURIComponent('Réservation avec Pierre-François Passager, guide Ardèche (Explora Guide).\nTél : 07 48 16 98 03\nEmail : guide.ardeche.touriste@gmail.com');
  const location = encodeURIComponent('Ardèche, France');
  const guests = encodeURIComponent('guide.ardeche.touriste@gmail.com');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&add=${guests}`;
  window.open(url, '_blank');
  return false;
}

function goToFormWithDate(e) {
  e.preventDefault();
  if (!calSelectedDate) {
    alert(currentLang === 'en' ? 'Please select a date first.' : 'Veuillez d\'abord sélectionner une date dans le calendrier.');
    return false;
  }
  // Pré-remplir le champ date du formulaire de réservation
  const resaDateInput = document.querySelector('.resa-form input[name="date"]');
  if (resaDateInput) resaDateInput.value = calSelectedDate;
  // Scroll vers la section tarifs/formulaire
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
  return false;
}


function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('hamburger');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── ÉCO-BANNER ───
function closeEco() {
  const b = document.getElementById('eco-banner');
  b.style.display = 'none';
  document.getElementById('main-nav').style.top = '0';
  document.getElementById('main-nav').classList.add('eco-hidden');
}

// ─── FAVORIS ───
let favorites = [];
function toggleFav(btn, name) {
  const idx = favorites.indexOf(name);
  if (idx === -1) { favorites.push(name); btn.classList.add('saved'); btn.textContent = '♥'; }
  else { favorites.splice(idx,1); btn.classList.remove('saved'); btn.textContent = '♡'; }
  updateFavCount();
  updateFavPanel();
}
function updateFavCount() {
  document.getElementById('fav-count').textContent = favorites.length;
}
function updateFavPanel() {
  const el = document.getElementById('fav-content');
  if (favorites.length === 0) {
    el.innerHTML = currentLang === 'en' ? '<p class="fav-empty">Click ♡ on a place or route to save it here and plan your perfect Ardèche experience.</p>' : '<p class="fav-empty">Cliquez ♡ sur un lieu ou un circuit pour le sauvegarder ici et préparer votre Ardèche idéale.</p>';
  } else {
    el.innerHTML = '<div class="fav-list">' + favorites.map((f,i) =>
      `<div class="fav-list-item"><span class="fav-list-item-name">${f}</span><button class="fav-list-item-rm" onclick="removeFavByIndex(${i})">✕</button></div>`
    ).join('') + '</div>';
  }
}
function removeFavByIndex(i) {
  favorites.splice(i,1);
  updateFavCount();
  updateFavPanel();
}
function toggleFavPanel(e) {
  e.preventDefault();
  document.getElementById('fav-panel').classList.toggle('open');
}
function sendCarnet() {
  const ta = document.getElementById('carnet-textarea');
  const field = document.getElementById('carnet-field');
  if (favorites.length === 0) { alert(currentLang === 'en' ? 'No places saved yet.' : 'Aucun lieu sauvegardé pour l\'instant.'); return; }
  ta.value = favorites.join('\n');
  field.style.display = 'block';
  document.getElementById('fav-panel').classList.remove('open');
  document.getElementById('contact').scrollIntoView({behavior:'smooth'});
}

// ─── AGENDA TABS ───
function filterAgenda(cat, btn) {
  document.querySelectorAll('.agenda-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.agenda-item').forEach(item => {
    item.style.display = (cat === 'tous' || item.dataset.cat === cat) ? '' : 'none';
  });
}

// ─── NEWSLETTER ───
function submitNewsletter(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.newsletter-btn');
  btn.textContent = currentLang === 'en' ? '✓ Subscribed!' : '✓ Abonné !';
  btn.style.background = '#4a7558';
  setTimeout(() => { btn.textContent = currentLang === 'en' ? '→ Subscribe' : '→ S\'abonner'; btn.style.background = ''; e.target.reset(); }, 3000);
}

// ─── CARTE LEAFLET (uniquement si présente sur la page) ───
if (document.getElementById('trail-map')) {
const map = L.map('trail-map', { center: [44.55, 4.38], zoom: 10, zoomControl: true, attributionControl: true });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19 }).addTo(map);
const makeIcon = (color, size = 14) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid rgba(240,236,224,0.6);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.6);"></div>`,
  iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size]
});
const spots = [
  { lat:44.49,lng:4.36,color:'#d4a843',size:18,tag:'Circuit · 65 km · 4-5 jours',title:'Grand Tour des Villages de Caractère',desc:'Vogüé, Balazuc, Labeaume, Ruoms — ruelles pavées, châteaux médiévaux et falaises calcaires.',meta:'🥾 Niveau modéré · Départ : Vogüé' },
  { lat:44.85,lng:4.22,color:'#d4a843',size:18,tag:'Circuit · 50 km · 3 jours',title:'Haute-Route des Sucs et Volcans',desc:'Mont Gerbier-de-Jonc, Mont Mézenc, structures mystiques de Borée. Grands espaces sauvages.',meta:'🥾 Niveau sportif · Départ : Le Monastier' },
  { lat:44.40,lng:4.15,color:'#d4a843',size:18,tag:'Circuit · 42 km · 3 jours',title:'Traversée des Gorges & Canyons Secrets',desc:'Gorges du Chassezac, Bois de Païolive, village isolé de Thines.',meta:'🥾 Niveau sportif · Départ : Les Vans' },
  { lat:44.65,lng:4.26,color:'#d4a843',size:18,tag:'Circuit · 48 km · 3 jours',title:'Tour des Merveilles Cachées',desc:'Coulée basaltique de Jaujac, Pont du Diable à Thueyts, Meyras — Ardèche cévenole.',meta:'🥾 Niveau modéré · Départ : Thueyts' },
  { lat:44.33,lng:4.59,color:'#8aab90',size:12,tag:'Spéléologie · Secret',title:'Grotte de Saint-Marcel',desc:'Réseau souterrain de 55 km. Concrétions exceptionnelles.',meta:'⏱ 2h · Accès guide indispensable' },
  { lat:44.48,lng:4.05,color:'#8aab90',size:12,tag:'Patrimoine · Hors du temps',title:'Thines, village de schiste',desc:'Village médiéval accroché à une falaise, accessible uniquement à pied.',meta:'⏱ 3h A/R · Niveau modéré' },
  { lat:44.39,lng:4.18,color:'#8aab90',size:12,tag:'Forêt · Minéral',title:'Bois de Païolive',desc:'Labyrinthe de roches calcaires millénaires sous une forêt de chênes verts.',meta:'⏱ 2-4h · Toute l\'année' },
  { lat:44.82,lng:4.06,color:'#8aab90',size:12,tag:'Volcanisme · Rare',title:'Lac d\'Issarlès',desc:'Cratère volcanique rempli d\'eau d\'un bleu irréel à 1000m d\'altitude.',meta:'⏱ 1h30 · Baignade possible' },
  { lat:44.64,lng:4.25,color:'#c06040',size:14,tag:'Géologie · Spectaculaire',title:'Orgues basaltiques de Jaujac',desc:'Colonnes de basalte géantes figées il y a 10 000 ans.',meta:'⏱ 1h · Paysage martien' },
  { lat:44.65,lng:4.26,color:'#c06040',size:14,tag:'Légende · Basalte',title:'Pont du Diable, Thueyts',desc:'Arc naturel de basalte sculpté par la lave et l\'Ardèche.',meta:'⏱ 30 min · Photo incontournable' },
  { lat:44.38,lng:4.14,color:'#c06040',size:14,tag:'Canyon · Sauvage',title:'Gorges du Chassezac',desc:'Canyon d\'une sauvagerie rare — parois de grès rouge, eau émeraude.',meta:'⏱ Demi-journée · Niveau modéré' },
  { lat:44.70,lng:4.27,color:'#6a9275',size:12,tag:'Cascade · Secret',title:'Cascade de Ray-Pic',desc:'La plus belle cascade d\'Ardèche, tombant de 60m au cœur d\'un cirque volcanique.',meta:'⏱ 2h A/R · Meilleure en avril-mai' },
  { lat:44.36,lng:4.16,color:'#6a9275',size:12,tag:'Panorama · Exclusif',title:'Belvédère secret du Chassezac',desc:'Un point de vue que je suis le seul guide à montrer. Vue à 180° sur les gorges au coucher du soleil.',meta:'🌅 Meilleur en soirée · Accès piste' },
  { lat:44.70,lng:4.15,color:'#6a9275',size:12,tag:'Astronomie · Nuit',title:'Hauts Plateaux des Cévennes',desc:'Zone de réserve de ciel étoilé — parmi les meilleurs sites d\'observation d\'Europe.',meta:'🌌 Sorties nocturnes sur demande' },
  { lat:44.45,lng:4.34,color:'#d4708a',size:14,tag:'⭐ Festival · 25-27 juin',title:'Aluna Festival, Ruoms',desc:'Le festival incontournable de l\'été ardéchois, aux portes des gorges. 3 jours de musique.',meta:'🎵 Voir l\'agenda complet des fêtes & festivals',link:'agenda-ardeche.html' },
  { lat:44.45,lng:4.20,color:'#d4708a',size:14,tag:'⭐ Tradition · Oct-Nov',title:'Les Castagnades, Cévennes d\'Ardèche',desc:'La fête de la châtaigne dans les villages des Cévennes : grillades, artisans, musique et danses.',meta:'🌰 Voir l\'agenda complet des fêtes & festivals',link:'agenda-ardeche.html' },
];
spots.forEach(s => {
  const marker = L.marker([s.lat,s.lng],{icon:makeIcon(s.color,s.size)}).addTo(map);
  const metaHtml = s.link ? `<a href="${s.link}" class="map-popup-meta" style="text-decoration:underline;cursor:pointer;display:block">${s.meta}</a>` : `<div class="map-popup-meta">${s.meta}</div>`;
  marker.bindPopup(`<div class="map-popup-tag">${s.tag}</div><div class="map-popup-title">${s.title}</div><div class="map-popup-desc">${s.desc}</div>${metaHtml}`,{maxWidth:260,className:''});
});
}

// ─── REVEAL ON SCROLL ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e,i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i*80); } });
},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

// ─── NAV SCROLL ───
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  nav.classList.toggle('nav-scrolled', window.scrollY > 60);
});

// ─── SWITCH LANGUE FR/EN — TRADUCTION COMPLÈTE DE LA PAGE ───
let currentLang = 'fr';
function switchLang(lang) {
  currentLang = lang;
  const btnFr = document.getElementById('btn-fr');
  const btnEn = document.getElementById('btn-en');
  if (lang === 'en') {
    if(btnFr) { btnFr.style.background='none'; btnFr.style.borderColor='rgba(138,171,144,0.3)'; btnFr.style.color='#8aab90'; }
    if(btnEn) { btnEn.style.background='rgba(212,168,67,0.3)'; btnEn.style.borderColor='rgba(212,168,67,0.5)'; btnEn.style.color='#d4a843'; }
  } else {
    if(btnFr) { btnFr.style.background='rgba(212,168,67,0.3)'; btnFr.style.borderColor='rgba(212,168,67,0.5)'; btnFr.style.color='#d4a843'; }
    if(btnEn) { btnEn.style.background='none'; btnEn.style.borderColor='rgba(138,171,144,0.3)'; btnEn.style.color='#8aab90'; }
  }
  // Traduire tous les éléments ayant data-fr / data-en
  document.querySelectorAll('[data-fr]').forEach(el => {
    const txt = el.getAttribute('data-' + lang);
    if (txt !== null) el.innerHTML = txt;
  });
  // Attributs placeholder, aria-label, title
  document.querySelectorAll('[data-placeholder-fr]').forEach(el => {
    el.placeholder = el.getAttribute('data-placeholder-' + lang) || el.placeholder;
  });
  // Mettre à jour html lang
  document.documentElement.lang = lang;
}
