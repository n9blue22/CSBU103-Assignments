document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN & DOM ---
    const galleryItems = document.querySelectorAll('.photo-card img');
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('close-btn');

    // Trạng thái (State) của ảnh
    let state = {
        scale: 1,
        pX: 0, // Position X (TranslateX)
        pY: 0, // Position Y (TranslateY)
        isDragging: false,
        startX: 0,
        startY: 0
    };

    // Cấu hình Zoom
    const MIN_SCALE = 1;
    const MAX_SCALE = 8;
    const ZOOM_SPEED = 0.1; // Tốc độ zoom mỗi lần lăn chuột

    // --- HÀM RENDER ---
    // Áp dụng transform vào DOM
    const updateTransform = () => {
        // Sử dụng translate3d để kích hoạt GPU acceleration
        img.style.transform = `translate3d(${state.pX}px, ${state.pY}px, 0) scale(${state.scale})`;
    };

    // Hàm căn giữa ảnh ban đầu
    const centerImage = () => {
        // Reset state
        state.scale = 1;
        state.pX = 0;
        state.pY = 0;
        
        // Khi scale = 1, chúng ta để CSS Flexbox tự căn giữa (bằng cách xóa transform)
        // Hoặc set translate về 0
        img.style.transform = `translate3d(0px, 0px, 0) scale(1)`;
    };

    // --- 1. MỞ/ĐÓNG LIGHTBOX ---
    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            img.src = e.target.src;
            // Cần chờ ảnh load xong để tính toán kích thước thực nếu muốn giới hạn biên
            // Ở đây ta dùng CSS object-fit nên reset về 0,0 là an toàn
            centerImage();
            lightbox.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // --- 2. ZOOM LOGIC (THE HARD PART) ---
    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();

        // 1. Tính toán Scale mới
        // e.deltaY < 0 là lăn lên (Zoom in), > 0 là lăn xuống (Zoom out)
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale = state.scale + (delta * ZOOM_SPEED * state.scale);

        // Giới hạn Scale
        const clampedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
        
        if (clampedScale === state.scale) return; // Không thay đổi thì thoát

        // 2. Tính toán vị trí chuột so với ảnh
        // Lấy toạ độ chuột so với viewport
        const rect = img.getBoundingClientRect();
        
        // Toạ độ chuột tương đối so với góc trái trên của ẢNH (đã transform)
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        // 3. Tính toán vị trí mới (Matrix Math simplified)
        // Logic: Điểm dưới chuột phải giữ nguyên vị trí sau khi zoom
        // (offsetX / state.scale) là vị trí thực tế trên ảnh gốc (unscaled)
        // Ta muốn giữ nguyên vị trí thực đó tại toạ độ chuột mới
        
        const scaleRatio = clampedScale / state.scale;
        
        // Công thức dịch chuyển để bù lại độ lệch khi zoom
        // Nếu ta dùng transform-origin: 0 0, ta phải tự tính toán độ dời
        
        // Tuy nhiên, cách đơn giản hơn cho transform-origin: 0 0 kết hợp translate:
        // Vị trí cũ + (Vị trí chuột - Vị trí ảnh cũ) * (1 - Tỉ lệ zoom)
        // Nhưng do ta đang thao tác trực tiếp trên translate toàn cục:
        
        // Hãy dùng cách tính toán lại từ đầu dựa trên sự thay đổi kích thước:
        state.pX = e.clientX - (e.clientX - rect.left) * scaleRatio;
        state.pY = e.clientY - (e.clientY - rect.top) * scaleRatio;
        
        // Nếu zoom out về 1, tự động căn giữa lại cho đẹp
        if (clampedScale === 1) {
            state.pX = 0;
            state.pY = 0;
            // Ở CSS ta đã có flex center, nhưng vì ta đang dùng translate absolute
            // Ta cần reset translate về vị trí mà CSS Flexbox đã định vị ảnh ban đầu.
            // Nhưng vì logic ở trên đang dùng translate đè lên, ta sẽ set về 0 và để
            // centerImage xử lý nếu cần. Nhưng để mượt, ta gán trực tiếp:
            
            // Hack: Khi scale = 1, xoá transform để nó nhảy về giữa màn hình theo CSS Flex
            setTimeout(() => {
                if (state.scale === 1) img.style.transform = ''; 
            }, 10);
        }

        state.scale = clampedScale;
        updateTransform();
    });

    // --- 3. PAN / DRAG LOGIC ---
    
    img.addEventListener('mousedown', (e) => {
        if (state.scale > 1) {
            e.preventDefault();
            state.isDragging = true;
            state.startX = e.clientX - state.pX;
            state.startY = e.clientY - state.pY;
            img.classList.add('grabbing');
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (state.isDragging) {
            e.preventDefault();
            state.pX = e.clientX - state.startX;
            state.pY = e.clientY - state.startY;
            updateTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        if (state.isDragging) {
            state.isDragging = false;
            img.classList.remove('grabbing');
        }
    });

    // --- 4. DOUBLE CLICK RESET ---
    img.addEventListener('dblclick', () => {
        if (state.scale > 1) {
            centerImage();
        } else {
            // Zoom in nhanh lên 2x tại tâm
            state.scale = 2;
            // Cần tính toán lại pX, pY để zoom tại tâm màn hình
            // Đơn giản hoá: translate về -50% width/height của ảnh * scale...
            // Để đơn giản cho demo này:
            state.pX = (window.innerWidth - img.offsetWidth * 2) / 2;
            state.pY = (window.innerHeight - img.offsetHeight * 2) / 2;
            updateTransform();
        }
    });
});
