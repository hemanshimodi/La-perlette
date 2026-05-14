// ===== BEAD / CHARM / CLASP DATA =====
const BEADS = [
    { id:'b1', name:'Pink Bead', img:'pink bead 2.png', color:'#f8a4c8', colorCat:'pink', price:29 },
    { id:'b2', name:'Purple Bead', img:'purple bead.png', color:'#c4b5fd', colorCat:'purple', price:35 },
    { id:'b3', name:'Pearl Bead', img:'pearl bead.png', color:'#f0e6f6', colorCat:'white', price:25 },
    { id:'b4', name:'Blue Bead', img:'blue bead 2.png', color:'#93c5fd', colorCat:'blue', price:39 },
    { id:'b5', name:'Red Bead', img:'red bead 2.png', color:'#fda4af', colorCat:'pink', price:29 },
    { id:'b6', name:'Emerald Bead', img:'emarald bead 2.png', color:'#6bcb9b', colorCat:'green', price:35 },
    { id:'b7', name:'Heart Bead', img:'heart bead.png', color:'#f472b6', colorCat:'pink', price:45 },
    { id:'b8', name:'White Bead', img:'white bead 2.png', color:'#e0e7ff', colorCat:'white', price:32 },
];

const CHARMS = [
    { id:'c1', name:'Gold Butterfly', img:'gold butterfly charm.png', colorCat:'gold', price:59 },
    { id:'c2', name:'Gold Heart', img:'gold heart charm.png', colorCat:'gold', price:49 },
    { id:'c3', name:'Gold Wing', img:'gold wing charm.png', colorCat:'gold', price:69 },
    { id:'c4', name:'Hot Air Balloon', img:'hot air balloon charm.png', colorCat:'pink', price:55 },
    { id:'c5', name:'Pearl Bow', img:'pearl bow charm.png', colorCat:'white', price:65 },
    { id:'c6', name:'Bow Connector', img:'bow connector.png', colorCat:'gold', price:39 },
];

const CLASPS = [
    { id:'cl1', name:'Gold Clasp', img:'gold clasp.png', gradient:'linear-gradient(135deg,#d4a853,#f0d48a)', price:49 },
    { id:'cl2', name:'Star Lobster Hook', img:'star lobster hook.png', gradient:'linear-gradient(135deg,#d4a853,#e8c4c8)', price:69 },
];

