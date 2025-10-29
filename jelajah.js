/* ===========================================================
   jelajahi.js — Final PRO (Particles + CRUD + LocalStorage +
   Search/Filter + Export CSV/PDF + Admin Login)
   Password admin default: "admin123"
   =========================================================== */

/* =========================
   Helper: DOM shortcuts
   ========================= */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* =========================
   Smooth scroll & Fade-in observer
   ========================= */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

window.addEventListener('load', () => {
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

/* =========================
   Canvas Particles (Futuristic)
   - interactive with mouse
   - click burst
   - subtle trails
   ========================= */
const canvas = $('#particles');
const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

let W = window.innerWidth;
let H = window.innerHeight;

if (!canvas || !ctx) {
  console.warn('Canvas or context not found. Particles will be disabled.');
} else {
  canvas.width = W;
  canvas.height = H;
}

let particles = [];
let trails = [];
const NUM_PARTICLES = 100;
const MAX_TRAILS = 30;
const mouse = { x: undefined, y: undefined, radius: 140 };
let hueBase = 200; // starting hue for aurora-like colors

function rand(min, max) { return Math.random() * (max - min) + min; }

function initParticles() {
  if (!ctx) return;
  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      hue: Math.random() * 60 + 180,
      opacity: Math.random() * 0.8 + 0.2
    });
  }
}

function drawParticles() {
  if (!ctx) return;
  // Draw semi-transparent rect to create trail effect
  ctx.fillStyle = 'rgba(0,0,12,0.22)';
  ctx.fillRect(0, 0, W, H);

  hueBase += 0.15;

  // particles
  particles.forEach(p => {
    // movement
    p.x += p.vx;
    p.y += p.vy;

    // bounce edges
    if (p.x <= 0 || p.x >= W) p.vx *= -1;
    if (p.y <= 0 || p.y >= H) p.vy *= -1;

    // mouse repulsion
    if (mouse.x !== undefined) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        const angle = Math.atan2(dy, dx);
        const force = (mouse.radius - dist) / mouse.radius;
        p.x += Math.cos(angle) * force * 2.5;
        p.y += Math.sin(angle) * force * 2.5;
      }
    }

    // draw
    const h = (p.hue + hueBase) % 360;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${h},100%,60%, ${p.opacity})`;
    ctx.shadowColor = `hsla(${h},100%,70%,1)`;
    ctx.shadowBlur = 14;
    ctx.fill();
  });

  // connect close particles
  connectParticles();

  // trails (mouse)
  drawTrails();
}

function connectParticles() {
  if (!ctx) return;
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const alpha = 1 - dist / 100;
        const hueBlend = ((particles[a].hue + particles[b].hue) / 2 + hueBase) % 360;
        ctx.strokeStyle = `hsla(${hueBlend},100%,70%,${alpha * 0.12})`;
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function drawTrails() {
  if (!ctx) return;
  for (let i = trails.length - 1; i >= 0; i--) {
    const t = trails[i];
    const hue = (hueBase + i * 8) % 360;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},100%,70%, ${t.opacity})`;
    ctx.shadowColor = `hsla(${hue},100%,70%,1)`;
    ctx.shadowBlur = 18;
    ctx.fill();
    t.opacity -= 0.03;
    t.size += 0.4;
    if (t.opacity <= 0) trails.splice(i, 1);
  }
}

function animateLoop() {
  if (!ctx) return;
  drawParticles();
  requestAnimationFrame(animateLoop);
}

// mouse events
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  trails.push({ x: e.clientX, y: e.clientY, size: 2, opacity: 1 });
  if (trails.length > MAX_TRAILS) trails.shift();
});

window.addEventListener('mouseout', () => {
  mouse.x = undefined;
  mouse.y = undefined;
});

canvas && canvas.addEventListener('click', e => {
  // small burst
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      hue: Math.random() * 60 + 180,
      opacity: 1
    });
  }
  // limit total particles for performance
  if (particles.length > 300) particles.splice(0, particles.length - 200);
});

window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  if (canvas) {
    canvas.width = W;
    canvas.height = H;
  }
  // re-init or keep existing particles: keep for smoother UX
});

/* Initialize particles */
initParticles();
animateLoop();

/* =========================
   CRUD Anggota + LocalStorage
   + Edit, Delete, Render with indices safe under filtering
   ========================= */

