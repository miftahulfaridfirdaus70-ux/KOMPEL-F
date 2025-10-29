// =====================================================
// KOM.JS — Efek Futuristik + Animasi Scroll + Partikel + Audio
// =====================================================

// === FUNGSI SMOOTH SCROLL KE SECTION ===
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// === EFEK HEADER SAAT SCROLL ===
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.style.background = 'rgba(0, 0, 40, 0.85)';
    header.style.boxShadow = '0 0 25px rgba(0, 255, 255, 0.3)';
  } else {
    header.style.background = 'rgba(20, 20, 40, 0.5)';
    header.style.boxShadow = 'none';
  }
});

// === ANIMASI MUNCUL SAAT SCROLL (FADE-IN + GLOW) ===
const sections = document.querySelectorAll('section, .card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.2 });

sections.forEach(sec => observer.observe(sec));

// =====================================================
// === EFEK PARTIKEL NEON FUTURISTIK INTERAKTIF ===
// =====================================================

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.querySelector('.hero').appendChild(canvas);

canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = 0;
canvas.width = innerWidth;
canvas.height = innerHeight;

// Objek partikel
let particles = [];
const numParticles = 60;

// Buat partikel acak
for (let i = 0; i < numParticles; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    color: '#00ffff',
    speedX: (Math.random() - 0.5) * 0.6,
    speedY: (Math.random() - 0.5) * 0.6
  });
}

// === TRANSISI WARNA NEON GRADUAL ===
const neonColors = ['#00ffff', '#ff00ff', '#00ffcc', '#ff66ff', '#66ffff', '#cc00ff'];
let colorIndex = 0;
let nextColorIndex = 1;
let transitionProgress = 0;
const transitionSpeed = 0.01;

// Fungsi mencampur warna (gradasi halus)
function blendColors(color1, color2, factor) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

// Objek mouse
let mouse = { x: undefined, y: undefined, radius: 100 };

window.addEventListener('mousemove', (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});
window.addEventListener('mouseleave', () => {
  mouse.x = undefined;
  mouse.y = undefined;
});

// === ANIMASI PARTIKEL FUTURISTIK ===
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update transisi warna
  transitionProgress += transitionSpeed;
  if (transitionProgress >= 1) {
    transitionProgress = 0;
    colorIndex = nextColorIndex;
    nextColorIndex = (nextColorIndex + 1) % neonColors.length;
  }
  const currentColor = blendColors(neonColors[colorIndex], neonColors[nextColorIndex], transitionProgress);

  particles.forEach(p => {
    // Gerak dasar
    p.x += p.speedX;
    p.y += p.speedY;

    // Pantulan halus
    if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

    // Interaksi mouse
    if (mouse.x && mouse.y) {
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        let angle = Math.atan2(dy, dx);
        let force = (mouse.radius - distance) / mouse.radius;
        p.x -= Math.cos(angle) * force * 5;
        p.y -= Math.sin(angle) * force * 5;
      }
    }

    // Gambar partikel neon gradasi
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
    gradient.addColorStop(0, currentColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}
animateParticles();

// === RESPONSIF: Sesuaikan ukuran canvas ===
window.addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

// =====================================================
// === SUARA AMBIENT FUTURISTIK SINEMATIK (FADE IN/OUT) ===
// =====================================================
let ambientAudio = new Audio('sounds/futuristic_ambient.mp3');
ambientAudio.loop = true;
ambientAudio.volume = 0;

const hero = document.querySelector('.hero');
let fadeInterval;

hero.addEventListener('mouseenter', () => {
  ambientAudio.play().then(() => {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      if (ambientAudio.volume < 0.15) {
        ambientAudio.volume += 0.01;
      } else {
        clearInterval(fadeInterval);
      }
    }, 150);
  });
});

hero.addEventListener('mouseleave', () => {
  clearInterval(fadeInterval);
  fadeInterval = setInterval(() => {
    if (ambientAudio.volume > 0) {
      ambientAudio.volume -= 0.01;
    } else {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      clearInterval(fadeInterval);
    }
  }, 150);
});
