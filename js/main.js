/* ============================================================
   BEKZOD BAKHTIYOROV — PORTFOLIO JS
   Handles: loader, THREE.js canvas bg, nav, scroll effects,
            timeline reveals, chart.js charts, gauge animations,
            modal, contact form, cursor parallax
   ============================================================ */

// ─── LOADER ─────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('fade-out');
    initHeroAnim();
  }, 2200);
});

function initHeroAnim() {
  // 3D perspective tilt on hero photo following cursor direction
  const photo    = document.getElementById('hero-photo');
  const photoWrap = document.querySelector('.hero-photo-wrap');
  if (!photo) return;
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx * 7;   // ±7° horizontal
    const dy = (e.clientY - cy) / cy * 4;   // ±4° vertical
    photo.style.transform = `perspective(900px) rotateY(${dx}deg) rotateX(${-dy}deg) scale(1.02)`;
    if (photoWrap) {
      photoWrap.style.transform = `translate(${dx * 1.2}px, ${dy * 0.9}px)`;
    }
  });
}

// ─── THREE.JS PARTICLE BACKGROUND ───────────────────────────
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x070f1a, 1);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 50;

  // Particles
  const COUNT  = 1800;
  const geo    = new THREE.BufferGeometry();
  const pos    = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const palette = [
    new THREE.Color(0x0F3F6D),
    new THREE.Color(0x36454F),
    new THREE.Color(0xCBB26A),
    new THREE.Color(0x1a5a9a),
  ];

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 160;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Gentle connections as line segments
  const lineGeo    = new THREE.BufferGeometry();
  const linePos    = [];
  const CONN_COUNT = 120;
  for (let i = 0; i < CONN_COUNT; i++) {
    const idx = Math.floor(Math.random() * COUNT);
    const idx2 = Math.floor(Math.random() * COUNT);
    linePos.push(pos[idx*3], pos[idx*3+1], pos[idx*3+2]);
    linePos.push(pos[idx2*3], pos[idx2*3+1], pos[idx2*3+2]);
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x0F3F6D, transparent: true, opacity: 0.12 });
  const lines   = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // Mouse influence
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let frame = 0;
  (function animate() {
    requestAnimationFrame(animate);
    frame++;
    points.rotation.y += 0.00015;
    points.rotation.x += 0.00008;
    lines.rotation.y  += 0.00015;
    lines.rotation.x  += 0.00008;

    camera.position.x += (mouse.x - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Subtle oscillation
    points.position.y = Math.sin(frame * 0.003) * 1.5;

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ─── NAVBAR ─────────────────────────────────────────────────
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const btt = document.getElementById('back-to-top');

  // Scrolled style
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to top
  if (btt) {
    btt.classList.toggle('visible', window.scrollY > 500);
  }

  // Active link
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 150) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}, { passive: true });


// Mobile toggle
const toggle = document.getElementById('nav-toggle');
const navLinksEl = document.getElementById('nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
  });
}
navLinks.forEach(l => {
  l.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

// ─── SCROLL REVEAL ──────────────────────────────────────────
function revealOnScroll() {
  const triggers = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  triggers.forEach(el => io.observe(el));

  // Timeline items
  const timelineItems = document.querySelectorAll('.timeline-item[data-reveal]');
  const tio = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.classList.add('revealed');
        }, i * 150);
        tio.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  timelineItems.forEach(el => tio.observe(el));
}

// ─── STAT COUNTERS ──────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseFloat(el.getAttribute('data-target'));
      const isFloat = String(target).includes('.');
      let start = 0;
      const duration = 1500;
      const step = 16;
      const increment = target / (duration / step);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        el.textContent = isFloat ? start.toFixed(1) : Math.round(start);
      }, step);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));
}

// ─── LANGUAGE BARS + MOTIVATOR BARS ─────────────────────────
// triggered by .is-visible added by intersection observer

