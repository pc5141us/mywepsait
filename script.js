// رابط جلب البيانات من Vercel API الداخلي
const SHEET_API_URL = "/api/projects";

// رابط التليجرام الخاص بك
const telegramBotUrl = "https://t.me/DomaDesignsbot";

// عرض المواقع في الصفحة
async function fetchAndRenderProjects() {
    const projectGrid = document.getElementById('projectGrid');
    projectGrid.innerHTML = '<div class="loader">جاري جلب القوالب...</div>';

    try {
        const response = await fetch(SHEET_API_URL);
        const projects = await response.json();

        projectGrid.innerHTML = ''; // مسح رسالة التحميل

        if (projects.length === 0) {
            projectGrid.innerHTML = '<p>لا توجد مواقع معروضة حالياً.</p>';
            return;
        }

        projects.forEach(project => {
            const card = `
                <div class="project-card">
                    <div class="card-thumb" style="background-image: url('${project.thumbnail}');">
                        <div class="price-tag">${project.price}</div>
                    </div>
                    <div class="card-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="card-actions">
                            <button class="btn preview-btn" onclick="openPreview('${project.previewUrl}')">تجربة حية</button>
                            <a href="${telegramBotUrl}?start=buy_${project.id}" target="_blank" class="btn buy-btn">شراء الآن</a>
                        </div>
                    </div>
                </div>
            `;
            projectGrid.innerHTML += card;
        });

        // تفعيل تأثيرات التمرير بعد إضافة العناصر
        initScrollReveal();

    } catch (error) {
        console.error("Error fetching projects:", error);
        projectGrid.innerHTML = '<p>حدث خطأ أثناء تحميل البيانات. تأكد من اتصالك بالإنترنت.</p>';
    }
}

// تشغيل تأثيرات التمرير
function initScrollReveal() {
    const cards = document.querySelectorAll('.project-card');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            if (cardTop < triggerBottom) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    };
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
}

// Open Preview Modal
function openPreview(url) {
    if (url === "#" || !url) return;
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewFrame');
    const loader = document.getElementById('iframeLoader');
    const externalLink = document.getElementById('externalLink');
    
    loader.style.display = 'flex'; // إظهار مؤشر التحميل
    iframe.src = url;
    externalLink.href = url;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close Preview Modal
function closePreview() {
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewFrame');
    modal.style.display = 'none';
    iframe.src = '';
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target == modal) {
        closePreview();
    }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProjects);
