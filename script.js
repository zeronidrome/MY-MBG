let globe, scene, camera, renderer, globeGroup, wireframe, particles;
let mapMini, mapDashboard;
let state = { 
    role: null, sidebar: true, zoomed: false, 
    employees: ["Budi", "Siti", "Agus"], 
    selectedGizi: "Dr. Anisa (Pusat)",
    schoolName: "Sekolah Default", 
    sppgName: "SPPG 1 (Pusat)",
    news: [
        {title: "Distribusi MBG Sukses 99%", img: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400", desc: "Sistem transparansi sukses menekan angka gizi buruk."},
        {title: "Audit Keuangan: 0% Kecurangan", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400", desc: "Data Master mendeteksi tidak ada manipulasi dana."}
    ]
};

// --- GIMMICK WEB JELEK ---
function fakeLogin() { alert("ERROR 503: DANA SEDANG DI-AUDIT. Silakan hubungi RT setempat."); }

// --- TRANSISI GARUDA ---
function startReveal() {
    const overlay = document.getElementById('garuda-overlay');
    overlay.classList.remove('hidden-overlay');
    setTimeout(() => {
        document.getElementById('ugly-web').style.display = 'none';
        document.getElementById('good-web').classList.remove('hidden');
        initGlobe();
        renderNews();
    }, 100);
    setTimeout(() => overlay.classList.add('active'), 200);
    setTimeout(() => { 
        overlay.style.display = 'none'; 
        initMapMini(); 
        renderPetinggi(); 
    }, 2800);
}

// --- TAB NAVIGATION LOGIC ---
function showDashboardTab() {
    document.getElementById('tab-account').classList.add('hidden');
    document.getElementById('tab-dashboard').classList.remove('hidden');
    if(renderer) {
        const container = document.getElementById('globe-container');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

function showAccountTab() {
    if(!state.role) return;
    document.getElementById('tab-dashboard').classList.add('hidden');
    document.getElementById('tab-account').classList.remove('hidden');
    if(mapDashboard) setTimeout(() => mapDashboard.invalidateSize(), 100);
}

function toggleSidebar() {
    state.sidebar = !state.sidebar;
    document.getElementById('sidebar').classList.toggle('sidebar-collapsed');
    setTimeout(() => {
        if(mapMini) mapMini.invalidateSize();
        if(mapDashboard) mapDashboard.invalidateSize();
        if(renderer && !document.getElementById('tab-dashboard').classList.contains('hidden')) {
            const container = document.getElementById('globe-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }, 350);
}

// --- GLOBE HOLOGRAM HITAM PUTIH ---
function initGlobe() {
    const container = document.getElementById('globe-container');
    container.innerHTML = '';
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    globeGroup = new THREE.Group();
    const geometry = new THREE.SphereGeometry(5, 40, 40);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    const wireGeo = new THREE.SphereGeometry(5.02, 30, 30);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.2 });
    wireframe = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireframe);

    scene.add(globeGroup);

    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 250;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 18; }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, transparent: true, opacity: 0.9 });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    camera.position.z = 15;

    function animate() {
        requestAnimationFrame(animate);
        if(!state.zoomed) globeGroup.rotation.y += 0.002;
        particles.rotation.y += 0.001; 
        particles.rotation.x += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
}

function triggerBlinkAndSwitch() {
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('flash-bang');
    
    setTimeout(() => {
        showAccountTab();
        document.getElementById('btn-back-account').classList.remove('hidden');
        renderAccountContent();
    }, 400);

    setTimeout(() => { flash.classList.remove('flash-bang'); }, 850);
}

function zoomGlobeThenSwitch() {
    showDashboardTab();
    state.zoomed = true;
    globeGroup.rotation.set(-0.2, 1.6, 0); 
    let zoom = setInterval(() => {
        if(camera.position.z > 8.5) {
            camera.position.z -= 0.1;
            wireframe.material.opacity += 0.02; 
        } else {
            clearInterval(zoom);
            triggerBlinkAndSwitch();
        }
    }, 16);
}

// --- LOGIKA LOGIN PANAH ---
function openLoginModal() { 
    document.getElementById('login-modal').classList.remove('hidden'); 
    setTimeout(() => document.getElementById('login-type').focus(), 100);
}
function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }
function toggleRegFields() {
    const type = document.getElementById('login-type').value;
    document.getElementById('reg-fields').style.display = type === 'register' ? 'block' : 'none';
}

document.addEventListener('keydown', function(e) {
    if (!document.getElementById('login-modal').classList.contains('hidden')) {
        const inputs = Array.from(document.querySelectorAll('.nav-input')).filter(el => el.offsetParent !== null);
        const active = document.activeElement;
        const idx = inputs.indexOf(active);
        
        if (idx > -1) {
            if (e.key === 'ArrowDown') { e.preventDefault(); if (idx < inputs.length - 1) inputs[idx + 1].focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) inputs[idx - 1].focus(); }
            else if (e.key === 'Enter') { e.preventDefault(); if (idx < inputs.length - 1) inputs[idx + 1].focus(); else handleAppAuth(); }
        }
    }
});

function handleAppAuth() {
    const email = document.getElementById('app-email').value;
    const type = document.getElementById('login-type').value;

    if(type === 'register') {
        state.role = 'school';
        state.schoolName = document.getElementById('reg-school').value || "Sekolah Baru";
        state.sppgName = document.getElementById('reg-sppg').value;
    } else {
        if(email.includes('master')) state.role = 'master';
        else if(email.includes('owner')) state.role = 'owner';
        else state.role = 'school';
    }
    
    closeLoginModal();
    document.getElementById('user-role-badge').innerText = state.role.toUpperCase();
    document.getElementById('user-role-badge').classList.remove('hidden');
    document.getElementById('btn-login-portal').innerText = 'LOGOUT';
    document.getElementById('btn-login-portal').onclick = () => location.reload();

    if(state.role === 'owner') zoomGlobeThenSwitch();
    else triggerBlinkAndSwitch();
}

function renderAccountContent() {
    const container = document.getElementById('account-content');
    let html = '';

    if (state.role === 'master') {
        html = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="col-span-2 bg-white p-6 rounded-2xl shadow border border-gray-100 flex flex-col justify-center">
                    <h4 class="font-bold mb-4 text-gray-500 uppercase text-xs tracking-widest border-b pb-2">Status Pengiriman & Penerimaan</h4>
                    <div class="mb-4">
                        <div class="flex justify-between text-xs font-bold mb-1"><span>Pengiriman SPPG</span><span>95%</span></div>
                        <div class="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner"><div class="h-full bg-blue-500" style="width: 95%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-xs font-bold mb-1"><span>Penerimaan Sekolah</span><span>82%</span></div>
                        <div class="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner"><div class="h-full bg-green-500" style="width: 82%"></div></div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow border border-gray-100">
                    <h4 class="font-bold mb-2 text-gray-800 text-sm">Peta Persebaran SPPG</h4>
                    <div id="map-dashboard" class="h-40 w-full rounded-xl z-0"></div>
                </div>
                <div class="col-span-3 bg-white p-6 rounded-2xl shadow border border-gray-100">
                    <h4 class="font-bold text-gray-800 border-b pb-2 mb-4">Database Pegawai Seluruh SPPG</h4>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div class="p-3 bg-gray-50 rounded-lg"><b>Budi</b> - SPPG 1</div>
                        <div class="p-3 bg-gray-50 rounded-lg"><b>Siti</b> - SPPG 2</div>
                        <div class="p-3 bg-gray-50 rounded-lg"><b>Agus</b> - SPPG 1</div>
                    </div>
                </div>
            </div>
        `;
    } else if (state.role === 'owner') {
        html = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                    <h4 class="font-bold mb-6 text-blue-600 border-b pb-2">Rekomendasi Menu Spesialis</h4>
                    <div class="flex flex-col md:flex-row gap-6 items-start">
                        <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400" class="w-full md:w-48 h-40 rounded-2xl object-cover shadow-md hover:scale-105 transition">
                        <div class="flex-1">
                            <h5 class="font-bold text-xl text-gray-800">Protein Tinggi: Ayam Fillet & Sayuran</h5>
                            <p class="text-sm text-gray-500 mt-2">Sesuai standar nasional MBG untuk meningkatkan konsentrasi.</p>
                            <div class="mt-4 p-3 bg-blue-50 rounded-xl">
                                <label class="text-[10px] font-bold text-gray-500 uppercase">Pilih Ahli Gizi Anda:</label>
                                <select class="w-full mt-1 p-2 border rounded text-xs font-bold text-gray-700 bg-white" onchange="changeGizi(this.value)">
                                    <option value="Dr. Anisa (Pusat)">Dr. Anisa (Pusat)</option>
                                    <option value="Dr. Budi (Lokal)">Dr. Budi (Lokal)</option>
                                </select>
                                <div class="mt-2 flex items-center gap-2">
                                    <img src="https://ui-avatars.com/api/?name=Dr&background=0056b3&color=fff" class="w-8 h-8 rounded-full border border-blue-200">
                                    <span class="text-xs font-bold text-blue-800" id="gizi-selected">${state.selectedGizi}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-6">
                    <div class="bg-white p-4 rounded-3xl shadow-lg border border-gray-100">
                        <h4 class="font-bold text-gray-800 text-sm mb-2">Peta Pengantaran SPPG</h4>
                        <div id="map-dashboard" class="h-32 w-full rounded-xl z-0"></div>
                    </div>
                    <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-1">
                        <div class="flex justify-between items-center mb-4 border-b pb-2">
                            <h4 class="font-bold text-gray-800">Pegawai Anda</h4>
                            <button onclick="addEmp()" class="bg-green-500 text-white w-7 h-7 rounded-full">+</button>
                        </div>
                        <ul class="text-sm space-y-2 h-24 overflow-y-auto scrollbar-hide">
                            ${state.employees.map(e => `
                                <li class="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span class="font-medium text-gray-700">• ${e}</span>
                                    <button onclick="remEmp('${e}')" class="text-red-500 text-[10px] border border-red-500 px-2 rounded">X</button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else {
        html = `
            <div class="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
                <h3 class="font-bold text-xl mb-1 text-gray-800">${state.schoolName}</h3>
                <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Terdaftar di: ${state.sppgName}</p>
                <h4 class="font-bold mb-2">Lacak Perjalanan MBG Menuju Sekolah</h4>
                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4"><div class="h-full bg-blue-500" style="width: 60%"></div></div>
                <p class="text-sm text-gray-600 mb-4">Status: Kurir sedang di jalan. Estimasi tiba 15 menit lagi.</p>
                <button class="bg-[#0056b3] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow transition w-full md:w-auto">Konfirmasi MBG Diterima</button>
            </div>
        `;
    }
    container.innerHTML = html;

    setTimeout(() => {
        const dMap = document.getElementById('map-dashboard');
        if(dMap) {
            if(mapDashboard) mapDashboard.remove();
            mapDashboard = L.map('map-dashboard', {zoomControl: false}).setView([-2.99, 104.75], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapDashboard);
            if(state.role === 'master') {
                L.marker([-2.99, 104.75]).addTo(mapDashboard);
                L.marker([-2.95, 104.78]).addTo(mapDashboard);
            } else if(state.role === 'owner') {
                L.marker([-2.99, 104.75]).addTo(mapDashboard).bindPopup("SPPG Anda").openPopup();
            }
            setTimeout(() => mapDashboard.invalidateSize(), 200);
        }
    }, 300);
}

function addEmp() { let n = prompt("Nama Pegawai:"); if(n){state.employees.push(n); renderAccountContent();}}
function remEmp(n) { state.employees = state.employees.filter(e => e !== n); renderAccountContent();}
function changeGizi(val) { state.selectedGizi = val; document.getElementById('gizi-selected').innerText = val; }

// --- BERITA ---
function renderNews() {
    const list = document.getElementById('news-list');
    list.innerHTML = state.news.map(n => `
        <article class="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
            <img src="${n.img}" class="w-full md:w-32 h-24 object-cover rounded-lg shadow-sm">
            <div><h4 class="font-bold text-[#0056b3] text-lg">${n.title}</h4><p class="text-xs text-gray-500 mt-1">${n.desc}</p></div>
        </article>
    `).join('');
}
function toggleNewsForm() { document.getElementById('news-form-container').classList.toggle('hidden'); }
function submitNews() {
    const title = document.getElementById('news-title').value;
    const img = document.getElementById('news-img').value || "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400";
    const desc = document.getElementById('news-desc').value;
    if(title && desc) { state.news.unshift({title, img, desc}); renderNews(); toggleNewsForm(); }
}

// --- CHATBOT PINTAR DENGAN JAWABAN ACAK ---
function toggleChat() { document.getElementById('wa-card').classList.toggle('hidden'); }
function sendChat() {
    const input = document.getElementById('chat-input');
    const val = input.value.trim();
    if(!val) return;
    
    const box = document.getElementById('chat-box');
    
    // Pesan dari User
    box.innerHTML += `<div class="wa-bubble-out p-3 text-xs">${val}</div>`;
    input.value = '';
    box.scrollTop = box.scrollHeight;

    // Bot merespons dengan jawaban acak
    setTimeout(() => {
        const randomReplies = [
            "Malas Menanggapi.",
            "Aja Sendiri.",
            "YMMA (Yang Mbg Mbg Aja)",
            "Yo Ndak Tau, Tanya Kok Tanya Saya.",
            "Coba Pikirkan Secara Logika.",
            "Kcaw.",
            "Mending Makan MBG.",
            "Oh Iyakah, Astaga Ngerinya.",
            "Nyocot.",
            "Ya Ya, Saya Setuju.",
        ];
        
        // Memilih satu jawaban secara acak
        const pickOne = randomReplies[Math.floor(Math.random() * randomReplies.length)];

        box.innerHTML += `
            <div class="wa-bubble-in p-3 text-xs">
                <b class="text-[#075e54]">Bot My MBG:</b><br>
                ${pickOne}
            </div>`;
            
        box.scrollTop = box.scrollHeight;
    }, 1000); 
}

document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendChat();
});