/* DOM elements (some may be hidden until admin login) */
const loginBtn = $('#loginBtn');
const loginPopup = $('#loginPopup');
const closeLogin = $('#closeLogin');
const submitLogin = $('#submitLogin');
const adminPasswordInput = $('#adminPassword');

const adminTools = $('#adminTools');
const formAnggota = $('#formAnggota'); // may be null until adminTools visible in DOM
const anggotaListEl = $('#anggotaList');

const searchInput = $('#searchInput');
const filterSelect = $('#filterSelect');
const exportExcelBtn = $('#exportExcel');
const exportPdfBtn = $('#exportPdf');

let isAdmin = false;
let editIndex = null; // index in storage array for edit

/* LocalStorage helpers */
const STORAGE_KEY = 'anggotaTechUnity_v1';

function loadAnggota() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnggota(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* Render anggota function:
   - When filtering, we need stable reference to original indices.
   - So we iterate storage array, collect matching indices, and render those using their original index.
*/
function renderAnggota(filterText = '', jabatanFilter = 'semua') {
  const data = loadAnggota();
  anggotaListEl.innerHTML = '';

  const matches = [];
  data.forEach((item, idx) => {
    const matchNama = item.nama.toLowerCase().includes(filterText.toLowerCase());
    const matchJabatan = jabatanFilter === 'semua' || item.jabatan === jabatanFilter;
    if (matchNama && matchJabatan) matches.push({ item, idx });
  });

  if (matches.length === 0) {
    const p = document.createElement('p');
    p.style.opacity = '0.7';
    p.textContent = 'Belum ada anggota yang sesuai.';
    anggotaListEl.appendChild(p);
    return;
  }

  matches.forEach(({ item, idx }) => {
    const card = document.createElement('div');
    card.className = 'anggota-card';
    const fotoSrc = item.foto || fallbackAvatarDataUrl(item.nama);
    card.innerHTML = `
      <img src="${fotoSrc}" alt="${escapeHtml(item.nama)}" />
      <h3>${escapeHtml(item.nama)}</h3>
      <p>${escapeHtml(item.jabatan)}</p>
      <div class="btn-group">
        ${isAdmin ? `<button class="edit-btn" data-index="${idx}">Edit</button>
        <button class="hapus-btn" data-index="${idx}">Hapus</button>` : ''}
      </div>
    `;
    anggotaListEl.appendChild(card);
  });
}

/* Fallback avatar generator (simple colored block with initials) */
function fallbackAvatarDataUrl(name) {
  const initials = (name.split(' ').map(n => n[0] || '').slice(0,2).join('') || 'TU').toUpperCase();
  // small canvas draw
  const c = document.createElement('canvas');
  c.width = 400; c.height = 400;
  const g = c.getContext('2d');
  g.fillStyle = '#0b1220';
  g.fillRect(0,0,c.width,c.height);
  g.fillStyle = '#00e0ff';
  g.font = 'bold 160px Poppins, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(initials, c.width/2, c.height/2 + 10);
  return c.toDataURL();
}

/* Simple HTML escape to avoid small injection in rendered text */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
  });
}

/* Initialize UI state on load */
function initialRender() {
  // Render visible list for everyone (no search/filter unless admin tools displayed)
  renderAnggota();
}
initialRender();

/* =========================
   Admin Login Flow
   - password is checked client-side (not secure for real apps)
   - on success: adminTools shown, loginBtn becomes Logout
   - store session in sessionStorage to persist until tab closed
   ========================= */
/* =========================
   GANTI PASSWORD ADMIN
   ========================= */
const changePassBtn = $('#changePassBtn');
const changePassPopup = $('#changePassPopup');
const closeChangePass = $('#closeChangePass');
const submitChangePass = $('#submitChangePass');
const oldPassword = $('#oldPassword');
const newPassword = $('#newPassword');

// Ambil password admin tersimpan (jika ada)
function getStoredAdminPassword() {
  return localStorage.getItem('adminPasswordTechUnity') || 'admin123';
}

// Simpan password baru
function setStoredAdminPassword(pwd) {
  localStorage.setItem('adminPasswordTechUnity', pwd);
}

// Modifikasi sedikit fungsi login agar pakai password tersimpan
if (submitLogin) submitLogin.addEventListener('click', () => {
  const pass = adminPasswordInput ? adminPasswordInput.value : '';
  const currentPass = getStoredAdminPassword();
  if (pass === currentPass) {
    setAdminMode(true);
    if (loginPopup) loginPopup.style.display = 'none';
    if (adminPasswordInput) adminPasswordInput.value = '';
    alert('Login berhasil. Mode Admin aktif.');
  } else {
    alert('Password salah.');
  }
});

