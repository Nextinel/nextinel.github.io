document.addEventListener('DOMContentLoaded', () => {
    const developerTitleElement = document.getElementById('developer-title');
    const originalText = "> developer"; // Исходный текст
    let currentText = "";
    let charIndex = 0;
    let cursorSpan = null; // Переменная для хранения элемента курсора

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Функция для симуляции печати текста
    const typeWriter = () => {
        if (charIndex < originalText.length) {
            currentText += originalText.charAt(charIndex);
            developerTitleElement.textContent = currentText;
            charIndex++;
        } else {
            // Текст полностью напечатан, останавливаем интервал печати
            clearInterval(typingInterval);

            // Создаем элемент для курсора, если он еще не создан
            if (!cursorSpan) {
                cursorSpan = document.createElement('span');
                cursorSpan.id = 'soft-blinking-cursor';
                cursorSpan.textContent = '_'; // Символ курсора
                developerTitleElement.appendChild(cursorSpan); // Добавляем курсор после текста
            }

            // Запускаем мигание курсора
            const cursorElement = document.getElementById('soft-blinking-cursor');
            if (cursorElement) {
                let opacity = 1;
                let direction = -1; // -1 для уменьшения, 1 для увеличения
                let minOpacity = 0.5;
                let speed = 0.05;

                const blinkCycle = () => {
                    opacity += direction * speed;
                    if (opacity > 1 || opacity < minOpacity) {
                        opacity = Math.max(minOpacity, Math.min(1, opacity));
                        direction *= -1;
                    }
                    cursorElement.style.opacity = opacity;
                };

                setInterval(blinkCycle, 100);
            }
        }
    };

    const typingInterval = setInterval(typeWriter, 75);

    if (!document.getElementById('cursor-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'cursor-styles';
        styleSheet.innerHTML = `
            #developer-title {
                font-size: 1.5rem;
                color: red;
                text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
                display: inline-block;
                white-space: pre;
            }
            #soft-blinking-cursor {
                display: inline-block;
                vertical-align: baseline;
                transition: opacity 0.1s ease-in-out;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Анимация для заголовков секций
    const sectionHeaders = document.querySelectorAll('h2');
    sectionHeaders.forEach(header => {
        const originalText = header.textContent;
        header.textContent = '';
        header.style.color = 'var(--primary-color)';
        originalText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.animation = `flicker 1.5s infinite alternate ${index * 0.08}s`;
            span.style.textShadow = `0 0 5px var(--flicker-color-red)`;
            header.appendChild(span);
        });
    });

    // Обработка медиа-запросов
    const handleMediaQueries = () => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (window.innerWidth < 768) {
                section.style.padding = '30px 10px';
            } else {
                section.style.padding = '50px 20px';
            }
        });
    };
    handleMediaQueries();
    window.addEventListener('resize', handleMediaQueries);

    // Создаем модальное окно для видео
    const modalHtml = `
    <div id="video-modal" class="modal" style="display:none; position:fixed; z-index:2000; top:0; left:0; width:100%; height:100%; background-color: rgba(0,0,0,0.8); justify-content:center; align-items:center;">
      <div class="modal-content" style="background:#222; padding:20px; border-radius:8px; max-width:90%; max-height:80%; position:relative;">
        <span class="close-button" style="position:absolute; top:10px; right:15px; font-size:2rem; color:#fff; cursor:pointer;">&times;</span>
        <div id="video-container"></div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('video-container');
    const closeButton = modal.querySelector('.close-button');

    closeButton.onclick = () => {
        modal.style.display = 'none';
        videoContainer.innerHTML = '';
    };
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            videoContainer.innerHTML = '';
        }
    };

    // Функция для открытия видео
    function openVideoModal(youtubeUrl) {
        // Очищаем контейнер
        videoContainer.innerHTML = '';
        // Создаем iframe
        const embedUrl = youtubeUrl.replace('/watch?v=', '/embed/');
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allowFullscreen = true;
        iframe.style.width = '1000px';
        iframe.style.height = '750px';
        videoContainer.appendChild(iframe);
        // Показываем модальное окно
        modal.style.display = 'flex';
    }

    // Обработка загрузки видео из JSON
    fetch('videos.json')
        .then(response => response.json())
        .then(data => {
            const videoGallery = document.getElementById('video-gallery');
            data.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.classList.add('video-item');

                // Предполагаем, что у вас есть thumbnail_url или генерируем его
                const thumbnailUrl = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_url.replace("https://www.youtube.com/watch?v=", "")}/hqdefault.jpg`;

                // Создаем шаблон с изображением
                videoItem.innerHTML = `
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <div class="video-wrapper clickable" style="cursor:pointer;" data-youtube="${video.youtube_url}">
                        <img src="${thumbnailUrl}" alt="${video.title}" style="width:75%; border-radius:8px;">
                    </div>
                `;
                // Добавляем обработчик клика
                const clickableDiv = videoItem.querySelector('.clickable');
                clickableDiv.addEventListener('click', () => {
                    openVideoModal(video.youtube_url);
                });
                videoGallery.appendChild(videoItem);
            });
        })
        .catch(error => console.error('Error loading videos:', error));
});