// ===== STATE =====
let state = {
    braceletSlots: [],
    maxSlots: 12,
    selectedClasp: CLASPS[0],
    history: [],
    activeTab: 'beads',
    colorFilter: 'all',
    searchQuery: '',
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initSlots();
    renderComponentCards();
    renderBracelet();
    updatePricing();
    bindEvents();
});

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#f9a8d4','#c4b5fd','#fbcfe8','#fce7f3','#e9d5ff'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 8 + 3;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random()*100}%;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            animation-duration:${Math.random()*8+8}s;
            animation-delay:${Math.random()*5}s;
        `;
        container.appendChild(p);
    }
}

// ===== SLOTS =====
function initSlots() {
    state.braceletSlots = new Array(state.maxSlots).fill(null);
}

// ===== RENDER BRACELET =====
function renderBracelet() {
    const ring = document.getElementById('braceletRing');
    // Clear old slots
    ring.querySelectorAll('.bead-slot').forEach(el => el.remove());

    const cx = 130, cy = 130, rx = 110, ry = 110;
    const total = state.maxSlots;
    // Leave a gap at the top for the clasp
    const gapAngle = 0.4; // radians
    const startAngle = -Math.PI/2 + gapAngle;
    const endAngle = -Math.PI/2 + 2*Math.PI - gapAngle;
    const step = (endAngle - startAngle) / (total - 1);

    for (let i = 0; i < total; i++) {
        const angle = startAngle + step * i;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);

        const slot = document.createElement('div');
        slot.className = 'bead-slot' + (state.braceletSlots[i] ? ' filled' : '');
        slot.style.left = x + 'px';
        slot.style.top = y + 'px';
        slot.dataset.index = i;
        slot.title = state.braceletSlots[i]
            ? `${state.braceletSlots[i].name} — click × to remove`
            : `Slot ${i+1} — empty`;

        if (state.braceletSlots[i]) {
            const item = state.braceletSlots[i];
            const visual = document.createElement('div');
            visual.className = 'bead-visual';
            visual.style.background = 'transparent';
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.name;
            img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:50%;pointer-events:none;';
            visual.appendChild(img);
            visual.draggable = true;
            visual.addEventListener('dragstart', (e) => onDragStartSlot(e, i));

            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFromSlot(i); });

            slot.appendChild(visual);
            slot.appendChild(removeBtn);
        }

        // Drop target
        slot.addEventListener('dragover', (e) => { e.preventDefault(); slot.style.borderColor='#ec4899'; });
        slot.addEventListener('dragleave', () => { if(!state.braceletSlots[slot.dataset.index]) slot.style.borderColor=''; });
        slot.addEventListener('drop', (e) => onDropSlot(e, i));

        ring.appendChild(slot);
    }

    // Update clasp
    const clasp = document.getElementById('clasp');
    clasp.style.background = 'transparent';
    const claspIcon = clasp.querySelector('.clasp-icon');
    claspIcon.textContent = '';
    claspIcon.innerHTML = `<img src="${state.selectedClasp.img}" alt="${state.selectedClasp.name}" style="width:100%;height:100%;object-fit:contain;">`;

    // Update counter
    const filled = state.braceletSlots.filter(Boolean).length;
    document.getElementById('slotCount').textContent = filled;
    document.getElementById('maxSlots').textContent = state.maxSlots;

    // Update hint
    const hint = document.getElementById('dragHint');
    if (filled === 0) hint.textContent = '✨ Click beads below to add them';
    else if (filled < state.maxSlots) hint.textContent = `✨ ${state.maxSlots - filled} slots remaining — keep adding!`;
    else hint.textContent = '🎉 Bracelet complete! Looking gorgeous!';
}

// ===== RENDER COMPONENT CARDS =====
function renderComponentCards() {
    renderBeadCards();
    renderCharmCards();
    renderClaspCards();
}

function renderBeadCards() {
    const grid = document.getElementById('beadGrid');
    grid.innerHTML = '';
    const filtered = filterItems(BEADS);
    filtered.forEach(bead => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.dataset.id = bead.id;
        card.innerHTML = `
            <div class="card-visual" style="background:transparent;box-shadow:none;">
                <img src="${bead.img}" alt="${bead.name}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">
            </div>
            <div class="card-name">${bead.name}</div>
            <div class="card-price">₹${bead.price}</div>
            <div class="card-add-badge">+</div>
        `;
        card.addEventListener('click', () => addToBracelet(bead));
        card.draggable = true;
        card.addEventListener('dragstart', (e) => onDragStartCard(e, bead));
        grid.appendChild(card);
    });
}

function renderCharmCards() {
    const grid = document.getElementById('charmGrid');
    grid.innerHTML = '';
    const filtered = filterItems(CHARMS);
    filtered.forEach(charm => {
        const card = document.createElement('div');
        card.className = 'component-card';
        card.dataset.id = charm.id;
        card.innerHTML = `
            <div class="card-visual charm-visual" style="background:transparent;box-shadow:none;">
                <img src="${charm.img}" alt="${charm.name}" style="width:100%;height:100%;object-fit:contain;">
            </div>
            <div class="card-name">${charm.name}</div>
            <div class="card-price">₹${charm.price}</div>
            <div class="card-add-badge">+</div>
        `;
        card.addEventListener('click', () => addToBracelet(charm));
        card.draggable = true;
        card.addEventListener('dragstart', (e) => onDragStartCard(e, charm));
        grid.appendChild(card);
    });
}

function renderClaspCards() {
    const grid = document.getElementById('claspGrid');
    grid.innerHTML = '';
    CLASPS.forEach(clasp => {
        const card = document.createElement('div');
        card.className = 'component-card' + (state.selectedClasp.id === clasp.id ? ' selected' : '');
        card.dataset.id = clasp.id;
        card.innerHTML = `
            <div class="card-visual clasp-visual" style="background:transparent;box-shadow:none;">
                <img src="${clasp.img}" alt="${clasp.name}" style="width:100%;height:100%;object-fit:contain;">
            </div>
            <div class="card-name">${clasp.name}</div>
            <div class="card-price">₹${clasp.price}</div>
        `;
        card.addEventListener('click', () => selectClasp(clasp));
        grid.appendChild(card);
    });
}

function filterItems(items) {
    let result = items;
    if (state.colorFilter !== 'all') {
        result = result.filter(i => i.colorCat === state.colorFilter);
    }
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    return result;
}

// ===== ACTIONS =====
function addToBracelet(item) {
    const idx = state.braceletSlots.indexOf(null);
    if (idx === -1) { showToast('Bracelet is full! Remove a bead or increase the size.', 'warning'); return; }
    saveHistory();
    state.braceletSlots[idx] = { ...item };
    renderBracelet();
    updatePricing();
    showToast(`${item.name} added! ✨`, 'success');
}

function removeFromSlot(index) {
    if (!state.braceletSlots[index]) return;
    const item = state.braceletSlots[index];
    saveHistory();
    state.braceletSlots[index] = null;
    renderBracelet();
    updatePricing();
    showToast(`${item.name} removed`, 'info');
}

function selectClasp(clasp) {
    saveHistory();
    state.selectedClasp = clasp;
    renderBracelet();
    renderClaspCards();
    updatePricing();
    showToast(`Clasp changed to ${clasp.name}`, 'info');
}

function saveHistory() {
    state.history.push({
        slots: [...state.braceletSlots],
        clasp: { ...state.selectedClasp },
    });
    if (state.history.length > 30) state.history.shift();
    document.getElementById('btnUndo').disabled = false;
}

function undo() {
    if (!state.history.length) return;
    const prev = state.history.pop();
    state.braceletSlots = prev.slots;
    state.selectedClasp = prev.clasp;
    renderBracelet();
    renderClaspCards();
    updatePricing();
    if (!state.history.length) document.getElementById('btnUndo').disabled = true;
}

function clearBracelet() {
    if (!state.braceletSlots.some(Boolean)) return;
    saveHistory();
    state.braceletSlots = new Array(state.maxSlots).fill(null);
    renderBracelet();
    updatePricing();
    showToast('Bracelet cleared ✨', 'info');
}

// ===== DRAG & DROP =====
let dragData = null;

function onDragStartCard(e, item) {
    dragData = { type:'card', item };
    e.dataTransfer.effectAllowed = 'copy';
}

function onDragStartSlot(e, index) {
    dragData = { type:'slot', index };
    e.dataTransfer.effectAllowed = 'move';
}

function onDropSlot(e, targetIndex) {
    e.preventDefault();
    if (!dragData) return;

    if (dragData.type === 'card') {
        if (state.braceletSlots[targetIndex]) {
            showToast('Slot is occupied! Remove the bead first.', 'warning');
        } else {
            saveHistory();
            state.braceletSlots[targetIndex] = { ...dragData.item };
            renderBracelet();
            updatePricing();
            showToast(`${dragData.item.name} added! ✨`, 'success');
        }
    } else if (dragData.type === 'slot') {
        saveHistory();
        const temp = state.braceletSlots[targetIndex];
        state.braceletSlots[targetIndex] = state.braceletSlots[dragData.index];
        state.braceletSlots[dragData.index] = temp;
        renderBracelet();
        updatePricing();
    }
    dragData = null;
}

// ===== PRICING =====
function updatePricing() {
    let beadTotal = 0, charmTotal = 0;
    state.braceletSlots.forEach(item => {
        if (!item) return;
        if (item.id.startsWith('c')) charmTotal += item.price;
        else beadTotal += item.price;
    });
    const claspTotal = state.selectedClasp.price;
    const total = beadTotal + charmTotal + claspTotal;

    animatePrice('beadPrice', beadTotal);
    animatePrice('charmPrice', charmTotal);
    animatePrice('claspPrice', claspTotal);
    animatePrice('totalPrice', total);
}

function animatePrice(id, value) {
    const el = document.getElementById(id);
    el.textContent = `₹${value}`;
    el.style.transform = 'scale(1.15)';
    el.style.color = '#ec4899';
    setTimeout(() => { el.style.transform = ''; el.style.color = ''; }, 300);
}

// ===== SIZE CHANGE =====
function changeSize(size, slots) {
    const currentItems = state.braceletSlots.filter(Boolean);
    state.maxSlots = slots;
    state.braceletSlots = new Array(slots).fill(null);
    currentItems.forEach((item, i) => { if (i < slots) state.braceletSlots[i] = item; });
    renderBracelet();
    updatePricing();
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'✅', info:'💡', warning:'⚠️' };
    toast.innerHTML = `<span>${icons[type]||'💡'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(60px)'; setTimeout(() => toast.remove(), 300); }, 2500);
}