// Tombol tampilkan popup ganti password
if (changePassBtn) changePassBtn.addEventListener('click', () => {
  if (!isAdmin) return alert('Harus login sebagai admin.');
  changePassPopup.style.display = 'flex';
});

// Tutup popup
if (closeChangePass) closeChangePass.addEventListener('click', () => {
  changePassPopup.style.display = 'none';
  oldPassword.value = '';
  newPassword.value = '';
});

// Simpan password baru
if (submitChangePass) submitChangePass.addEventListener('click', () => {
  const oldPass = oldPassword.value;
  const newPass = newPassword.value;
  const stored = getStoredAdminPassword();

  if (oldPass !== stored) {
    alert('Password lama salah!');
    return;
  }
  if (newPass.length < 5) {
    alert('Password baru minimal 5 karakter.');
    return;
  }

  setStoredAdminPassword(newPass);
  changePassPopup.style.display = 'none';
  oldPassword.value = '';
  newPassword.value = '';
  alert('Password berhasil diubah. Silakan login ulang.');
  setAdminMode(false); // logout otomatis
});
const ADMIN_PASSWORD = '240506';

// helpers to toggle admin UI
function setAdminMode(on) {
  isAdmin = !!on;
  if (isAdmin) {
    sessionStorage.setItem('isAdminTechUnity', '1');
    if (adminTools) adminTools.classList.remove('hidden');
    if (loginBtn) loginBtn.textContent = 'Logout Admin';
  } else {
    sessionStorage.removeItem('isAdminTechUnity');
    if (adminTools) adminTools.classList.add('hidden');
    if (loginBtn) loginBtn.textContent = 'Login Admin';
    editIndex = null;
    if (formAnggota) formAnggota.reset();
    if (formAnggota) {
      const btn = formAnggota.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Tambah Anggota';
    }
  }
  // re-render to update edit/hapus visibility
  renderAnggota(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'semua');
}

// check session on load
if (sessionStorage.getItem('isAdminTechUnity')) {
  setAdminMode(true);
} else {
  setAdminMode(false);
}

/* Login button opens popup */
if (loginBtn) loginBtn.addEventListener('click', () => {
  if (isAdmin) {
    // Logout
    if (confirm('Keluar dari mode admin?')) setAdminMode(false);
    return;
  }
  if (loginPopup) loginPopup.style.display = 'flex';
});

/* Close popup */
if (closeLogin) closeLogin.addEventListener('click', () => {
  if (loginPopup) loginPopup.style.display = 'none';
});

/* Submit login */
if (submitLogin) submitLogin.addEventListener('click', () => {
  const pass = adminPasswordInput ? adminPasswordInput.value : '';
  if (pass === ADMIN_PASSWORD) {
    setAdminMode(true);
    if (loginPopup) loginPopup.style.display = 'none';
    if (adminPasswordInput) adminPasswordInput.value = '';
    alert('Login berhasil. Mode Admin aktif.');
  } else {
    alert('Password salah.');
  }
});

/* Close popup when clicking outside content */
if (loginPopup) loginPopup.addEventListener('click', (e) => {
  if (e.target === loginPopup) loginPopup.style.display = 'none';
});

/* =========================
   Form submit (Add / Save Edit)
   ========================= */
if (formAnggota) {
  formAnggota.addEventListener('submit', e => {
    e.preventDefault();
    const nama = $('#nama').value.trim();
    const jabatan = $('#jabatan').value.trim();
    const fotoFile = $('#foto').files && $('#foto').files[0];

    if (!nama || !jabatan) {
      alert('Lengkapi nama dan jabatan.');
      return;
    }

    const data = loadAnggota();

    // If editIndex is set => update existing
    if (editIndex !== null && typeof editIndex !== 'undefined') {
      if (fotoFile) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          data[editIndex].foto = ev.target.result;
          data[editIndex].nama = nama;
          data[editIndex].jabatan = jabatan;
          saveAnggota(data);
          renderAnggota(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'semua');
        };
        reader.readAsDataURL(fotoFile);
      } else {
        data[editIndex].nama = nama;
        data[editIndex].jabatan = jabatan;
        saveAnggota(data);
        renderAnggota(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'semua');
      }
      editIndex = null;
      formAnggota.reset();
      const btn = formAnggota.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Tambah Anggota';
      return;
    }

    // else add new
    if (fotoFile) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const newMember = { nama, jabatan, foto: ev.target.result };
        data.push(newMember);
        saveAnggota(data);
        renderAnggota(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'semua');
      };
      reader.readAsDataURL(fotoFile);
      formAnggota.reset();
    } else {
      alert('Masukkan foto anggota.');
    }
  });
}

