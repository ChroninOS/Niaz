document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. BACKGROUND ANIMATION (Embedded for safety) ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const config = { count: 40, dist: 150, speed: 0.5 };
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * config.speed;
                this.vy = (Math.random() - 0.5) * config.speed;
                this.size = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = 'rgba(22, 160, 133, 0.3)'; 
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        function init() {
            particles = [];
            for (let i = 0; i < config.count; i++) particles.push(new Particle());
        }
        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    if (d < config.dist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(22, 160, 133, ${0.15 - d/config.dist * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        }
        window.addEventListener('resize', () => { resize(); init(); });
        resize(); init(); animate();
    }

    // --- 2. EDITOR LOGIC ---
    const editor = document.getElementById('typly-editor');
    const fileList = document.getElementById('file-list');
    const newBtn = document.getElementById('new-btn');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    
    // Style Inputs
    const fontSelect = document.getElementById('font-family');
    const fontSize = document.getElementById('font-size');
    const lineHeight = document.getElementById('line-height');
    const pageWidth = document.getElementById('page-width');
    
    // Display Values
    const sizeVal = document.getElementById('size-val');
    const lhVal = document.getElementById('lh-val');
    const widthVal = document.getElementById('width-val');

    const STORAGE_KEY = 'typly_docs';
    let docs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let activeIndex = 0;

    // Initialize Default if Empty
    if (docs.length === 0) {
        docs.push({ title: 'Untitled Document', content: '' });
    }

    function saveDocs() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    }

    function updateStats(text) {
        charCount.textContent = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        wordCount.textContent = words;
    }

    function renderTabs() {
        fileList.innerHTML = '';
        docs.forEach((doc, index) => {
            const div = document.createElement('div');
            div.className = `file-tab ${index === activeIndex ? 'active' : ''}`;
            div.innerHTML = `
                <span>${doc.title || 'Untitled'}</span>
                <i class="fas fa-times delete-doc" data-index="${index}"></i>
            `;
            
            // Switch Tab
            div.addEventListener('click', (e) => {
                if(!e.target.classList.contains('delete-doc')){
                    activeIndex = index;
                    loadDoc();
                    renderTabs();
                }
            });

            fileList.appendChild(div);
        });

        // Add Delete Listeners
        document.querySelectorAll('.delete-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.dataset.index);
                if(docs.length > 1) {
                    const confirmDel = confirm('Delete this document?');
                    if(confirmDel) {
                        docs.splice(idx, 1);
                        if(activeIndex >= docs.length) activeIndex = docs.length - 1;
                        saveDocs();
                        renderTabs();
                        loadDoc();
                    }
                } else {
                    alert("You must have at least one document.");
                }
            });
        });
    }

    function loadDoc() {
        editor.value = docs[activeIndex].content;
        updateStats(editor.value);
    }

    // --- Event Listeners ---

    // Type & Auto-Save
    editor.addEventListener('input', () => {
        docs[activeIndex].content = editor.value;
        
        // Update Title based on first line
        const firstLine = editor.value.split('\n')[0].substring(0, 18);
        docs[activeIndex].title = firstLine || 'Untitled';
        
        updateStats(editor.value);
        saveDocs();
        
        // Debounce tab update to avoid flickering while typing
        clearTimeout(window.saveTimer);
        window.saveTimer = setTimeout(renderTabs, 1000);
    });

    // New Document
    newBtn.addEventListener('click', () => {
        docs.push({ title: 'New Document', content: '' });
        activeIndex = docs.length - 1;
        saveDocs();
        renderTabs();
        loadDoc();
    });

    // Style Controls
    fontSelect.addEventListener('change', () => editor.style.fontFamily = fontSelect.value);
    
    fontSize.addEventListener('input', () => {
        editor.style.fontSize = `${fontSize.value}px`;
        sizeVal.textContent = `${fontSize.value}px`;
    });

    lineHeight.addEventListener('input', () => {
        editor.style.lineHeight = lineHeight.value;
        lhVal.textContent = lineHeight.value;
    });

    pageWidth.addEventListener('input', () => {
        editor.style.width = `${pageWidth.value}px`;
        widthVal.textContent = `${pageWidth.value}px`;
    });

    // Download
    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([editor.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docs[activeIndex].title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Upload
    document.getElementById('upload-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                docs.push({ title: file.name.replace('.txt',''), content: e.target.result });
                activeIndex = docs.length - 1;
                saveDocs();
                renderTabs();
                loadDoc();
            };
            reader.readAsText(file);
        }
    });

    // Initial Load
    renderTabs();
    loadDoc();
});