// ===== CONFETTI =====
function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#f472b6','#c4b5fd','#fbbf24','#ec4899','#a78bfa','#fb7185','#f9a8d4'];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: canvas.width/2 + (Math.random()-0.5)*200,
            y: canvas.height/2,
            vx: (Math.random()-0.5)*12,
            vy: Math.random()*-14 - 4,
            size: Math.random()*8+4,
            color: colors[Math.floor(Math.random()*colors.length)],
            rotation: Math.random()*360,
            rotSpeed: (Math.random()-0.5)*10,
            life: 1,
        });
    }

    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let alive = false;
        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            p.x += p.vx; p.y += p.vy; p.vy += 0.3;
            p.rotation += p.rotSpeed; p.life -= 0.012;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI/180);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
            ctx.restore();
        });
        if (alive) requestAnimationFrame(draw);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    draw();
}

// ===== EVENTS =====
function bindEvents() {
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeTab = tab.dataset.tab;
            document.querySelectorAll('.component-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        });
    });

    // Size
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            changeSize(btn.dataset.size, parseInt(btn.dataset.slots));
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderComponentCards();
    });

    // Color filter
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            state.colorFilter = dot.dataset.color;
            renderComponentCards();
        });
    });

    // Undo & Clear
    document.getElementById('btnUndo').addEventListener('click', undo);
    document.getElementById('btnClear').addEventListener('click', clearBracelet);

    // Add to bag
    document.getElementById('btnAddToCart').addEventListener('click', () => {
        const filled = state.braceletSlots.filter(Boolean).length;
        if (filled === 0) { showToast('Add some beads to your bracelet first! 💕', 'warning'); return; }
        fireConfetti();
        showToast('🎉 Added to bag! Your bracelet is gorgeous!', 'success');

        // Calculate prices
        let beadTotal = 0, charmTotal = 0;
        const items = [];
        state.braceletSlots.forEach(item => {
            if (!item) return;
            if (item.id.startsWith('c')) charmTotal += item.price;
            else beadTotal += item.price;
            items.push({ id: item.id, name: item.name, price: item.price, img: item.img });
        });
        const beadCount = state.braceletSlots.filter(s => s && !s.id.startsWith('c')).length;
        const charmCount = state.braceletSlots.filter(s => s && s.id.startsWith('c')).length;
        const claspTotal = state.selectedClasp.price;
        const subtotal = beadTotal + charmTotal + claspTotal;

        // Determine size label
        const activeSize = document.querySelector('.size-btn.active');
        const sizeLabel = activeSize ? activeSize.querySelector('span').textContent : '7"';

        // Save to localStorage
        const cartData = {
            items: items,
            clasp: { name: state.selectedClasp.name, price: state.selectedClasp.price, img: state.selectedClasp.img },
            beadCount: beadCount,
            charmCount: charmCount,
            beadTotal: beadTotal,
            charmTotal: charmTotal,
            claspTotal: claspTotal,
            subtotal: subtotal,
            size: sizeLabel,
            timestamp: Date.now()
        };
        localStorage.setItem('laperlette_cart', JSON.stringify(cartData));

        // Show the checkout button
        const checkoutBtn = document.getElementById('btnGoToCheckout');
        if (checkoutBtn) {
            checkoutBtn.style.display = 'flex';
        }
        // Update the Add to Bag button
        const addBtn = document.getElementById('btnAddToCart');
        addBtn.querySelector('.btn-cart-icon').textContent = '✅';
        addBtn.querySelector('.btn-cart-icon + span').textContent = 'Added to Bag!';
    });

    // Clasp click cycles
    document.getElementById('clasp').addEventListener('click', () => {
        const idx = CLASPS.findIndex(c => c.id === state.selectedClasp.id);
        selectClasp(CLASPS[(idx+1) % CLASPS.length]);
    });
}

// ===== HELPERS =====
function lighten(hex, percent) {
    const num = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return `rgb(${r},${g},${b})`;
}