/* =========================
   Delegated click handlers on anggota list (Edit / Delete)
   ========================= */
if (anggotaListEl) {
  anggotaListEl.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('edit-btn')) {
      const idx = Number(target.dataset.index);
      const data = loadAnggota();
      if (!data[idx]) return alert('Data tidak ditemukan.');
      // populate form
      $('#nama').value = data[idx].nama;
      $('#jabatan').value = data[idx].jabatan;
      // note: file inputs cannot be set programmatically for security. User can optionally upload new photo.
      const btn = formAnggota.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Simpan Perubahan';
      editIndex = idx;
      // scroll to form
      scrollToSection('anggota');
    }

    if (target.classList.contains('hapus-btn')) {
      const idx = Number(target.dataset.index);
      const data = loadAnggota();
      if (!data[idx]) return alert('Data tidak ditemukan.');
      if (confirm(`Hapus anggota "${data[idx].nama}"?`)) {
        data.splice(idx, 1);
        saveAnggota(data);
        renderAnggota(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'semua');
      }
    }
  });
}

/* =========================
   Search & Filter (works even if admin tools hidden; only admin can see controls)
   ========================= */
if (searchInput) {
  searchInput.addEventListener('input', () => {
    renderAnggota(searchInput.value, filterSelect ? filterSelect.value : 'semua');
  });
}
if (filterSelect) {
  filterSelect.addEventListener('change', () => {
    renderAnggota(searchInput ? searchInput.value : '', filterSelect.value);
  });
}

/* =========================
   Export: CSV (Excel) & PDF (print)
   - CSV will contain Nama, Jabatan
   - PDF opens print window with simple table
   ========================= */
if (exportExcelBtn) {
  exportExcelBtn.addEventListener('click', () => {
    const data = loadAnggota();
    if (!data.length) return alert('Tidak ada data untuk diekspor.');
    let csv = 'Nama,Jabatan\n';
    data.forEach(d => {
      // escape comma by wrapping with quotes if necessary
      const nama = d.nama.includes(',') ? `"${d.nama.replace(/"/g, '""')}"` : d.nama;
      const jab = d.jabatan.includes(',') ? `"${d.jabatan.replace(/"/g, '""')}"` : d.jabatan;
      csv += `${nama},${jab}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Anggota_TechUnity_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', () => {
    const data = loadAnggota();
    if (!data.length) return alert('Tidak ada data untuk diekspor.');
    // build simple HTML
    let rows = '';
    data.forEach(d => {
      rows += `<tr><td style="padding:8px;border:1px solid #ccc;">${escapeHtml(d.nama)}</td>
                   <td style="padding:8px;border:1px solid #ccc;">${escapeHtml(d.jabatan)}</td></tr>`;
    });
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return alert('Pop-up diblokir. Izinkan pop-up untuk mencetak PDF.');
    win.document.write(`
      <html>
        <head>
          <title>Data Anggota TechUnity</title>
        </head>
        <body style="font-family:sans-serif;">
          <h2>Data Anggota TechUnity</h2>
          <table style="border-collapse:collapse;width:100%;">
            <thead>
              <tr><th style="padding:8px;border:1px solid #ccc;background:#eee;">Nama</th>
                  <th style="padding:8px;border:1px solid #ccc;background:#eee;">Jabatan</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>window.onload = function(){ setTimeout(()=>{ window.print(); },200); }</script>
        </body>
      </html>
    `);
    win.document.close();
  });
}

/* =========================
   Utility: ensure adminTools exist & wire default elements
   ========================= */
function safeQuerySelectors() {
  // If references are missing (because adminTools hidden or HTML changed), try to re-query
  // We already have main handles at top; this function is here in case you want to call later.
}

/* =========================
   Final: render initial list (public view)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  // ensure canvas size correct
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  // If admin session exists we set admin mode
  if (sessionStorage.getItem('isAdminTechUnity')) setAdminMode(true);
  initialRender();
});