// ─── WEP RADAR CHART ────────────────────────────────────────
function initWEPChart() {
  const ctx = document.getElementById('wepChart');
  if (!ctx || !window.Chart) return;

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Chronemics\n(1.67)', 'Conflict\n(0.33)', 'Context\n(0.67)', 'Debate\n(2.00)', 'Decision\nMaking\n(0.67)', 'Feedback\n(2.33)', 'Hierarchy\n(2.00)', 'Relationships\n(2.33)'],
      datasets: [{
        label: 'Bekzod\'s WEP Scores',
        data: [1.67, 0.33, 0.67, 2.00, 0.67, 2.33, 2.00, 2.33],
        backgroundColor: 'rgba(203,178,106,0.15)',
        borderColor: '#CBB26A',
        borderWidth: 2.5,
        pointBackgroundColor: '#CBB26A',
        pointBorderColor: '#0d1e2f',
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0, max: 4,
          ticks: {
            stepSize: 1,
            color: 'rgba(158,175,194,0.5)',
            backdropColor: 'transparent',
            font: { size: 9 }
          },
          grid: { color: 'rgba(203,178,106,0.1)' },
          angleLines: { color: 'rgba(203,178,106,0.1)' },
          pointLabels: {
            color: '#9eafc2',
            font: { size: 10, family: "'Open Sans', sans-serif" },
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` Score: ${ctx.raw} / 4`,
          }
        }
      },
      animation: { duration: 1500, easing: 'easeInOutQuart' },
    }
  });
}

// ─── GAUGE ANIMATIONS ───────────────────────────────────────
function initGauges() {
  const gauges = document.querySelectorAll('.gauge-ring');
  const gio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const ring  = e.target;
      const val   = parseFloat(ring.dataset.value) / 100; // 0..1
      const color = ring.dataset.color;
      const fill  = ring.querySelector('.gauge-fill');
      if (!fill) return;
      const circumference = 2 * Math.PI * 50; // r=50
      fill.style.stroke = color;
      fill.style.strokeDasharray  = circumference;
      fill.style.strokeDashoffset = circumference * (1 - val);
      gio.unobserve(ring);
    });
  }, { threshold: 0.4 });
  gauges.forEach(g => gio.observe(g));
}

// ─── MODALS ─────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// ─── CONTACT FORM ────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('form-submit-btn');
  const success = document.getElementById('form-success');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate submission (mailto fallback)
  setTimeout(() => {
    const form = document.getElementById('contact-form');
    const name    = document.getElementById('cf-name').value;
    const email   = document.getElementById('cf-email').value;
    const subject = document.getElementById('cf-subject').value || 'Portfolio Contact';
    const message = document.getElementById('cf-message').value;

    const mailto = `mailto:bakhtiyorovb@arizona.edu?subject=${encodeURIComponent(subject + ' — from ' + name)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;
    window.location.href = mailto;

    form.reset();
    btn.textContent = 'Send Message ✉️';
    btn.disabled = false;
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 800);
}

// ─── SMOOTH SCROLL PROGRESS BAR ─────────────────────────────
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; z-index: 9998;
    background: linear-gradient(90deg, #0F3F6D, #CBB26A);
    width: 0%; transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(203,178,106,0.5);
  `;
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
})();

// ─── PRS ADJECTIVE BAR CHART ────────────────────────────────
function initPRSChart() {
  const ctx = document.getElementById('prsChart');
  if (!ctx || !window.Chart) return;

  const labels = ['Competitive', 'Outgoing', 'Curious', 'Easygoing', 'Growth-Oriented', 'Independent', 'Leaderlike', 'Problem-Solver', 'Self-Confident', 'Social'];
  const prsData = [4, 4, 3, 3, 3, 3, 3, 3, 3, 3];
  const selfData = [1, 0, 1, 0, 0, 0, 0, 1, 1, 0]; // from SPI adjective selection (1=selected)

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'PRS (Others\')',
          data: prsData,
          backgroundColor: 'rgba(203,178,106,0.75)',
          borderColor: '#CBB26A',
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'SPI (Self)',
          data: selfData,
          backgroundColor: 'rgba(15,63,109,0.7)',
          borderColor: '#1a5a9a',
          borderWidth: 1.5,
          borderRadius: 4,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: {
        x: {
          max: 5,
          ticks: { color: '#9eafc2', font: { size: 10 } },
          grid:  { color: 'rgba(255,255,255,0.05)' },
          border: { color: 'rgba(255,255,255,0.08)' }
        },
        y: {
          ticks: { color: '#e8edf2', font: { size: 11, family: "'Open Sans', sans-serif" } },
          grid:  { display: false },
          border: { color: 'rgba(255,255,255,0.08)' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#9eafc2', font: { size: 11 }, usePointStyle: true, pointStyle: 'rect' }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw === 1 ? 'Selected' : ctx.raw + ' mentions'}`
          }
        }
      },
      animation: { duration: 1200, easing: 'easeInOutQuart' },
    }
  });
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  initCounters();
  initWEPChart();
  initGauges();
  initPRSChart();
});