function renderPetinggi() {
    const list = document.getElementById('petinggi-list');
    
    // Pastikan nama petingginya sama persis
    const data = [
        {n:"Ir. Robin", j:"Ketua Pengawas"}, 
        {n:"Dr. Rayen", j:"Ahli Gizi"}, 
        {n:"Bpk. Catur", j:"Logistik"},
        {n:"Bpk. Rapiuus", j:"Keuangan (Hobi Korupsi)"}
    ];
    
    list.innerHTML = data.map(p => `
        <div class="flex flex-col items-center min-w-[120px] cursor-pointer group" onclick="${p.n === 'Ir. Robin' ? 'playRobinSound()' : ''}">
            <img src="https://ui-avatars.com/api/?name=${p.n}&background=random&color=fff" class="w-16 h-16 rounded-full border-4 border-white shadow-xl group-hover:scale-110 transition">
            <p class="text-xs font-bold mt-3 text-gray-800">${p.n}</p>
            <p class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">${p.j}</p>
        </div>
    `).join('');
}
function initMapMini() {
    if(mapMini) mapMini.remove();
    mapMini = L.map('map-mini', {zoomControl: false}).setView([-2.99, 104.75], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapMini);
    L.marker([-2.99, 104.75]).addTo(mapMini);
}
// 
function playRobinSound() {
    // Pastiin file mp3-nya ada di folder yang sama ya!
    const audio = new Audio('suara_robin.mp3');
    audio.play().catch(e => console.log("HIDUP JOKOWI!"));
    
}