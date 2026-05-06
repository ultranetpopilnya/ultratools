// Функція-обмежувач: не дає запускати важкі задачі частіше, ніж раз на 'limit' мс
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Створюємо "гальмо", щоб функція не викликалась мільйон разів на секунду
// 10мс - це дуже швидко, щоб не було візуальних затримок
const throttledPackTemplates = throttle(() => {
    packTemplates();
}, 10);

// 1. Спочатку оголошуємо допоміжну функцію
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
// Додайте це на початку скрипту, якщо змінна ще не оголошена
const debouncedSaveTemplates = debounce(saveTemplates, 1000);

// --- ФУНКЦІОНАЛ КНОПКИ "ОЧИСТИТИ ВСІ ШАБЛОНИ" ---
function clearAllTemplates() {
    const templatesGrid = document.getElementById('templates-grid-wrapper');
    
    // Перевіряємо, чи є взагалі шаблони для видалення
    if (templatesGrid.children.length === 0) {
        showNotification("Немає шаблонів для видалення.");
        return; // Виходимо з функції, якщо немає чого видаляти
    }
    
    // Викликаємо стандартне вікно підтвердження браузера
    if (confirm('Ви впевнені, що хочете видалити ВСІ шаблони? Цю дію неможливо скасувати.')) {
        // Цей код виконається, тільки якщо користувач натисне "ОК"
        templatesGrid.innerHTML = ''; // Очищуємо контейнер з шаблонами
        saveTemplates(); // Зберігаємо порожній стан
        showNotification("Усі шаблони було видалено.");
    }
}

let lastGeneratedLogin = ''; // Зберігатиме останній згенерований логін
    function handleDeviceTypeChange() {
        const selectedValue = document.getElementById('device-type').value;
        displayCommands(selectedValue);
    }
    
    let isAutoResetEnabled = true; 
    
    function switchTab(tabId) {
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.container[data-content]');
        
        localStorage.setItem('activeTab', tabId); 
        
        contents.forEach(content => content.classList.remove('active'));
        tabs.forEach(tab => tab.classList.remove('active'));

        const activeContent = document.querySelector(`.container[data-content="${tabId}"]`);
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

        if (activeContent) {
            activeContent.classList.add('active');
            
            const defaultWidth = activeContent.getAttribute('data-default-width') || '100%';
            const defaultHeight = activeContent.getAttribute('data-default-height') || '600px';
            
            activeContent.style.setProperty('--local-width', defaultWidth);
            activeContent.style.setProperty('--local-height', defaultHeight);
            document.querySelector('.tab-content-wrapper').style.minHeight = defaultHeight;
            
            if (tabId === 'gpon-commands') {
                 const deviceSelect = document.getElementById('device-type');
                 const commandOutput = document.getElementById('command-output');
                 
                 // ЗМІНА: Перевіряємо, чи список пустий. 
                 // Якщо там вже є команди — НЕ перемальовуємо їх, щоб зберегти відкриті стани.
                 if (deviceSelect && commandOutput && commandOutput.children.length === 0) {
                    displayCommands(deviceSelect.value);
                 }
            }

            // === ДОДАНО: Примусове перепакування шаблонів при відкритті вкладки ===
            if (tabId === 'text-templates') {
                // Робимо це через невелику затримку, щоб CSS встиг застосувати display: block
                setTimeout(() => {
                    packTemplates();
                }, 50);
                // І ще раз трохи пізніше для надійності (страховка від повільного рендеру)
                setTimeout(() => {
                    packTemplates();
                }, 200);
            }
        }
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-button');
        let initialTab = localStorage.getItem('activeTab') || 'login-generator';

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
         setTimeout(() => {
        // --- ПОЧАТОК ДОДАНОГО КОДУ ---
        // Спочатку встановлюємо дати
        setDatesToTodayAndTomorrowAtMidnight();
        // Тепер завантажуємо налаштування та робимо перший розрахунок
        loadAutoResetState(); 
        calculateDifference(); 
        if (isAutoResetEnabled) startResetTimer();
        // --- КІНЕЦЬ ДОДАНОГО КОДУ ---

        // І лише тепер показуємо потрібну вкладку
        switchTab(initialTab); 
    }, 50); 
}

    function transliterate(text) {
    const mapping = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'й': 'i',
      'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh',
      'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'є': 'ie', 'ї': 'i', 'ю': 'iu', 'я': 'ia'
    };
    
    // Видаляємо всі види апострофів перед обробкою
    text = text.toLowerCase().replace(/['’ʼ]/g, "");

    const positionalRules = {
        'є': { start: 'ye', other: 'ie' }, 'ї': { start: 'yi', other: 'i' }, 'й': { start: 'y', other: 'i' },
        'ю': { start: 'yu', other: 'iu' }, 'я': { start: 'ya', other: 'ia' }
    };

    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === 'з' && i + 1 < text.length && text[i + 1] === 'г') {
            result += 'zgh'; i++; continue;
        }
        if (positionalRules[char]) {
            const isStartOfWord = (i === 0 || text[i-1] === ' ');
            result += isStartOfWord ? positionalRules[char].start : positionalRules[char].other;
        } else if (mapping[char]) {
            result += mapping[char];
        } else if (/[a-z0-9]/.test(char)) {
            result += char;
        }
    }
    return result;
}
	
function generateAlternativeLogin(buttonElement) {
    const resultItem = buttonElement.closest('.result-item');
    const loginSpan = resultItem.querySelector('span');
    
    // Визначаємо тип: компанія чи людина
    const isCompany = resultItem.dataset.isCompany === 'true';

    let newLogin = '';

    if (isCompany) {
        // === СТРАТЕГІЯ ДЛЯ КОМПАНІЙ (ФОП, ТОВ...) ===
        const baseLogin = resultItem.dataset.baseLogin;
        let counter = parseInt(resultItem.dataset.suffixCounter || '1', 10);
        counter++;
        newLogin = baseLogin + counter;
        resultItem.dataset.suffixCounter = counter;

    } else {
        // === СТРАТЕГІЯ ДЛЯ ЛЮДЕЙ ===
        const surname = resultItem.dataset.surname;
        const nameInitial = resultItem.dataset.nameInitial;
        const patronymicFull = resultItem.dataset.patronymicFull;
        
        let currentPatrIndex = parseInt(resultItem.dataset.patrIndex || '1', 10);

        if (currentPatrIndex < patronymicFull.length) {
            currentPatrIndex++; 
            const patronymicPart = patronymicFull.substring(0, currentPatrIndex);
            newLogin = surname + nameInitial + patronymicPart;
            
            resultItem.dataset.patrIndex = currentPatrIndex;
        } else {
            let counter = parseInt(resultItem.dataset.overflowCounter || '1', 10);
            counter++;
            newLogin = surname + nameInitial + patronymicFull + counter;
            resultItem.dataset.overflowCounter = counter;
        }
    }
    
    // Оновлюємо текст і глобальну змінну
    loginSpan.textContent = newLogin;
    lastGeneratedLogin = newLogin;

    // Очищуємо поле вводу
    document.getElementById('fullNameInput').value = '';

    // === НОВЕ: ПОВІДОМЛЕННЯ ТА АНІМАЦІЯ ===
    
    // 1. Показуємо спливаюче повідомлення
    showNotification(`Новий варіант: ${newLogin}`);

    // 2. Анімуємо іконку (крутимо її)
    const icon = buttonElement.querySelector('i');
    icon.style.transition = 'transform 0.4s ease';
    icon.style.transform = 'rotate(360deg)';
    
    // Скидаємо анімацію через 0.4 секунди, щоб можна було крутити знову
    setTimeout(() => {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
    }, 400);
}
	
	function copyLogin(button) {
    const resultItem = button.closest('.result-item');
    const loginText = resultItem.querySelector('span').textContent;
    // Отримуємо ім'я для історії
    const originalName = resultItem.querySelector('.original-name')?.textContent || 'Вручну';

    navigator.clipboard.writeText(loginText).then(() => {
        button.innerHTML = '<i class="fa-solid fa-check"></i>';
        button.classList.add('copied');
        
        showNotification(`Логін скопійовано: ${loginText}`);

        // === ДОДАЄМО В ІСТОРІЮ ===
        addToHistory(loginText, originalName);

        document.getElementById('fullNameInput').value = '';

        document.querySelectorAll('.config-login-input').forEach(input => {
            input.value = loginText;
        });

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
            button.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Помилка:', err);
        showNotification('Помилка копіювання!');
    });
}

function generateLogins() {
    const fullNameInput = document.getElementById('fullNameInput');
    const fullNames = fullNameInput.value.trim();
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    
    lastGeneratedLogin = '';

    if (!fullNames) return;

    const lines = fullNames.split('\n');
    
    const companyRegex = /(^|\s)(фоп|тов|пп|ат|кб|го|кп)(\s|$)/i;
    const strictCompanyKeyword = /^(фоп|тов|пп|ат|кб|го|кп)$/i;

    lines.forEach(line => {
        const fullName = line.trim();
        if (fullName === '') return;

        // Валідація на "Тільки цифри"
        if (/^[\d\s]+$/.test(fullName)) {
            const errorElement = document.createElement('div');
            errorElement.className = 'result-item error-item';
            errorElement.innerHTML = `<span style="color: #dc3545; font-weight: bold; font-size: 1em; text-align: center">Вхідні дані не можуть бути лише цифрами!</span>`;
            resultsContainer.appendChild(errorElement);
            return;
        }
        
        // Валідація на латиницю
        if (/[a-z]/i.test(fullName)) {
            const errorElement = document.createElement('div');
            errorElement.className = 'result-item error-item';
            errorElement.innerHTML = `<span style="color: #dc3545; font-weight: bold; font-size: 1em; text-align: center">Трансліт тільки з української!</span>`;
            resultsContainer.appendChild(errorElement);
            return;
        }

        // Створюємо групу для результатів саме цього рядка (щоб вони стояли поруч)
        const groupDiv = document.createElement('div');
        groupDiv.className = 'result-group';

        // Локальна функція для додавання картки в групу
        function appendResult(login, typeLabel, dataset, originalFullName) {
            if (!login) return;
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            for (const key in dataset) {
                resultItem.dataset[key] = dataset[key];
            }

            if (!lastGeneratedLogin) lastGeneratedLogin = login;

            // HTML картки (додано бейдж зверху, а спан з логіном отримав клас login-text)
            resultItem.innerHTML = `
                <div class="result-type-badge">${typeLabel}</div>
                <span class="login-text">${login}</span>
                <div class="original-name" title="${originalFullName}">${originalFullName}</div>
                <div class="actions-wrapper">
                    <button class="regenerate-login-btn" onclick="generateAlternativeLogin(this)" title="Згенерувати наступний варіант">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="copy-login-btn" onclick="copyLogin(this)" title="Копіювати логін">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            groupDiv.appendChild(resultItem);
        }

        const parts = fullName.split(/\s+/).filter(p => p.length > 0);
        
        const isCompany = companyRegex.test(fullName.toLowerCase()) || 
              parts.length > 3 || 
              /\d/.test(fullName) || 
              /["“”«»]/.test(fullName);
        
        if (isCompany) {
            let loginFull = transliterate(fullName).replace(/[^a-z0-9]/g, '');
            appendResult(loginFull, 'Звичайний', { isCompany: 'true', baseLogin: loginFull, suffixCounter: '1' }, fullName);

            let abbrLogin = '';
            parts.forEach(part => {
                // Очищаємо слово від дужок, лапок та спецсимволів перед обробкою
                let cleanPart = part.replace(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ0-9]/g, '');
                
                // Якщо після очищення нічого не залишилося (наприклад, був символ "-"), пропускаємо
                if (!cleanPart) return; 

                if (strictCompanyKeyword.test(cleanPart) || /\d/.test(cleanPart)) {
                    abbrLogin += transliterate(cleanPart).replace(/[^a-z0-9]/g, '');
                } else {
                    abbrLogin += transliterate(cleanPart.charAt(0)).replace(/[^a-z0-9]/g, '');
                }
            });
            
            if (abbrLogin && abbrLogin !== loginFull) {
                appendResult(abbrLogin, 'Скорочений', { isCompany: 'true', baseLogin: abbrLogin, suffixCounter: '1' }, fullName);
            }

        } else {
            if (parts.length < 3) {
                let loginFull = parts.map(part => transliterate(part)).join('').replace(/[^a-z0-9]/g, '');
                appendResult(loginFull, 'Звичайний', { isCompany: 'true', baseLogin: loginFull, suffixCounter: '1' }, fullName);
                
                let loginAbbr = parts.map(part => {
                    let cleanPart = part.replace(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ0-9]/g, '');
                    return cleanPart ? transliterate(cleanPart.charAt(0)) : '';
                }).join('').replace(/[^a-z0-9]/g, '');
                if (loginAbbr && loginAbbr !== loginFull) {
                    appendResult(loginAbbr, 'Скорочений', { isCompany: 'true', baseLogin: loginAbbr, suffixCounter: '1' }, fullName);
                }
            } else {
                let surname = transliterate(parts[0]).replace(/[^a-z0-9]/g, '');
                let nameFull = transliterate(parts[1]).replace(/[^a-z0-9]/g, '');
                let patronymicFull = transliterate(parts[2]).replace(/[^a-z0-9]/g, '');

                let nameInitial = nameFull.charAt(0);
                let patronymicInitial = patronymicFull.charAt(0);

                let loginStandard = surname + nameInitial + patronymicInitial;
                appendResult(loginStandard, 'Звичайний', { 
                    isCompany: 'false', surname: surname, nameInitial: nameInitial, patronymicFull: patronymicFull, patrIndex: '1' 
                }, fullName);

                let loginFullVariant = surname + nameFull + patronymicFull;
                appendResult(loginFullVariant, 'Повний', { 
                    isCompany: 'true', baseLogin: loginFullVariant, suffixCounter: '1' 
                }, fullName);
            }
        }

        // Додаємо групу з картками в основний контейнер
        if (groupDiv.children.length > 0) {
            resultsContainer.appendChild(groupDiv);
        }
    });
    
    const scrollCard = document.querySelector('.login-generator-container .content-card');
    if (scrollCard) scrollCard.scrollTop = 0;
}

    function getCorrectDayWord(number) {
        if (number === 0) return "днів";
        let lastTwoDigits = number % 100;
        let lastDigit = number % 10;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "днів";
        if (lastDigit === 1) return "день";
        if (lastDigit >= 2 && lastDigit <= 4) return "дні";
        return "днів";
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
	
	function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function areDatesInDefaultState() {
        const startDateInput = document.getElementById('start-date').value;
        const startTimeInput = document.getElementById('start-time').value;
        const endDateInput = document.getElementById('end-date').value;
        const endTimeInput = document.getElementById('end-time').value;

        // Обчислюємо, якими мають бути стандартні дати "прямо зараз"
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const defaultStartDate = formatDate(today); // Використовуємо вашу функцію
        const defaultEndDate = formatDate(tomorrow); // Використовуємо вашу функцію
        const defaultTime = "00:00";

        // Повертаємо true, якщо ВСІ поточні значення збігаються зі стандартними
        return (
            startDateInput === defaultStartDate &&
            startTimeInput === defaultTime &&
            endDateInput === defaultEndDate &&
            endTimeInput === defaultTime
        );
    }
    
    function setDatesToTodayAndTomorrowAtMidnight() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        document.getElementById('start-date').value = formatDate(today);
        document.getElementById('start-time').value = "00:00"; 
        document.getElementById('end-date').value = formatDate(tomorrow);
        document.getElementById('end-time').value = "00:00"; 
    }
    
    function resetDatesOnTimerEnd() {
    document.getElementById('auto-reset-button').classList.remove('timer-running'); 
    setDatesToTodayAndTomorrowAtMidnight();
    calculateDifference();
}

    function startResetTimer() {
    if (!isAutoResetEnabled) return;

    const button = document.getElementById('auto-reset-button');

    if (areDatesInDefaultState()) {
        button.classList.remove('timer-running');
        return;
    }

    const progressRing = button.querySelector('.progress-ring-fg');
    
    button.classList.remove('timer-running');
    void button.offsetWidth;

    progressRing.addEventListener('transitionend', resetDatesOnTimerEnd, { once: true });
    button.classList.add('timer-running');
}
    
    function handleInputAndTimer() {
    if (isAutoResetEnabled) startResetTimer(); 
    calculateDifference();
}
    
    function handleAutoResetToggle() {
        const button = document.getElementById('auto-reset-button');
        isAutoResetEnabled = !isAutoResetEnabled; // Інвертуємо стан
        
        button.classList.toggle('active', isAutoResetEnabled);
        localStorage.setItem('autoResetEnabled', isAutoResetEnabled);

        if (isAutoResetEnabled) {
            // Якщо увімкнули - запускаємо таймер
            startResetTimer();
        } else {
            // Якщо вимкнули - гарантовано зупиняємо таймер, анімацію І СКАСОВУЄМО ПОДІЮ
            const progressRing = button.querySelector('.progress-ring-fg');
            
            // 1. Скасовуємо "прослуховувач", який чекає на завершення анімації
            progressRing.removeEventListener('transitionend', resetDatesOnTimerEnd);
            
            // 2. Зупиняємо саму анімацію
            button.classList.remove('timer-running');
        }
    }

    function loadAutoResetState() {
    const savedState = localStorage.getItem('autoResetEnabled');
    const button = document.getElementById('auto-reset-button');
    
    isAutoResetEnabled = savedState !== 'false'; // За замовчуванням увімкнено
    
    button.classList.toggle('active', isAutoResetEnabled);

    button.addEventListener('click', handleAutoResetToggle);
}

    function calculateDifference() {
        const startDateInput = document.getElementById('start-date').value;
        const startTimeInput = document.getElementById('start-time').value; 
        const endDateValue = document.getElementById('end-date').value;
        const endTimeValue = document.getElementById('end-time').value; 
        const resultDisplay = document.getElementById('result-display');

        if (!startDateInput || !endDateValue || !startTimeInput || !endTimeValue) {
            resultDisplay.innerHTML = 'Оберіть дві дати та час для розрахунку.';
            return;
        }

        const startDate = new Date(`${startDateInput}T${startTimeInput}:00`);
        const endDate = new Date(`${endDateValue}T${endTimeValue}:00`); 

        if (startDate > endDate) {
            resultDisplay.innerHTML = '<span style="color: red;">Початкова дата та час не можуть бути пізнішими за Кінцеву.</span>';
            return;
        }
        
        const diffTime = endDate.getTime() - startDate.getTime();
        const totalHours = Math.floor(diffTime / 3600000);
        const totalMinutesRemainder = Math.floor((diffTime % 3600000) / 60000);
        let totalHoursText = `${totalHours} год.`;
        if (totalMinutesRemainder > 0) totalHoursText += ` та ${totalMinutesRemainder} хв.`;
        
        const totalDaysInclusive = Math.ceil(diffTime / 86400000);
        const dayWord = getCorrectDayWord(totalDaysInclusive);
        
        let tempStartDate = new Date(startDate);
        let tempEndDate = new Date(endDate);
        const startTotalMinutes = tempStartDate.getHours() * 60 + tempStartDate.getMinutes();
        const endTotalMinutes = tempEndDate.getHours() * 60 + tempEndDate.getMinutes();
        if (endTotalMinutes < startTotalMinutes) tempEndDate.setDate(tempEndDate.getDate() - 1);
        
        if (tempStartDate.toDateString() === tempEndDate.toDateString() && diffTime > 0) {
            let durationText = `${totalHours} год. та ${totalMinutesRemainder} хв.`;
            resultDisplay.innerHTML = `<span class="total-hours-text">Кількість годин (загальна): ${totalHoursText}</span><br><span class="duration-text">Період (повний): ${durationText}</span><br><span class="total-days-text">Загальна кількість (днів): ${totalDaysInclusive} ${dayWord}.</span>`;
            return;
        }

        let years = tempEndDate.getFullYear() - tempStartDate.getFullYear();
        let months = tempEndDate.getMonth() - tempStartDate.getMonth();
        let days = tempEndDate.getDate() - tempStartDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(tempEndDate.getFullYear(), tempEndDate.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        if (endTotalMinutes >= startTotalMinutes && diffTime > 0 && !(years === 0 && months === 0 && days === 0)) days++;
        if (days >= new Date(tempStartDate.getFullYear(), tempStartDate.getMonth() + 1, 0).getDate()) {
            days = 0;
            months++;
            if (months >= 12) {
                months = 0;
                years++;
            }
        }
        
        let parts = [];
        if (years > 0) parts.push(`${years} р.`);
        if (months > 0) parts.push(`${months} міс.`);
        if (days > 0 || parts.length === 0) parts.push(`${days} дн.`);
        let durationText = parts.join(' та ');
        if (durationText === '') durationText = '0 дн.';
        
        resultDisplay.innerHTML = `<span class="total-hours-text">Кількість годин (загальна): ${totalHoursText}</span><br><span class="duration-text">Період (повний): ${durationText}</span><br><span class="total-days-text">Загальна кількість (днів): ${totalDaysInclusive} ${dayWord}.</span>`;
    }
    
    let COMMANDS = { gpon: [], epon: [], bdcom: [] }; // Тепер це порожній об'єкт, який заповниться сам
    // === РОЗУМНИЙ ПАРСЕР КОМАНД ===
function loadCommandsFromFile() {
    fetch('commands.txt?v=' + Date.now())
        .then(response => {
            if (!response.ok) throw new Error("Файл команд не знайдено");
            return response.text();
        })
        .then(text => {
            let currentType = null;
            let lastCommand = null;
            const lines = text.split('\n');
            
            COMMANDS = { gpon: [], epon: [], bdcom: [] };

            lines.forEach(line => {
                line = line.trim();
                
                if (!line || line.startsWith('#')) return; 

                const sectionMatch = line.match(/^\[(.*)\]$/);
                if (sectionMatch) {
                    currentType = sectionMatch[1].toLowerCase();
                    if (!COMMANDS[currentType]) COMMANDS[currentType] = [];
                    lastCommand = null; 
                    return;
                }

                if (!currentType) return;

                // === НОВЕ: Перевірка на постійно розгорнутий список ===
                const isSub = line.startsWith('>');
                let isAlwaysExpanded = false;
                let actualLine = line;

                if (isSub) {
                    actualLine = line.substring(1).trim();
                } else if (line.startsWith('*')) {
                    isAlwaysExpanded = true;
                    actualLine = line.substring(1).trim();
                }

                let splitIndex = actualLine.indexOf('::');
                let cmdText, cmdDesc;
                
                if (splitIndex !== -1) {
                    cmdText = actualLine.substring(0, splitIndex).trim();
                    cmdDesc = actualLine.substring(splitIndex + 2).trim();
                } else {
                    cmdText = actualLine;
                    cmdDesc = "";
                }

                // === НОВЕ: Зберігаємо статус alwaysExpanded ===
                const cmdObj = { command: cmdText, description: cmdDesc, alwaysExpanded: isAlwaysExpanded };

                if (isSub && lastCommand) {
                    if (!lastCommand.subCommands) lastCommand.subCommands = [];
                    lastCommand.subCommands.push(cmdObj);
                } else {
                    cmdObj.subCommands = [];
                    COMMANDS[currentType].push(cmdObj);
                    lastCommand = cmdObj; 
                }
            });

            const activeTab = localStorage.getItem('activeTab');
            if (activeTab === 'gpon-commands') {
                const deviceSelect = document.getElementById('device-type');
                if (deviceSelect) displayCommands(deviceSelect.value);
            }
        })
        .catch(err => {
            // ... (помилка залишається як була)
            console.error("Помилка завантаження команд:", err);
            document.getElementById('command-output').innerHTML = 
                '<p style="text-align: center; color: #dc3545; padding: 20px;">Не вдалося завантажити файл commands.txt</p>';
        });
}

    const commandOutput = document.getElementById('command-output');
    const notification = document.getElementById('notification');
    
    function displayCommands(deviceType) {
    const commandOutput = document.getElementById('command-output');
    commandOutput.innerHTML = ''; 
    const commands = COMMANDS[deviceType] || [];
    
    const mainContainer = document.querySelector('.container[data-content="gpon-commands"]');
    const isExpanded = commands.length > 15; 

    if (mainContainer) {
        if (isExpanded) {
            mainContainer.classList.add('expanded-layout');
            // Додаємо спеціальний клас для CSS-колонок
            commandOutput.classList.add('two-columns');
        } else {
            mainContainer.classList.remove('expanded-layout');
            commandOutput.classList.remove('two-columns');
        }
    }

    if (commands.length === 0) {
        commandOutput.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Команди для цього типу обладнання ще не додано.</p>';
        return;
    }

    commands.forEach((item) => {
        if (!item.command && !item.description) return;

        const hasSubCommands = item.subCommands && item.subCommands.length > 0;
        const isAlwaysExpanded = item.alwaysExpanded; // === НОВЕ ===

        const commandDiv = document.createElement('div');
        commandDiv.classList.add('command-item');
        commandDiv.setAttribute('data-command', item.command); 
        
        if (hasSubCommands) {
            commandDiv.classList.add('has-subcommands');
            // === НОВЕ: Логіка підказок та класів для статичних заголовків ===
            if (isAlwaysExpanded) {
                commandDiv.classList.add('static-header');
                commandDiv.title = "";
            } else {
                commandDiv.title = "Натисніть на рядок, щоб розгорнути список. Натисніть на текст команди, щоб скопіювати.";
            }
        }

        const commandTextSpan = document.createElement('span');
        commandTextSpan.classList.add('command-text');
        commandTextSpan.textContent = item.command;
        
        const commandDescriptionSpan = document.createElement('span');
        commandDescriptionSpan.classList.add('command-description');
        commandDescriptionSpan.textContent = item.description;

        commandDiv.appendChild(commandTextSpan);
        commandDiv.appendChild(commandDescriptionSpan);

        let subListDiv = null;

        if (hasSubCommands) {
            // === НОВЕ: Додаємо стрілочку ТІЛЬКИ якщо список згортається ===
            if (!isAlwaysExpanded) {
                const chevron = document.createElement('i');
                chevron.className = 'fas fa-chevron-down chevron-icon';
                commandDiv.appendChild(chevron);
            }

            subListDiv = document.createElement('div');
            subListDiv.className = 'sub-command-list';
            
            // === НОВЕ: Клас для постійно відкритого списку ===
            if (isAlwaysExpanded) {
                subListDiv.classList.add('always-open');
            }

            item.subCommands.forEach(subItem => {
                const subDiv = document.createElement('div');
                subDiv.className = 'sub-command-item';
                
                subDiv.innerHTML = `
                    <span class="command-text" style="font-family: 'Fira Code', monospace; font-weight: 600;">${subItem.command}</span>
                    <span class="command-description" style="font-size: 0.9em; color: #888;">${subItem.description}</span>
                `;
                
                subDiv.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    copyCommandToClipboard(subItem.command);
                });
                
                subListDiv.appendChild(subDiv);
            });

            commandTextSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                copyCommandToClipboard(item.command);
            });

            // Обробник кліку для всього рядка
            if (!isAlwaysExpanded) {
                // Якщо це звичайний список - клік розгортає/згортає його
                commandDiv.addEventListener('click', (e) => {
                    const isExpandedState = commandDiv.classList.toggle('expanded');
                    subListDiv.classList.toggle('open', isExpandedState);

                    if (isExpandedState) {
                        setTimeout(() => {
                            subListDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 250);
                    } else {
                        setTimeout(() => {
                            commandDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 250);
                    }
                });
            } else {
                // === ВИПРАВЛЕННЯ: Якщо це статичний заголовок, клік в БУДЬ-ЯКЕ МІСЦЕ рядка копіює команду ===
                commandDiv.addEventListener('click', () => {
                    copyCommandToClipboard(item.command);
                });
            }

        } else {
            commandDiv.addEventListener('click', () => {
                copyCommandToClipboard(item.command);
            });
        }

        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'command-group-wrapper';
        
        groupWrapper.appendChild(commandDiv);
        if (subListDiv) {
            groupWrapper.appendChild(subListDiv);
        }

        commandOutput.appendChild(groupWrapper);
    });
}

    // Функція копіювання залишається без змін (з попереднього кроку)
    async function copyCommandToClipboard(text) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showNotification(`Команда скопійована: ${text}`);
        } catch (err) {
            console.error('Не вдалося скопіювати команду: ', err);
            showNotification('Помилка копіювання. Спробуйте вручну.');
        }
    }

    // Стару функцію handleCommandClick можна видалити, 
    // оскільки логіка тепер вбудована прямо в displayCommands через copyCommandToClipboard

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    }
    
function initDraggableAndResizable(element) {
    interact(element).resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        
        listeners: {
            start(event) {
                event.target.classList.add('is-resizing');
                event.target.style.zIndex = '5000';
            },
            move(event) {
                let target = event.target;
                const container = document.getElementById('templates-grid-wrapper');
                
                // 1. Отримуємо ширину контейнера
                const containerWidth = container.clientWidth;

                // 2. Отримуємо поточну позицію X елемента
                const style = window.getComputedStyle(target);
                const matrix = new DOMMatrix(style.transform);
                const currentX = matrix.m41;

                // 3. Рахуємо МАКСИМАЛЬНО можливу ширину для цього блоку
                // Віднімаємо 10px, щоб він точно не впирався в край і не викликав глюк переносу
                const maxAvailableWidth = containerWidth - currentX - 0;

                // 4. Головна магія: 
                // Беремо або ширину від мишки, або максимум. Що менше - те і беремо.
                // Це прибирає "відскок", блок просто впирається в невидиму стіну.
                let newWidth = Math.min(event.rect.width, maxAvailableWidth);
                let newHeight = event.rect.height;

                // 5. Застосовуємо (Math.floor прибирає дробові пікселі, що теж зменшує дрижання)
                target.style.width = Math.floor(newWidth) + 'px';
                target.style.height = Math.floor(newHeight) + 'px';
				
				renderLineMarkers(target); 
                
                // Оновлюємо сусідів
                throttledPackTemplates(); 
            },
            end(event) {
                event.target.classList.remove('is-resizing');
                event.target.style.zIndex = '';
                
                saveTemplates();
                packTemplates();
            }
        },
        modifiers: [
            interact.modifiers.restrictSize({
                min: { width: 350, height: 90 }
            })
        ],
        inertia: false
    });
}

    // --- ПОЧАТОК НОВОЇ, ПОКРАЩЕНОЇ СИСТЕМИ ЗАКЛАДОК ---

    /**
     * Розраховує схожість двох рядків за алгоритмом Левенштейна.
     * Повертає значення від 0 (зовсім різні) до 1 (ідентичні).
     */
    function similarity(s1, s2) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        let longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }
    
    /**
     * Оновлює позиції закладок після зміни тексту.
     * Ця функція прив'язує закладки до контенту, а не до номера рядка.
     */
    function updateBookmarksOnTextChange(fieldGroup) {
    const textarea = fieldGroup.querySelector('textarea');
    const oldBookmarksData = JSON.parse(fieldGroup.dataset.bookmarks || '[]');
    
    if (oldBookmarksData.length === 0) return;

    const newLines = textarea.value.split('\n');
    const newBookmarks = [];

    oldBookmarksData.forEach(oldBookmark => {
        const oldContent = oldBookmark.content || "";
        const trimmedOld = oldContent.trim();

        // --- Якщо старий рядок стерто повністю — не переносимо закладку ---
        if (!trimmedOld.length) return;

        let newIndex = -1;

        // 1️⃣ Швидка перевірка на старому місці (залишаємо навіть якщо залишилась 1 літера)
        if (oldBookmark.lineNumber <= newLines.length) {
            const currentLine = newLines[oldBookmark.lineNumber - 1] || "";
            if (currentLine.trim() === trimmedOld || currentLine.startsWith(trimmedOld.slice(0, 1))) {
                newIndex = oldBookmark.lineNumber - 1;
            }
        }

        // 2️⃣ Якщо не знайдено — шукаємо точний збіг
        if (newIndex === -1) {
            newIndex = newLines.findIndex(line => line.trim() === trimmedOld);
        }

        // 3️⃣ "Розумний" пошук схожого рядка, але уникаємо випадкових збігів на "end" або схожих коротких словах
        if (newIndex === -1 && trimmedOld.length > 2) {
            let bestMatch = { index: -1, score: 0.65 }; 
            for (let i = 0; i < newLines.length; i++) {
                const line = newLines[i];
                if (line.trim().length < 2) continue;
                const score = similarity(trimmedOld, line.trim());
                if (score > bestMatch.score) {
                    bestMatch.score = score;
                    bestMatch.index = i;
                }
            }
            if (bestMatch.index !== -1) {
                newIndex = bestMatch.index;
            }
        }

        if (newIndex !== -1) {
            newBookmarks.push({
                lineNumber: newIndex + 1,
                content: newLines[newIndex]
            });
        }
    });

    // Унікалізація
    const uniqueBookmarks = Array.from(new Map(newBookmarks.map(item => [item.lineNumber, item])).values());

    fieldGroup.dataset.bookmarks = JSON.stringify(uniqueBookmarks);
    renderLineMarkers(fieldGroup);
}
   
// --- НОВІ ФУНКЦІЇ ДЛЯ ПІДСВІТКИ СЛІВ ---

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function updateHighlight(textarea, highlighter) {
        const text = textarea.value;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;

        if (selectionStart === selectionEnd) {
            highlighter.innerHTML = escapeHtml(text) + '\n';
            return;
        }

        // 1. Обрізаємо пробіли
        const selectedText = text.substring(selectionStart, selectionEnd).trim();

        // 2. Перевірка довжини (мінімум 2 символи)
        if (selectedText.length < 2 || selectedText.length > 50) { 
            highlighter.innerHTML = escapeHtml(text) + '\n';
            return;
        }

        const escapedSelectedText = selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // 3. Визначаємо типи символів
        const wordChars = "a-zA-Z0-9_а-яА-ЯіїєґІЇЄҐ";
        const isDigitsOnly = /^\d+$/.test(selectedText); // Чи це тільки цифри?
        const isPureWord = new RegExp(`^[${wordChars}]+$`).test(selectedText); // Чи це букви/цифри?

        let regex;

        if (isDigitsOnly) {
            // === ЛОГІКА ДЛЯ ЧИСЕЛ (50, 100, 192) ===
            // Шукаємо число, якщо зліва і справа НЕМАЄ іншої ЦИФРИ.
            // Це дозволяє: "50M", "Vlan50", "10G".
            // Це забороняє: "50" всередині "2500".
            regex = new RegExp(`(?<!\\d)(${escapedSelectedText})(?!\\d)`, 'gi');
        } 
        else if (isPureWord) {
            // === ЛОГІКА ДЛЯ СЛІВ (тест, admin) ===
            // Шукаємо слово, якщо зліва і справа НЕМАЄ БУКВИ або ЦИФРИ.
            // Це забороняє: "те" всередині "тест".
            regex = new RegExp(`(?<![${wordChars}])(${escapedSelectedText})(?![${wordChars}])`, 'gi');
        } 
        else {
            // === ЛОГІКА ДЛЯ СПЕЦСИМВОЛІВ (0/1, mac-address) ===
            // Шукаємо точний збіг всюди.
            regex = new RegExp(`(${escapedSelectedText})`, 'gi');
        }
        
        const highlightedText = escapeHtml(text).replace(regex, (match) => `<mark>${match}</mark>`);

        highlighter.innerHTML = highlightedText + '\n';
    }
	
    function createTemplateField(data = {}) {
    // Встановлюємо дефолтну ширину 350px, якщо це новий шаблон
    const { name = '', content = '', width = '350px', height = '90px', bookmarks = [] } = data;
    const container = document.getElementById('templates-grid-wrapper'); 
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'template-field-group';
    
    // Відновлення закладок
    let modernBookmarks = [];
    if (bookmarks.length > 0) {
        const lines = content.split('\n');
        if (typeof bookmarks[0] === 'number') { 
            bookmarks.forEach(lineNumber => {
                if (lineNumber > 0 && lineNumber <= lines.length) {
                    modernBookmarks.push({ lineNumber: lineNumber, content: lines[lineNumber - 1] });
                }
            });
        } else { 
            modernBookmarks = bookmarks;
        }
    }
    fieldGroup.dataset.bookmarks = JSON.stringify(modernBookmarks);
    
    fieldGroup.style.width = width;
    fieldGroup.style.height = height;
          
    const headerDiv = document.createElement('div');
    headerDiv.className = 'template-header';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'template-name-input';
    nameInput.placeholder = 'Назва шаблону';
    nameInput.value = name;
    nameInput.oninput = saveTemplates;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'template-actions';
    
    // --- КНОПКИ ---
    
    const copyButton = document.createElement('button');
    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyButton.title = 'Копіювати текст';
    copyButton.className = 'copy-template-btn';
    copyButton.onclick = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const textToCopy = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) || textarea.value;
        if (!textToCopy.trim()) return; 
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            copyButton.disabled = true;
            setTimeout(() => { copyButton.innerHTML = '<i class="fas fa-copy"></i>'; copyButton.disabled = false; }, 1500);
        }).catch(err => console.error('Error:', err));
    };
    
    // --- 1. КНОПКА ВСТАВКИ ТІЛЬКИ ЗГЕНЕРОВАНОГО ЛОГІНА ---
    const pasteLoginButton = document.createElement('button');
    // Змінимо іконку, щоб відрізняти від звичайної вставки (наприклад, іконка юзера/тегу)
    pasteLoginButton.innerHTML = '<i class="fa-solid fa-user-tag"></i>'; 
    pasteLoginButton.title = 'Вставити згенерований логін';
    pasteLoginButton.className = 'paste-login-btn';
    pasteLoginButton.onclick = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        let targetText = ''; 

        // 1. Пріоритет: Беремо найперший з історії (те, що користувач щойно скопіював)
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        if (history.length > 0) {
            targetText = history[0].login;
        } 
        // 2. Якщо історія пуста, але є щойно згенерований в пам'яті
        else if (lastGeneratedLogin) {
            targetText = lastGeneratedLogin;
        }

        // Якщо взагалі глухо
        if (!targetText) {
            showNotification('Немає згенерованого логіна для вставки!');
            return;
        }

        const savedScrollTop = textarea.scrollTop;

        // ДІЯ: Масова заміна АБО звичайна вставка
        if (start !== end && selectedText.length > 0) {
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapeRegExp(selectedText), 'g');
            textarea.value = text.replace(regex, targetText);
            showNotification(`Замінено всі: ${selectedText} ➔ ${targetText}`);
            textarea.setSelectionRange(start, start + targetText.length);
        } else {
            textarea.value = text.substring(0, start) + targetText + text.substring(end);
            const newCursorPos = start + targetText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }

        textarea.focus({ preventScroll: true });
        textarea.scrollTop = savedScrollTop;
        const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
        updateHighlight(textarea, highlighter); 
        updateBookmarksOnTextChange(fieldGroup);
        saveTemplates();
    };

    // --- 2. НОВА КНОПКА ЗВИЧАЙНОЇ ВСТАВКИ З БУФЕРА ОБМІНУ ---
    const pasteClipboardButton = document.createElement('button');
    pasteClipboardButton.innerHTML = '<i class="fa-solid fa-paste"></i>';
    pasteClipboardButton.title = 'Вставити';
    pasteClipboardButton.className = 'paste-clipboard-btn';
    pasteClipboardButton.onclick = async () => {
        const textarea = fieldGroup.querySelector('textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        let targetText = '';

        try {
            const clipText = await navigator.clipboard.readText();
            if (clipText && clipText.trim() !== '') targetText = clipText.trim();
        } catch (err) {
            console.warn("Немає доступу до буфера обміну");
        }

        if (!targetText) {
            showNotification('Буфер обміну порожній або недоступний!');
            return;
        }

        const savedScrollTop = textarea.scrollTop;

        // ДІЯ: Масова заміна АБО звичайна вставка
        if (start !== end && selectedText.length > 0) {
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapeRegExp(selectedText), 'g');
            textarea.value = text.replace(regex, targetText);
            showNotification(`Замінено всі: ${selectedText} ➔ ${targetText}`);
            textarea.setSelectionRange(start, start + targetText.length);
        } else {
            textarea.value = text.substring(0, start) + targetText + text.substring(end);
            const newCursorPos = start + targetText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }

        textarea.focus({ preventScroll: true });
        textarea.scrollTop = savedScrollTop;
        const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
        updateHighlight(textarea, highlighter); 
        updateBookmarksOnTextChange(fieldGroup);
        saveTemplates();
    };
    
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '<i class="fas fa-eraser"></i>';
    clearButton.title = 'Очистити текст';
    clearButton.className = 'clear-template-btn';
    clearButton.onclick = () => {
        if (confirm('Очистити вміст?')) {
            const textarea = fieldGroup.querySelector('textarea');
            const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
            textarea.value = '';
            highlighter.innerHTML = '';
            fieldGroup.dataset.bookmarks = '[]';
            renderLineMarkers(fieldGroup);
            saveTemplates();
        }
    };

   // === КНОПКА ПОШУКУ (НЕЗАЛЕЖНА) ===
    const searchToggleButton = document.createElement('button');
    searchToggleButton.className = 'search-template-btn'; // ДОДАЛИ КЛАС
    searchToggleButton.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    searchToggleButton.title = 'Пошук і заміна тексту';
    
    searchToggleButton.onclick = (e) => {
        e.stopPropagation(); 
        
        const panel = fieldGroup.querySelector('.template-search-bar');
        const isActive = panel.classList.contains('active');

        // Просто перемикаємо стан поточної панелі (БЕЗ впливу на інші шаблони)
        if (isActive) {
            panel.classList.remove('active');
        } else {
            panel.classList.add('active');
            // Автоматично ставимо курсор у поле "Знайти" через мить після відкриття
            setTimeout(() => {
                const input = panel.querySelector('.input-find');
                if (input) input.focus();
            }, 50);
            
            // Оновлюємо сітку Тетрісу, бо шаблон став трохи вищим
            setTimeout(() => packTemplates(), 260); 
        }
    };

    // === КНОПКА ГЕНЕРАТОРА КОНФІГІВ ===
    const configToggleButton = document.createElement('button');
    configToggleButton.className = 'config-template-btn';
    configToggleButton.innerHTML = '<i class="fa-solid fa-server"></i>';
    configToggleButton.title = 'Генератор конфігурацій ОЛТ';

// ========================================================
    // === ПАНЕЛЬ ГЕНЕРАТОРА КОНФІГІВ (ПОЧАТОК БЛОКУ) ===
    // ========================================================
    const configPanel = document.createElement('div');
    configPanel.className = 'template-config-bar'; 
    
    // Стани кнопок (Зберігаються для кожного шаблону окремо)
    let isReplaceMode = true; 
    let isPonOnuMode = false; 

    // Додано type="button" щоб кнопки не "ламали" форму
    configPanel.innerHTML = `
        <div class="config-single-row">
            <select class="config-olt-select" title="Оберіть ОЛТ">
                <option value="">-- ОЛТ --</option>
                <optgroup label="Ultranet"></optgroup>
                <optgroup label="ISP Energy"></optgroup>
            </select>
            <input type="text" class="config-login-input" placeholder="Логін" title="Логін">
            <select class="config-speed-select" title="Швидкість">
                    <option value="10M">10M</option>
                    <option value="20M">20M</option>
                    <option value="30M">30M</option>
                    <option value="40M">40M</option>
                    <option value="50M">50M</option>
                    <option value="60M">60M</option>
                    <option value="100M" selected>100M</option>
                    <option value="200M">200M</option>
                    <option value="300M">300M</option>
                    <option value="500M">500M</option>
                    <option value="1G">1G</option>
            </select>
            <input type="text" class="config-port-input" placeholder="Порт" title="Порт (напр. 1/2/5:101)">
            <input type="text" class="config-vlan-input" placeholder="VLAN" title="VLAN (Залиште порожнім, щоб не міняти)">
            
            <button type="button" class="config-replace-mode-btn active" title="Замінювати попередньо згенерований конфіг">
                <i class="fa-solid fa-arrows-rotate"></i>
            </button>
            <button type="button" class="config-pon-onu-btn" title="Додавати PON-ONU, Show pon power та Write">
                <i class="fa-solid fa-wave-square"></i>
            </button>

            <button type="button" class="config-generate-btn" title="Згенерувати конфіг">
                <i class="fa-solid fa-bolt"></i>
            </button>
        </div>
    `;

    configPanel.addEventListener('mousedown', (e) => e.stopPropagation());

    // === ЗАБОРОНА КИРИЛИЦІ ===
    const loginInputBox = configPanel.querySelector('.config-login-input');
    loginInputBox.addEventListener('input', (e) => {
        const cyrillicRegex = /[а-яА-ЯіїєґІЇЄҐёЁ]/g;
        if (cyrillicRegex.test(e.target.value)) {
            e.target.value = e.target.value.replace(cyrillicRegex, '');
            showNotification("Логін має бути лише латиницею!");
        }
    });

    // === РОЗУМНЕ АВТОФОРМАТУВАННЯ ПОРТУ ===
    const portInputBox = configPanel.querySelector('.config-port-input');
    portInputBox.addEventListener('input', (e) => {
        let val = e.target.value;

        // 1. Швидкі замінники: пробіл, крапка, кома, тире, бекслеш -> стають слешем
        val = val.replace(/[ .,\-\\]/g, '/');

        // 2. Видаляємо всі літери і спецсимволи, залишаємо ТІЛЬКИ цифри, слеш (/) та двокрапку (:)
        val = val.replace(/[^0-9/:]/g, '');

        // 3. Забороняємо підряд два і більше слешів (якщо користувач випадково натиснув / сам)
        val = val.replace(/\/+/g, '/');

        // 4. Логіка автододавання (працює ТІЛЬКИ коли вводимо текст, а не стираємо Backspace-ом)
        if (e.inputType !== 'deleteContentBackward') {
            // Якщо ввели рівно 1 цифру (Frame) -> додаємо /
            if (/^\d$/.test(val)) {
                val += '/';
            }
            // Якщо ввели Frame/Slot (де Slot = рівно 2 цифри, напр. "1/02" або "1/15") -> додаємо /
            else if (/^\d\/\d{2}$/.test(val)) {
                val += '/';
            }
        }

        // Записуємо оброблене значення назад у поле
        e.target.value = val;
    });

    // === ЛОГІКА ВІДКРИТТЯ/ЗАКРИТТЯ ПАНЕЛІ ===
    configToggleButton.onclick = (e) => {
        e.stopPropagation();
        const isActive = configPanel.classList.contains('active');
        if (isActive) {
            configPanel.classList.remove('active');
        } else {
            const searchBar = fieldGroup.querySelector('.template-search-bar');
            if (searchBar) searchBar.classList.remove('active');
            
            configPanel.classList.add('active');
            
            const select = configPanel.querySelector('.config-olt-select');
            const grpUltranet = select.querySelector('optgroup[label="Ultranet"]');
            const grpEnergy = select.querySelector('optgroup[label="ISP Energy"]');
            
            grpUltranet.innerHTML = '';
            grpEnergy.innerHTML = '';
            
            OLT_CONFIGS.ultranet.forEach((olt, index) => {
                grpUltranet.innerHTML += `<option value="ultranet-${index}">${olt.name}</option>`;
            });
            OLT_CONFIGS.energy.forEach((olt, index) => {
                grpEnergy.innerHTML += `<option value="energy-${index}">${olt.name}</option>`;
            });

            const loginInput = configPanel.querySelector('.config-login-input');
            if (!loginInput.value && lastGeneratedLogin) {
                loginInput.value = lastGeneratedLogin;
            }

            setTimeout(() => packTemplates(), 260);
        }
    };

    // === ДИНАМІЧНА ПІДКАЗКА VLAN ===
    const oltSelectNode = configPanel.querySelector('.config-olt-select');
    const vlanInputNode = configPanel.querySelector('.config-vlan-input');

    oltSelectNode.addEventListener('change', (e) => {
        if (!e.target.value) {
            vlanInputNode.placeholder = "VLAN";
            return;
        }
        const [type, index] = e.target.value.split('-');
        const oltObj = OLT_CONFIGS[type][index];
        if (oltObj && oltObj.defaultVlan) {
            vlanInputNode.placeholder = `VLAN (${oltObj.defaultVlan})`;
        } else {
            vlanInputNode.placeholder = "VLAN";
        }
    });

    // === ТУМБЛЕР: ЗАМІНА КОНФІГУ ===
    const btnReplaceMode = configPanel.querySelector('.config-replace-mode-btn');
    btnReplaceMode.addEventListener('click', (e) => {
        e.preventDefault();
        isReplaceMode = !isReplaceMode;
        btnReplaceMode.classList.toggle('active', isReplaceMode);
        showNotification(isReplaceMode ? "Режим ЗАМІНИ увімкнено" : "Режим ДОДАВАННЯ увімкнено");
    });

    // === ТУМБЛЕР: PON-ONU ===
    const btnPonOnu = configPanel.querySelector('.config-pon-onu-btn');
    btnPonOnu.addEventListener('click', (e) => {
        e.preventDefault();
        isPonOnuMode = !isPonOnuMode;
        btnPonOnu.classList.toggle('active', isPonOnuMode);
        showNotification(isPonOnuMode ? "Команди PON-ONU УВІМКНЕНО" : "Команди PON-ONU ВИМКНЕНО");
    });

    // === ГОЛОВНА ЛОГІКА ГЕНЕРАЦІЇ ===
    const btnGenerate = configPanel.querySelector('.config-generate-btn');
    btnGenerate.addEventListener('click', (e) => {
        e.preventDefault();
        const select = configPanel.querySelector('.config-olt-select');
        const loginVal = configPanel.querySelector('.config-login-input').value.trim();
        const speedVal = configPanel.querySelector('.config-speed-select').value;
        const portVal = configPanel.querySelector('.config-port-input').value.trim();
        const vlanVal = configPanel.querySelector('.config-vlan-input').value.trim();

        if (/[а-яА-ЯіїєґІЇЄҐёЁ]/.test(loginVal)) {
            showNotification("Помилка! Логін містить кирилицю.");
            return;
        }

        if (!select.value) {
            showNotification("Будь ласка, оберіть ОЛТ!");
            return;
        }

        const [type, index] = select.value.split('-');
        const oltObj = OLT_CONFIGS[type][index];
        if (!oltObj) return;

        let currentTemplateName = oltObj.templateName; 

        // =========================================================
        // === РОЗУМНИЙ ПОРТ ТІЛЬКИ ДЛЯ ОЛТІВ ІЗ ПОЗНАЧКОЮ (MIX) ===
        // =========================================================
        // Перевіряємо, чи є в назві ОЛТа слово (MIX)
        if (oltObj.name.includes('(MIX)')) {
            // Якщо так, і порт починається з "1/2/" -> це GPON
            if (portVal.startsWith('1/02/')) {
                currentTemplateName = currentTemplateName.replace(/EPON/i, 'GPON');
            } 
            // Якщо порт починається з "1/1/" -> це EPON
            else if (portVal.startsWith('1/01/')) {
                currentTemplateName = currentTemplateName.replace(/GPON/i, 'EPON');
            }
        }
        // =========================================================

        const rawTemplate = OLT_TEMPLATES[currentTemplateName];
        if (!rawTemplate) {
            showNotification(`Помилка: Шаблон "${currentTemplateName}" не знайдено! Перевірте olt_configs.txt`);
            return;
        }

        const finalVlan = vlanVal !== '' ? vlanVal : (oltObj.defaultVlan || '1');

        // 1. Створюємо базовий конфіг (з TRIM)
        let finalConfig = rawTemplate
            .replace(/{LOGIN}/g, loginVal || 'UNKNOWN_LOGIN')
            .replace(/{SPEED}/g, speedVal)
            .replace(/{PORT}/g, portVal || 'UNKNOWN_PORT')
            .replace(/{VLAN}/g, finalVlan)
            .trim(); 

        // 2. Додаємо PON-ONU, якщо тумблер увімкнений
        if (isPonOnuMode) {
            if (!portVal) {
                showNotification("Вкажіть Порт для команд PON-ONU!");
                return;
            }
            
            let ponType = '';
            // Перевіряємо вже ОНОВЛЕНУ назву шаблону, щоб правильно додати GPON або EPON команди
            if (currentTemplateName.toLowerCase().includes('gpon')) ponType = 'gpon';
            else if (currentTemplateName.toLowerCase().includes('epon')) ponType = 'epon';
            
            if (ponType && PON_ONU_TEMPLATES[ponType]) {
                const extraTemplate = PON_ONU_TEMPLATES[ponType];
                
                const finalExtraConfig = extraTemplate
                    .replace(/{PORT}/g, portVal)
                    .replace(/{VLAN}/g, finalVlan)
                    .replace(/{LOGIN}/g, loginVal || 'UNKNOWN_LOGIN')
                    .replace(/{SPEED}/g, speedVal)
                    .trim(); 
                
                // Додаємо конфіг (без зайвих пробілів)
                finalConfig += '\n' + finalExtraConfig;
            } else {
                showNotification(`Шаблон PON-ONU для ${ponType.toUpperCase()} не знайдено у файлі!`);
            }
        }

        // 3. НАДІЙНА ЛОГІКА ЗАМІНИ ТЕКСТУ
        const textarea = fieldGroup.querySelector('textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        let currentText = textarea.value.replace(/\r\n/g, '\n');
        let oldConfig = (fieldGroup.dataset.lastGeneratedConfig || "").replace(/\r\n/g, '\n');

        if (isReplaceMode && oldConfig && currentText.includes(oldConfig)) {
            currentText = currentText.replace(oldConfig, finalConfig);
            textarea.value = currentText;
        } else {
            textarea.value = currentText.substring(0, start) + finalConfig + '\n' + currentText.substring(end);
        }

        fieldGroup.dataset.lastGeneratedConfig = finalConfig;

        const savedScroll = textarea.scrollTop;
        const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
        updateHighlight(textarea, highlighter);
        updateBookmarksOnTextChange(fieldGroup);
        saveTemplates();
        
        textarea.scrollTop = savedScroll;
        showNotification("Конфіг згенеровано!");
    });
    // ========================================================
    // === ПАНЕЛЬ ГЕНЕРАТОРА КОНФІГІВ (КІНЕЦЬ БЛОКУ) ===
    // ========================================================

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.title = 'Видалити шаблон';
    deleteButton.className = 'delete-template-btn';
    deleteButton.onclick = () => {
        if (confirm('Видалити шаблон?')) {
            fieldGroup.remove();
            saveTemplates();
            packTemplates();
        }
    };

    const searchPanel = document.createElement('div');
    searchPanel.className = 'template-search-bar';
    
    // Запобігаємо, щоб кліки по інпутах не викликали перетягування картки
    searchPanel.addEventListener('mousedown', (e) => e.stopPropagation());

    const savedFind = localStorage.getItem('lastSearchTerm') || '';
    const savedReplace = localStorage.getItem('lastReplaceTerm') || '';

    searchPanel.innerHTML = `
        <div class="search-panel-columns">
            <!-- Ліва колонка: Стандартний пошук -->
            <div class="search-col-left">
                <div class="search-inputs-row">
                    <input type="text" class="input-find" placeholder="Знайти..." value="${savedFind}">
                    <button class="swap-inputs-btn" title="Поміняти місцями">
                        <i class="fa-solid fa-right-left"></i>
                    </button>
                    <input type="text" class="input-replace" placeholder="Замінити..." value="${savedReplace}">
                </div>
                <div class="search-buttons-row">
                    <button class="search-cmd-btn btn-find">Знайти</button>
                    <button class="search-cmd-btn btn-replace">Замінити</button>
                    <button class="search-cmd-btn btn-replace-all">Замінити все</button>
                </div>
            </div>
            
            <!-- Права колонка: Заміна швидкості -->
            <div class="search-col-right">
                <span class="speed-label">Швидкість:</span>
                <select class="speed-select">
                    <option value="10M">10M</option>
                    <option value="20M">20M</option>
                    <option value="30M">30M</option>
                    <option value="40M">40M</option>
                    <option value="50M">50M</option>
                    <option value="60M">60M</option>
                    <option value="100M" selected>100M</option>
                    <option value="200M">200M</option>
                    <option value="300M">300M</option>
                    <option value="500M">500M</option>
                    <option value="1G">1G</option>
                </select>
                <button class="search-cmd-btn btn-replace-speed" title="Автоматично знайти стару швидкість і замінити">
                    <i class="fa-solid fa-bolt"></i> Замінити
                </button>
            </div>
        </div>
    `;

    const inputFind = searchPanel.querySelector('.input-find');
    const inputReplace = searchPanel.querySelector('.input-replace');
    const btnSwap = searchPanel.querySelector('.swap-inputs-btn'); // Отримуємо кнопку
    const btnFind = searchPanel.querySelector('.btn-find');
    const btnReplace = searchPanel.querySelector('.btn-replace');
    const btnReplaceAll = searchPanel.querySelector('.btn-replace-all');

    // Підтягуємо нові елементи швидкості
    const btnReplaceSpeed = searchPanel.querySelector('.btn-replace-speed');
    const speedSelect = searchPanel.querySelector('.speed-select');

    // === РОЗУМНА ЗАМІНА ШВИДКОСТІ ===
    btnReplaceSpeed.onclick = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const text = textarea.value;
        const targetSpeed = speedSelect.value;
        
        // Магічний Regex: шукає старі швидкості (10M, 50M, 100M, 1000M, 1G) як окремі слова
        const speedRegex = /\b(?:10|20|30|40|50|60|100|200|300|500|1000)M\b|\b1G\b/gi;

        if (!speedRegex.test(text)) {
            showNotification("У шаблоні не знайдено швидкостей (10M-1G) для заміни.");
            return;
        }

        // Замінюємо всі знайдені швидкості (хоч 1, хоч 3 штуки) на вибрану
        const newText = text.replace(speedRegex, targetSpeed);
        
        const savedScroll = textarea.scrollTop;
        textarea.value = newText;
        
        // Оновлюємо підсвітку та зберігаємо результат
        const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
        updateHighlight(textarea, highlighter);
        updateBookmarksOnTextChange(fieldGroup);
        saveTemplates();
        
        textarea.scrollTop = savedScroll;
        showNotification(`Всі швидкості змінено на ${targetSpeed}!`);
    };

    // === ЛОГІКА КНОПКИ ОБМІНУ ===
    btnSwap.onclick = () => {
        const temp = inputFind.value;
        inputFind.value = inputReplace.value;
        inputReplace.value = temp;
        
        // Зберігаємо нові значення в пам'ять
        localStorage.setItem('lastSearchTerm', inputFind.value);
        localStorage.setItem('lastReplaceTerm', inputReplace.value);
    };

    inputFind.addEventListener('input', (e) => localStorage.setItem('lastSearchTerm', e.target.value));
    inputReplace.addEventListener('input', (e) => localStorage.setItem('lastReplaceTerm', e.target.value));
    
    // Закриття панелі на клавішу Escape (тепер працює для всього блоку шаблону)
    fieldGroup.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const isActive = searchPanel.classList.contains('active');
            if (isActive) {
                searchPanel.classList.remove('active');
                // Після закриття пошуку повертаємо курсор назад у текст, щоб можна було відразу друкувати
                const textarea = fieldGroup.querySelector('textarea');
                if (textarea) textarea.focus(); 
            }
        }
    });

    const performFind = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const term = inputFind.value;
        if (!term) return;

        const text = textarea.value;
        let startPos = textarea.selectionEnd;
        let index = text.toLowerCase().indexOf(term.toLowerCase(), startPos);

        if (index === -1) {
            index = text.toLowerCase().indexOf(term.toLowerCase(), 0);
        }

        if (index !== -1) {
            textarea.focus();
            textarea.setSelectionRange(index, index + term.length);
            // Розумна прокрутка
            const lines = text.substring(0, index).split('\n');
            const lineHeight = 21; 
            textarea.scrollTop = (lines.length * lineHeight) - (textarea.clientHeight / 2);
        } else {
            showNotification("Не знайдено");
        }
    };

    btnFind.onclick = performFind;

    btnReplace.onclick = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const term = inputFind.value;
        const replacement = inputReplace.value;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (selectedText.toLowerCase() === term.toLowerCase() && term !== '') {
            const text = textarea.value;
            const newText = text.substring(0, start) + replacement + text.substring(end);
            
            const savedScroll = textarea.scrollTop;
            textarea.value = newText;
            
            const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
            updateHighlight(textarea, highlighter);
            updateBookmarksOnTextChange(fieldGroup);
            saveTemplates();
            
            textarea.scrollTop = savedScroll;
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        } else {
            performFind();
        }
    };

    btnReplaceAll.onclick = () => {
        const textarea = fieldGroup.querySelector('textarea');
        const term = inputFind.value;
        const replacement = inputReplace.value;
        
        if (!term) return;

        const text = textarea.value;
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        if (!regex.test(text)) {
            showNotification("Не знайдено");
            return;
        }

        const newText = text.replace(regex, replacement);
        
        const savedScroll = textarea.scrollTop;
        textarea.value = newText;
        
        const highlighter = fieldGroup.querySelector('.highlighter-backdrop');
        updateHighlight(textarea, highlighter);
        updateBookmarksOnTextChange(fieldGroup);
        saveTemplates();
        
        textarea.scrollTop = savedScroll;
        showNotification("Замінено!");
    };

    // --- СТРУКТУРА HTML ---

    const textareaWrapper = document.createElement('div');
    textareaWrapper.className = 'textarea-wrapper';
    
    const gutter = document.createElement('div');
    gutter.className = 'line-marker-gutter';

    const markerContainer = document.createElement('div');
    markerContainer.className = 'line-marker-container';
    gutter.appendChild(markerContainer);

    const highlightingContainer = document.createElement('div');
    highlightingContainer.className = 'highlighting-container';

    const highlighter = document.createElement('div');
    highlighter.className = 'highlighter-backdrop';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Введіть текст тут...';
    textarea.value = content;
    highlighter.innerHTML = escapeHtml(content) + '\n';
    
    let isScrolling = false;
    const syncScroll = () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                markerContainer.style.transform = `translateY(-${textarea.scrollTop}px)`;
                highlighter.scrollTop = textarea.scrollTop;
                highlighter.scrollLeft = textarea.scrollLeft;
                isScrolling = false;
            });
            isScrolling = true;
        }
    };

    textarea.addEventListener('input', () => {
        updateHighlight(textarea, highlighter);
        updateBookmarksOnTextChange(fieldGroup);
        debouncedSaveTemplates();
    });
    textarea.addEventListener('scroll', syncScroll);

    const selectionHandler = () => requestAnimationFrame(() => updateHighlight(textarea, highlighter));
    textarea.addEventListener('mouseup', selectionHandler);
    textarea.addEventListener('keyup', selectionHandler);
    textarea.addEventListener('blur', () => updateHighlight(textarea, highlighter));

    gutter.onclick = (event) => {
        // ... (Стара логіка gutter залишається без змін) ...
        const style = window.getComputedStyle(textarea);
        const fontSize = parseFloat(style.fontSize) || 14;
        let lineHeight = parseFloat(style.lineHeight);
        if (isNaN(lineHeight) || lineHeight < fontSize) {
            lineHeight = fontSize * 1.5;
        }
        const paddingTop = parseFloat(style.paddingTop) || 10;
        const rect = gutter.getBoundingClientRect();
        const clickY = event.clientY - rect.top; 
        const absoluteY = clickY + textarea.scrollTop;
        let rawLineIndex = Math.floor((absoluteY - paddingTop - 3) / lineHeight);
        if (rawLineIndex < 0) rawLineIndex = 0;
        const clickedLineNumber = rawLineIndex + 1;
        const lines = textarea.value.split('\n');
        if (clickedLineNumber > lines.length) return;
        let currentBookmarks = JSON.parse(fieldGroup.dataset.bookmarks || '[]');
        const existingBookmarkIndex = currentBookmarks.findIndex(b => b.lineNumber === clickedLineNumber);
        if (existingBookmarkIndex > -1) {
            currentBookmarks.splice(existingBookmarkIndex, 1);
        } else {
            currentBookmarks.push({lineNumber: clickedLineNumber, content: lines[clickedLineNumber - 1]});
        }
        fieldGroup.dataset.bookmarks = JSON.stringify(currentBookmarks);
        renderLineMarkers(fieldGroup);
        saveTemplates();
    };
    
    highlightingContainer.appendChild(highlighter);
    highlightingContainer.appendChild(textarea);
    textareaWrapper.appendChild(gutter);
    textareaWrapper.appendChild(highlightingContainer);

// Створюємо допоміжну функцію для генерації розділювача
    const createSeparator = () => {
        const sep = document.createElement('div');
        sep.className = 'action-separator';
        return sep;
    };

    headerDiv.appendChild(nameInput);

    actionsDiv.appendChild(configToggleButton);
    actionsDiv.appendChild(createSeparator());
    
    // Група 1: Копіювання
    actionsDiv.appendChild(copyButton);
    actionsDiv.appendChild(pasteClipboardButton);
    
    actionsDiv.appendChild(createSeparator()); // --- РОЗДІЛЮВАЧ ---
    
    // Група 2: Вставка
    actionsDiv.appendChild(pasteLoginButton);
    
    actionsDiv.appendChild(createSeparator()); // --- РОЗДІЛЮВАЧ ---
    
    // Група 3: Інструменти
    actionsDiv.appendChild(searchToggleButton);
    
    actionsDiv.appendChild(createSeparator()); // --- РОЗДІЛЮВАЧ ---
    
    // Група 4: Небезпечні дії
    actionsDiv.appendChild(clearButton);
    actionsDiv.appendChild(deleteButton);
    
    headerDiv.appendChild(actionsDiv);
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';    
    
    fieldGroup.appendChild(headerDiv); 
    
    // Вставляємо панель пошуку ВІДРАЗУ після заголовка,
    // перед обгорткою тексту. Це забезпечить правильне "витіснення".
    fieldGroup.appendChild(configPanel);

    fieldGroup.appendChild(searchPanel); 
    
    fieldGroup.appendChild(textareaWrapper);
    fieldGroup.appendChild(resizeHandle);
    
    container.appendChild(fieldGroup); 
    
    initDraggableAndResizable(fieldGroup);
    renderLineMarkers(fieldGroup);
    
    if (window.textareaObserver) window.textareaObserver.observe(textarea);
    
    return fieldGroup;
}

function renderLineMarkers(fieldGroup) {
    const markerContainer = fieldGroup.querySelector('.line-marker-container');
    const textarea = fieldGroup.querySelector('textarea');
    if (!markerContainer || !textarea) return;

    // 1. Створюємо (або знаходимо) "дзеркало" для вимірювань
    let mirror = fieldGroup.querySelector('.textarea-mirror');
    if (!mirror) {
        mirror = document.createElement('div');
        mirror.className = 'textarea-mirror';
        mirror.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            visibility: hidden;
            height: auto;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            word-wrap: break-word;
            pointer-events: none;
            z-index: -100;
            box-sizing: border-box;
            border: 1px solid transparent; 
        `;
        textarea.parentNode.insertBefore(mirror, textarea);
    }

    // 2. Копіюємо стилі
    const style = window.getComputedStyle(textarea);
    
    mirror.style.width = textarea.clientWidth + 'px';
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontWeight = style.fontWeight;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.textTransform = style.textTransform;
    
    mirror.style.paddingLeft = style.paddingLeft;
    mirror.style.paddingRight = style.paddingRight;
    mirror.style.paddingTop = '0px'; 
    mirror.style.paddingBottom = '0px';

    markerContainer.innerHTML = ''; 
    const bookmarks = JSON.parse(fieldGroup.dataset.bookmarks || '[]');
    const lines = textarea.value.split('\n');
    
    // === ВИПРАВЛЕННЯ 1: Сінхронізуємо дефолтний відступ з CSS (було || 0, стало || 10) ===
    const paddingTop = parseFloat(style.paddingTop) || 10;
    
    const fontSize = parseFloat(style.fontSize) || 14;
    let singleLineHeight = parseFloat(style.lineHeight);
    if (isNaN(singleLineHeight)) singleLineHeight = fontSize * 1.5;

    bookmarks.forEach(bookmark => {
        const lineIndex = bookmark.lineNumber - 1;
        if (lineIndex >= lines.length) return;

        let measuredHeight = 0;

        // Вимірюємо висоту попереднього тексту
        if (lineIndex > 0) {
            const textBefore = lines.slice(0, lineIndex).join('\n');
            mirror.textContent = textBefore + '\u200B';
            measuredHeight = mirror.clientHeight;
        }

        // === ВИПРАВЛЕННЯ 2: Точне центрування без магічних чисел ===
        // Рахуємо чистий центр рядка
        const yPosition = measuredHeight + paddingTop + (singleLineHeight / 2) - 2; 
        
        const marker = document.createElement('div');
        marker.className = 'line-marker';
        marker.textContent = '●';
        
        // Ставимо точку по Y
        marker.style.top = `${yPosition}px`;
        
        // Додаємо зсув через CSS transform, щоб центр крапки співпав з yPosition
        // translateX(-50%) центрує по горизонталі (вже було у вас в CSS, але тут дублюємо для певності по Y)
        marker.style.transform = 'translate(-50%, -50%)'; 
        
        // Трохи підправляємо CSS самої крапки, щоб прибрати старий margin-top, якщо він там був
        marker.style.marginTop = '0';

        markerContainer.appendChild(marker);
    });
}

function addTemplate() {
    const container = document.getElementById('templates-grid-wrapper');
    
    // 1. Фіксуємо поточну висоту, щоб уникнути ривків
    container.style.height = container.offsetHeight + 'px';

    const newData = { name: '', content: '', width: '300px', height: '90px' };
    const newField = createTemplateField(newData);
    
    // Тимчасово вимикаємо анімацію появи
    newField.style.transition = 'none';
    container.appendChild(newField); 

    // 2. Розкладаємо шаблони (Tetris)
    packTemplates();
    
    // 3. Через мить (коли тетріс відпрацював) робимо магію
    setTimeout(() => {
        container.style.height = 'auto';
        newField.style.transition = ''; // Повертаємо анімацію
        
        // Фокусуємось без стрибка браузера
        const nameInput = newField.querySelector('.template-name-input');
        if (nameInput) nameInput.focus({ preventScroll: true });
        
        saveTemplates();

        // --- НОВА БЕЗПЕЧНА ПРОКРУТКА ---
        // Знаходимо саме той контейнер, який має скрол (біла картка)
        const scrollContainer = newField.closest('.content-card');

        if (scrollContainer) {
            // Отримуємо координати нового блоку і контейнера
            const elementRect = newField.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();

            // Рахуємо, де знаходиться блок відносно верхнього краю видимого контейнера
            const relativeTop = elementRect.top - containerRect.top;

            // Рахуємо центр: (відступ блоку) - (половина висоти екрану) + (половина висоти блоку)
            const centerOffset = relativeTop - (containerRect.height / 2) + (elementRect.height / 2);

            // Плавно крутимо тільки внутрішній контейнер
            scrollContainer.scrollTo({
                top: scrollContainer.scrollTop + centerOffset,
                behavior: 'smooth'
            });
        }
    }, 50);
}
    
    function saveTemplates() {
        const templates = [];
        // Зберігаємо в тому порядку, в якому вони йдуть в HTML (зліва направо, зверху вниз)
        document.querySelectorAll('#templates-grid-wrapper .template-field-group').forEach(group => {
            const nameInput = group.querySelector('.template-name-input');
            const textarea = group.querySelector('textarea');
            templates.push({
                name: nameInput ? nameInput.value : '',
                content: textarea ? textarea.value : '',
                width: group.style.width,
                height: group.style.height,
                bookmarks: JSON.parse(group.dataset.bookmarks || '[]')
            });
        });
        localStorage.setItem('textTemplates', JSON.stringify(templates));
    }

    function loadTemplates() {
        const templatesJson = localStorage.getItem('textTemplates');
        const templatesGrid = document.getElementById('templates-grid-wrapper');
        templatesGrid.innerHTML = ''; 
        if (templatesJson) {
            try {
                const templates = JSON.parse(templatesJson);
                if (Array.isArray(templates)) {
                    templates.forEach(template => {
    const field = createTemplateField(template);
    templatesGrid.appendChild(field); 
});
                }
            } catch (e) {
                console.error("Помилка завантаження:", e);
            }
        }
        // ВАЖЛИВО: Пакуємо все після завантаження
        setTimeout(packTemplates, 100);
        setTimeout(packTemplates, 500); // Контрольний постріл
    }
    
    function exportToFile() {
        const templatesJson = localStorage.getItem('textTemplates');
        if (!templatesJson || templatesJson === '[]') {
            alert('Немає шаблонів для експорту!');
            return;
        }
        const blob = new Blob([templatesJson], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'templates-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    function handleFileImport(event) {
        const fileInput = event.target;
        if (!fileInput.files.length) return;
        const file = fileInput.files[0];

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const templates = JSON.parse(e.target.result);
                if (!Array.isArray(templates)) throw new Error("Некоректний формат");
                
                const templatesGrid = document.getElementById('templates-grid-wrapper');
                templatesGrid.innerHTML = ''; // Очищуємо екран перед імпортом
                
                templates.forEach(template => {
                    createTemplateField(template); // Створюємо шаблони
                });
                
                saveTemplates(); // Зберігаємо в браузер
                
                // Чекаємо 50мс, щоб браузер "побачив" блоки, і розставляємо їх Тетрісом
                setTimeout(() => {
                    packTemplates();
                    showNotification("Шаблони успішно імпортовано!");
                }, 50);

            } catch (error) {
                console.error("Помилка імпорту:", error);
                alert('Помилка! Не вдалося прочитати файл.');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    }

// --- ФУНКЦІЇ ІСТОРІЇ ---
function toggleHistory() {
    const wrapper = document.getElementById('history-content-wrapper');
    const btn = document.getElementById('history-toggle-btn');
    const isOpen = wrapper.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    
    // Ми ПОВНІСТЮ видалили блок із setTimeout та scrollIntoView.
    // Тепер історія просто плавно відкриється вниз без ривків екрану!
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    renderHistory(history);
}

function addToHistory(login, originalName) {
    let history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    history = history.filter(item => item.login !== login);
    history.unshift({ login, originalName });
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('loginHistory', JSON.stringify(history));
    renderHistory(history);
}

function renderHistory(history) {
    const listContainer = document.getElementById('history-list');
    const countSpan = document.getElementById('history-count');
    const section = document.querySelector('.history-section');
    const clearBtn = document.getElementById('clear-history-btn');
    
    // Оновлюємо лічильник
    if (countSpan) countSpan.textContent = history.length;
    
    // Очищуємо список
    listContainer.innerHTML = '';

    // Блок ЗАВЖДИ показуємо
    section.style.display = 'block'; 

    // Якщо пусто - пишемо повідомлення і ховаємо кнопку "смітник"
    if (history.length === 0) {
        listContainer.innerHTML = '<div class="empty-history-msg">Тут поки що пусто...</div>';
        if(clearBtn) clearBtn.style.display = 'none'; // Ховаємо смітник, бо нема що чистити
        return;
    }
    
    // Якщо не пусто - показуємо смітник
    if(clearBtn) clearBtn.style.display = 'flex';

    // Малюємо список
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">
                <span style="font-size: 0.95em;">${item.login}</span>
                <small style="color:var(--tab-inactive-text); font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${item.originalName}
                </small>
            </div>
            <button class="history-copy-btn" onclick="copyFromHistory('${item.login}')" title="Копіювати знову">
                <i class="fas fa-copy"></i>
            </button>
        `;
        listContainer.appendChild(div);
    });
}

function copyFromHistory(text) {
    navigator.clipboard.writeText(text).then(() => showNotification(`Скопійовано: ${text}`));
}

document.getElementById('clear-history-btn').addEventListener('click', () => {
    if(confirm('Очистити історію?')) {
        localStorage.removeItem('loginHistory');
        renderHistory([]);
    }
});

// === ЗМІННІ ДЛЯ ГЕНЕРАТОРА КОНФІГІВ ===
let OLT_CONFIGS = { ultranet: [], energy: [] };
let OLT_TEMPLATES = {}; 
let PON_ONU_TEMPLATES = { gpon: "", epon: "" }; // <--- НОВЕ: Зберігаємо PON-ONU тут

function loadOltConfigs() {
    fetch('olt_configs.txt?v=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error("Файл olt_configs.txt не знайдено");
            return res.text();
        })
        .then(text => {
            OLT_CONFIGS = { ultranet: [], energy: [] };
            OLT_TEMPLATES = {};
            PON_ONU_TEMPLATES = { gpon: "", epon: "" }; // Очищаємо перед новим завантаженням
            
            let currentSection = null; 
            let currentTemplateName = null;

            const lines = text.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return; 

                // 1. Шукаємо шаблони базових конфігів
                const templateMatch = trimmed.match(/^\[TEMPLATE:\s*(.+)\]$/i);
                if (templateMatch) {
                    currentSection = 'template';
                    currentTemplateName = templateMatch[1].trim();
                    OLT_TEMPLATES[currentTemplateName] = ''; 
                    return;
                }

                // 2. Шукаємо секції PON-ONU
                if (trimmed.toUpperCase() === '[GPON PON-ONU]') { currentSection = 'gpon_pon_onu'; return; }
                if (trimmed.toUpperCase() === '[EPON PON-ONU]') { currentSection = 'epon_pon_onu'; return; }

                // 3. Шукаємо списки комутаторів
                if (trimmed === '[Ultranet]') { currentSection = 'ultranet'; return; } 
                else if (trimmed === '[ISP Energy]') { currentSection = 'energy'; return; }

                // Записуємо дані у відповідні місця
                if (currentSection === 'template' && currentTemplateName) {
                    OLT_TEMPLATES[currentTemplateName] += line + '\n';
                } else if (currentSection === 'gpon_pon_onu') {
                    PON_ONU_TEMPLATES.gpon += line + '\n';
                } else if (currentSection === 'epon_pon_onu') {
                    PON_ONU_TEMPLATES.epon += line + '\n';
                } else if (currentSection === 'ultranet' || currentSection === 'energy') {
                    const splitIndex = trimmed.indexOf('=');
                    if (splitIndex !== -1) {
                        const oltName = trimmed.substring(0, splitIndex).trim();
                        const rest = trimmed.substring(splitIndex + 1).trim();
                        
                        let tplName = rest;
                        let defVlan = "";
                        
                        const vlanMatch = rest.match(/(.*?)\s+(\d+)$/);
                        if (vlanMatch) {
                            tplName = vlanMatch[1].trim(); 
                            defVlan = vlanMatch[2].trim(); 
                        }
                        
                        OLT_CONFIGS[currentSection].push({ 
                            name: oltName, 
                            templateName: tplName, 
                            defaultVlan: defVlan 
                        });
                    }
                }
            });
        })
        .catch(err => console.log("Помилка завантаження конфігів ОЛТ:", err));
}

// === ЗМІННІ ДЛЯ ДОДАТКОВИХ КОНФІГІВ (PON-ONU) ===
let EXTRA_CONFIG_TEMPLATES = { gpon: "", epon: "" };

    document.addEventListener('DOMContentLoaded', () => {
	// 1. Відновлення порядку при завантаженні
    function loadTabOrder() {
        const tabsContainer = document.querySelector('.tabs');
        if (!tabsContainer) return;
        
        let savedOrder = null;
        try {
            savedOrder = JSON.parse(localStorage.getItem('tabOrder'));
        } catch (e) {}

        if (!savedOrder || !Array.isArray(savedOrder)) return;

        const currentTabs = Array.from(tabsContainer.children);
        const tabsMap = {}; 
        
        // Створюємо мапу існуючих вкладок
        currentTabs.forEach(tab => {
            if (tab.dataset.tab) tabsMap[tab.dataset.tab] = tab;
        });

        // Вставляємо вкладки у збереженому порядку
        savedOrder.forEach(tabId => {
            if (tabsMap[tabId]) {
                tabsContainer.appendChild(tabsMap[tabId]);
                delete tabsMap[tabId]; // Видаляємо з мапи, щоб не дублювати
            }
        });

        // Якщо є нові вкладки (яких немає в пам'яті), додаємо їх в кінець
        Object.values(tabsMap).forEach(tab => tabsContainer.appendChild(tab));
    }

    // 2. Збереження порядку
    function saveTabOrder() {
        const tabs = document.querySelectorAll('.tab-button');
        const order = Array.from(tabs).map(tab => tab.dataset.tab);
        localStorage.setItem('tabOrder', JSON.stringify(order));
    }

    // 3. Ініціалізація перетягування
    function initTabDragging() {
        const tabs = document.querySelectorAll('.tab-button');
        const tabsContainer = document.querySelector('.tabs');
        let draggedTab = null;

        tabs.forEach(tab => {
            // Робимо елемент перетягуваним
            tab.setAttribute('draggable', 'true');

            // ПОЧАТОК: Коли почали тягнути
            tab.addEventListener('dragstart', (e) => {
                draggedTab = tab;
                e.dataTransfer.effectAllowed = 'move';
                
                // Додаємо клас з затримкою, щоб він не застосувався до "привида", якого малює браузер
                setTimeout(() => tab.classList.add('dragging'), 0);
            });

            // КІНЕЦЬ: Коли відпустили
            tab.addEventListener('dragend', () => {
                draggedTab = null;
                tab.classList.remove('dragging');
                saveTabOrder(); // Зберігаємо новий порядок
            });

            // Забороняємо події на дочірніх елементах (іконках), щоб не збивати drag
            tab.addEventListener('dragover', (e) => e.preventDefault());
        });

        // ЛОГІКА СОРТУВАННЯ (коли тягнемо НАД контейнером)
        tabsContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); // Дозволяємо дроп
            
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem) return;

            const afterElement = getDragAfterElement(tabsContainer, e.clientX);
            
            if (afterElement == null) {
                tabsContainer.appendChild(draggingItem);
            } else {
                tabsContainer.insertBefore(draggingItem, afterElement);
            }
        });
    }

    // Математика: визначаємо найближчий елемент
    function getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.tab-button:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - (box.left + box.width / 2);
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // ЗАПУСК
    loadTabOrder();
    initTabDragging();
    setupTabs();
	loadHistory();
    loadCommandsFromFile();
    loadCalcAutoClearState();
    loadOltConfigs();

// Обробник для кнопки "Поточна дата"
document.getElementById('set-start-now-btn').addEventListener('click', () => {
    const now = new Date();
    document.getElementById('start-date').value = formatDate(now);
    // РЯДОК З ЧАСОМ ВИДАЛЕНО: Тепер час залишається таким, яким був (введеним вручну або 00:00)
    handleInputAndTimer(); // Оновлюємо розрахунок
});

document.getElementById('set-end-time-now-btn').addEventListener('click', () => {
    const now = new Date();
    // Форматуємо час у формат HH:MM
    const timeString = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    
    // Встановлюємо у поле КІНЦЕВОГО часу (end-time)
    document.getElementById('end-time').value = timeString;
    handleInputAndTimer(); // Оновлюємо розрахунок
});

// Універсальна функція для додавання періоду до кінцевої дати
const addDurationToEndDate = (monthsToAdd, yearsToAdd) => {
    const startDateValue = document.getElementById('start-date').value;
    
    if (!startDateValue) {
        showNotification("Спочатку встановіть початкову дату!");
        return;
    }

    // Безпечно розбиваємо дату, щоб уникнути зсувів через часові пояси
    const [year, month, day] = startDateValue.split('-');
    const newEndDate = new Date(year, month - 1, day);
    
    // Розраховуємо нову дату
    if (monthsToAdd > 0) {
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);
    }
    if (yearsToAdd > 0) {
        newEndDate.setFullYear(newEndDate.getFullYear() + yearsToAdd);
    }

    // Встановлюємо ТІЛЬКИ нову дату. 
    // Ми більше не чіпаємо 'start-time' і не перезаписуємо 'end-time'.
    document.getElementById('end-date').value = formatDate(newEndDate);
    
    handleInputAndTimer(); // Оновлюємо розрахунок
};

// Прив'язка до кнопок
document.getElementById('add-6-months-btn').addEventListener('click', () => addDurationToEndDate(6, 0));
document.getElementById('add-7-months-btn').addEventListener('click', () => addDurationToEndDate(7, 0));
document.getElementById('add-1-year-btn').addEventListener('click', () => addDurationToEndDate(0, 1));
    
    document.getElementById('fullNameInput').addEventListener('input', generateLogins); 
    document.getElementById('add-template-button').onclick = addTemplate;
    
    // Спочатку завантажуємо шаблони
    loadTemplates();
	
	// Функція, яка пробігається по всіх шаблонах і оновлює маркери
    function refreshAllMarkers() {
        document.querySelectorAll('.template-field-group').forEach(group => {
            renderLineMarkers(group);
        });
        packTemplates(); // Заодно і тетріс поправимо
    }

    // 1. Чекаємо, поки завантажаться шрифти (Fira Code)
    document.fonts.ready.then(() => {
        refreshAllMarkers();
        // На всяк випадок ще раз через мить, для повільних браузерів
        setTimeout(refreshAllMarkers, 100);
        setTimeout(refreshAllMarkers, 500);
    });
    
    // 2. Додатковий наглядач за зміною розмірів елементів (ResizeObserver)
    // Це вирішить проблему назавжди: якщо з'явиться скрол, маркери перемалюються самі
    window.textareaObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            // entry.target - це textarea
            const fieldGroup = entry.target.closest('.template-field-group');
            if (fieldGroup) {
                renderLineMarkers(fieldGroup);
            }
        }
    });

    // Підключаємо наглядач до всіх існуючих textarea
    setTimeout(() => {
        document.querySelectorAll('.template-field-group textarea').forEach(textarea => {
            window.textareaObserver.observe(textarea);
        });
    }, 200);
	
	window.addEventListener('resize', debounce(() => {
        packTemplates();
    }, 200)); 

// Цей код один раз при завантаженні встановлює розміри для ВСІХ вкладок
document.querySelectorAll('.container[data-content]').forEach(container => {
    const defaultWidth = container.getAttribute('data-default-width') || '100%';
    const defaultHeight = container.getAttribute('data-default-height') || '600px';
    container.style.setProperty('--local-width', defaultWidth);
    container.style.setProperty('--local-height', defaultHeight);
});	
    
    const importFileInput = document.getElementById('import-file-input');
    const importButton = document.getElementById('import-templates-button');
    const exportButton = document.getElementById('export-templates-button');
	const clearAllButton = document.getElementById('clear-all-templates-button');
    
    exportButton.onclick = exportToFile;
    importButton.onclick = () => importFileInput.click();
    importFileInput.addEventListener('change', handleFileImport);
	clearAllButton.onclick = clearAllTemplates;

    const initialTab = localStorage.getItem('activeTab') || 'login-generator';
    if (initialTab === 'login-generator') generateLogins(); 
    if (initialTab === 'gpon-commands') {
         const deviceSelect = document.getElementById('device-type');
         if (deviceSelect) displayCommands(deviceSelect.value);
    }
	
// === ВИПРАВЛЕНИЙ РОЗУМНИЙ СНІГОПАД ===
    function createSnowflakes() {
        const container = document.getElementById('snow-container');
        
        // Перевірка, чи існує контейнер в HTML
        if (!container) {
            console.error("Помилка: Не знайдено <div id='snow-container'>");
            return;
        }

        const snowflakeCount = 45; 
        // Я змінив назву ключа на 'snow-v5', щоб скинути старі помилкові дані
        const STORAGE_KEY = 'snow-v5'; 

        let snowData = null;
        
        try {
            // Пробуємо дістати дані
            snowData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            console.log("Помилка читання даних, створюємо нові");
        }

        // Якщо даних немає або їх кількість не співпадає — генеруємо заново
        if (!snowData || !Array.isArray(snowData) || snowData.length !== snowflakeCount) {
            snowData = [];
            const characters = ['❄', '❅', '❆'];

            for (let i = 0; i < snowflakeCount; i++) {
                const char = characters[Math.floor(Math.random() * characters.length)];
                const size = Math.floor(Math.random() * 15 + 10) + 'px';
                const leftPos = Math.floor(Math.random() * 100) + 'vw';
                const opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
                
                // Тривалість анімації
                const durationFall = (Math.random() * 10 + 10).toFixed(2) + 's'; // Повільніше (10-20с)
                const durationSway = (Math.random() * 4 + 3).toFixed(2) + 's';
                
                // Затримка (від'ємна, щоб сніг був відразу на екрані)
                // Генеруємо від -20s до 0s
                const delayFall = (Math.random() * -20).toFixed(2) + 's';
                const delaySway = (Math.random() * -5).toFixed(2) + 's';

                snowData.push({
                    char, size, leftPos, opacity, 
                    durationFall, durationSway, 
                    delayFall, delaySway
                });
            }

            // Зберігаємо нові чисті дані
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snowData));
        }

        // Очищаємо і малюємо
        container.innerHTML = ''; 
        snowData.forEach(data => {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            flake.textContent = data.char; // Використовуємо textContent замість innerHTML (швидше)
            
            flake.style.fontSize = data.size;
            flake.style.left = data.leftPos;
            flake.style.opacity = data.opacity;
            
            // Встановлюємо анімацію
            flake.style.animationDuration = `${data.durationFall}, ${data.durationSway}`;
            flake.style.animationDelay = `${data.delayFall}, ${data.delaySway}`;
            
            container.appendChild(flake);
        });
    }

    // ВАЖЛИВО: Цей рядок запускає сніг!
    createSnowflakes();
	
	// === ЛОГІКА КНОПОК ПРОКРУТКИ ===
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    const scrollDownBtn = document.getElementById('scroll-down-btn');
    // Знаходимо елемент, який реально скролиться (content-card всередині text-templates)
    const templateScrollContainer = document.querySelector('.container[data-content="text-templates"] .content-card');

    if (scrollUpBtn && scrollDownBtn && templateScrollContainer) {
        
        // Функція перевірки видимості кнопок
        const checkScrollButtons = () => {
            const scrollTop = templateScrollContainer.scrollTop;
            const scrollHeight = templateScrollContainer.scrollHeight;
            const clientHeight = templateScrollContainer.clientHeight;

            // Логіка для кнопки "Вгору": показуємо, якщо прокрутили більше 100px
            if (scrollTop > 100) {
                scrollUpBtn.classList.add('visible');
            } else {
                scrollUpBtn.classList.remove('visible');
            }

            // Логіка для кнопки "Вниз": показуємо, якщо до низу більше 100px
            // scrollHeight - scrollTop - clientHeight = відстань до низу
            if (scrollHeight - scrollTop - clientHeight > 100) {
                scrollDownBtn.classList.add('visible');
            } else {
                scrollDownBtn.classList.remove('visible');
            }
        };

        // Слухаємо подію скролу (використовуємо debounce/throttle якщо є, або просто так)
        templateScrollContainer.addEventListener('scroll', checkScrollButtons);
        
        // Також перевіряємо при зміні розміру вікна або додаванні шаблонів
        window.addEventListener('resize', checkScrollButtons);
        // Запускаємо перевірку періодично (на випадок зміни контенту JS-ом)
        setInterval(checkScrollButtons, 1000);

        // Клік "Вгору"
        scrollUpBtn.addEventListener('click', () => {
            templateScrollContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Клік "Вниз"
        scrollDownBtn.addEventListener('click', () => {
            templateScrollContainer.scrollTo({
                top: templateScrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        });
        
        // Первинна перевірка
        checkScrollButtons();
    }
});

function packTemplates() {
    const container = document.getElementById('templates-grid-wrapper');
	
	if (container.offsetWidth === 0 || container.offsetParent === null) {
        return;
    }
	
    const templates = Array.from(container.querySelectorAll('.template-field-group'));
    
    if (templates.length === 0) {
        container.style.minHeight = '500px';
        return;
    }

    const containerWidth = Math.floor(container.offsetWidth);
    const GAP = 8; 

    const placedRects = [];
    let maxContentHeight = 0;

    // Перевірка на перетин
    const checkCollision = (rect) => {
        for (let r of placedRects) {
            if (rect.x < r.x + r.w + GAP &&
                rect.x + rect.w + GAP > r.x &&
                rect.y < r.y + r.h + GAP &&
                rect.y + rect.h + GAP > r.y) {
                return true;
            }
        }
        return false;
    };

    templates.forEach(template => {
        const w = Math.round(template.offsetWidth);
        const h = Math.round(template.offsetHeight);
        
        let found = false;
        let bestX = 0;
        let bestY = 0;

        let candidatePoints = [{x: 0, y: 0}]; 
        placedRects.forEach(r => {
            candidatePoints.push({ x: r.x + r.w + GAP, y: r.y });
            candidatePoints.push({ x: 0, y: r.y + r.h + GAP });
            candidatePoints.push({ x: r.x, y: r.y + r.h + GAP });
        });

        candidatePoints.sort((a, b) => a.y - b.y || a.x - b.x);

        for (let p of candidatePoints) {
            if (p.x + w <= containerWidth) {
                if (!checkCollision({ x: p.x, y: p.y, w: w, h: h })) {
                    bestX = p.x;
                    bestY = p.y;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            let maxY = 0;
            placedRects.forEach(r => maxY = Math.max(maxY, r.y + r.h + GAP));
            bestX = 0;
            bestY = maxY;
        }

        // --- ВИПРАВЛЕННЯ ---
        // 1. Скидаємо top/left, щоб вони не конфліктували
        template.style.top = '0px';
        template.style.left = '0px';

        // 2. Використовуємо transform (це дає плавну анімацію)
        // 3. ВАЖЛИВО: Math.round() прибирає розмиття
        template.style.transform = `translate(${Math.round(bestX)}px, ${Math.round(bestY)}px)`;
        
        placedRects.push({ x: bestX, y: bestY, w: w, h: h });
        maxContentHeight = Math.max(maxContentHeight, bestY + h);
    });

    const finalHeight = maxContentHeight + 150; 
    container.style.height = finalHeight + 'px';    
    container.style.minHeight = finalHeight + 'px'; 
}

// Додаткова страховка: коли ВСЕ завантажиться (включно зі шрифтами)
window.addEventListener('load', () => {
    // Якщо активна вкладка - шаблони, пакуємо їх
    if (localStorage.getItem('activeTab') === 'text-templates') {
        setTimeout(packTemplates, 100);
    }
});

/* === ПРАВИЛЬНИЙ JS КАЛЬКУЛЯТОРА (З ПРІОРИТЕТАМИ ТА ІСТОРІЄЮ) === */

let calcCurrent = '0';
let calcExpression = []; 
let calcReset = false;
let calcHistory = []; 
let calcComputed = false; // НОВИЙ ПРАПОРЕЦЬ: вказує, що число на екрані отримано в результаті %, √ або x²

function calcUpdateDisplay() {
    const display = document.getElementById('calc-current-result');
    const prevDisplay = document.getElementById('calc-prev-operation');
    
    if(display) {
        display.innerText = calcCurrent.toString().replace('.', ',');
    }
    
    if(prevDisplay) {
        let exprStr = calcExpression.join(' ').replace(/\*/g, '×').replace(/\//g, '÷');
        prevDisplay.innerText = exprStr;
        
        // НОВЕ: Автоматично прокручуємо довгий рядок в самий кінець (вправо),
        // щоб завжди бачити останню дію, яку ми ввели.
        prevDisplay.scrollLeft = prevDisplay.scrollWidth;
    }
    
    startCalcAutoClearTimer();
}

function calcAppend(num) {
    if (calcCurrent === '0' || calcCurrent === 'Помилка' || calcReset) {
        calcCurrent = num === '.' ? '0.' : num;
        calcReset = false;
        calcComputed = false; // Скидаємо прапорець, бо користувач ввів число вручну
    } else {
        if (num === '.' && calcCurrent.includes('.')) return;
        if (calcCurrent.length > 15) return; 
        calcCurrent += num;
    }
    calcUpdateDisplay();
}

function calcAppendOperator(op) {
    if (calcCurrent === 'Помилка') return;

    // Якщо ми тільки що натиснули "=" і починаємо новий вираз з результату
    if (calcExpression.length === 0 && calcReset && !calcComputed) {
        calcExpression.push(calcCurrent);
    } 
    // ВИПРАВЛЕНО: Якщо користувач ввів число АБО щойно обчислив %, √, x²
    else if (!calcReset || calcComputed) {
        calcExpression.push(calcCurrent);
    } 
    // ЗМІНА ЗНАКУ: Якщо натиснули один знак, а потім відразу інший (напр. "+" потім "*")
    else {
        if (calcExpression.length > 0 && isNaN(calcExpression[calcExpression.length - 1])) {
            calcExpression[calcExpression.length - 1] = op;
            calcUpdateDisplay();
            return;
        }
    }
    
    calcExpression.push(op);
    calcReset = true;
    calcComputed = false; // Після додавання знаку скидаємо прапорець
    calcUpdateDisplay();
}

function calcCalculate() {
    if (calcExpression.length === 0 || calcCurrent === 'Помилка') return;
    
    // ВИПРАВЛЕНО: Завжди додаємо поточне число, якщо ми його вводили або обчислили (%)
    if (!calcReset || calcComputed) {
        calcExpression.push(calcCurrent);
    } 

    // Запобіжник: якщо вираз закінчується знаком (+, -, *), просто ігноруємо цей знак
    if (calcExpression.length > 0 && isNaN(calcExpression[calcExpression.length - 1])) {
        calcExpression.pop();
    }

    if (calcExpression.length === 0) return;

    let evalStr = calcExpression.join(' ');
    
    try {
        let result = Function('"use strict";return (' + evalStr + ')')();
        
        if (!isFinite(result) || isNaN(result)) {
            calcCurrent = "Помилка";
        } else {
            result = parseFloat(result.toFixed(10));
            let historyExpr = evalStr.replace(/\*/g, '×').replace(/\//g, '÷') + ' =';
            addToCalcHistory(historyExpr, result.toString());
            calcCurrent = result.toString();
        }
    } catch (e) {
        calcCurrent = "Помилка";
    }

    calcExpression = [];
    calcReset = true;
    calcComputed = false; // Вираз завершено
    calcUpdateDisplay();
}

function calcSquare() {
    if (calcCurrent === 'Помилка') return;
    const val = parseFloat(calcCurrent);
    const res = parseFloat(Math.pow(val, 2).toFixed(10));
    
    addToCalcHistory(`sqr(${val}) =`, res.toString());
    calcCurrent = res.toString();
    calcReset = true;
    calcComputed = true; // Це математичний результат
    calcUpdateDisplay();
}

function calcRoot() {
    if (calcCurrent === 'Помилка') return;
    const val = parseFloat(calcCurrent);
    if (val < 0) {
        calcCurrent = "Помилка";
    } else {
        const res = parseFloat(Math.sqrt(val).toFixed(10));
        addToCalcHistory(`√(${val}) =`, res.toString());
        calcCurrent = res.toString();
    }
    calcReset = true;
    calcComputed = true; // Це математичний результат
    calcUpdateDisplay();
}

function calcPercent() {
    if (calcCurrent === 'Помилка') return;
    const current = parseFloat(calcCurrent);
    let res;

    // Логіка відсотків: віднімання/додавання відсотків від суми (напр. 100 - 10%)
    if (calcExpression.length >= 2) {
        let lastOp = calcExpression[calcExpression.length - 1];
        if (lastOp === '+' || lastOp === '-') {
            let prevVal = parseFloat(calcExpression[calcExpression.length - 2]);
            res = prevVal * (current / 100);
        } else {
            res = current / 100;
        }
    } else {
        res = current / 100;
    }
    
    res = parseFloat(res.toFixed(10));
    calcCurrent = res.toString();
    
    calcReset = true; 
    calcComputed = true; // ВАЖЛИВО! Це вказує '=' та знакам +, що це число треба використати
    calcUpdateDisplay();
}

function calcClear() {
    calcCurrent = '0';
    calcExpression = [];
    calcReset = false;
    calcComputed = false;
    calcUpdateDisplay();
}

function calcDelete() {
    if (calcCurrent === 'Помилка' || calcReset) {
        calcClear();
        return;
    }
    if (calcCurrent.length === 1 || (calcCurrent.length === 2 && calcCurrent.startsWith('-'))) {
        calcCurrent = '0';
    } else {
        calcCurrent = calcCurrent.slice(0, -1);
    }
    calcUpdateDisplay();
}

function copyCalcResult() {
    if (calcCurrent === 'Помилка') return;
    navigator.clipboard.writeText(calcCurrent.replace('.', ','));
    const btn = document.querySelector('.calc-copy-btn');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check" style="color:var(--success-color)"></i>';
    setTimeout(() => btn.innerHTML = originalHtml, 1200);
}

/* === АВТООЧИЩЕННЯ ЕКРАНУ КАЛЬКУЛЯТОРА === */
let isCalcAutoClearEnabled = false;
let calcAutoClearTimeout = null;

function toggleCalcAutoClear() {
    const btn = document.getElementById('calc-auto-clear-btn');
    isCalcAutoClearEnabled = !isCalcAutoClearEnabled; 
    
    localStorage.setItem('calcAutoClearEnabled', isCalcAutoClearEnabled);
    btn.classList.toggle('active', isCalcAutoClearEnabled);
    
    if (!isCalcAutoClearEnabled && calcAutoClearTimeout) {
        clearTimeout(calcAutoClearTimeout);
    }
}

function loadCalcAutoClearState() {
    const savedState = localStorage.getItem('calcAutoClearEnabled');
    const btn = document.getElementById('calc-auto-clear-btn');
    
    if (savedState === 'true') {
        isCalcAutoClearEnabled = true;
        if (btn) btn.classList.add('active');
    } else {
        isCalcAutoClearEnabled = false;
        if (btn) btn.classList.remove('active');
    }
}

function startCalcAutoClearTimer() {
    if (!isCalcAutoClearEnabled) return;

    clearTimeout(calcAutoClearTimeout);
    
    if (calcCurrent !== '0' && calcCurrent !== 'Помилка') {
        calcAutoClearTimeout = setTimeout(() => {
            if (calcCurrent !== '0' && calcCurrent !== 'Помилка') {
                calcCurrent = '0'; 
                calcUpdateDisplay(); 
                showAutoClearSuccess();
            }
        }, 7000);
    }
}

function showAutoClearSuccess() {
    const btn = document.getElementById('calc-auto-clear-btn');
    const icon = document.getElementById('calc-auto-clear-icon');
    
    if (!btn || !icon) return;

    icon.className = 'fas fa-check';
    btn.classList.add('just-cleared');

    setTimeout(() => {
        icon.className = 'fas fa-eraser';
        btn.classList.remove('just-cleared');
    }, 1500);
}

/* === ЛОГІКА ІСТОРІЇ КАЛЬКУЛЯТОРА === */
function calcToggleHistory() {
    const panel = document.getElementById('calc-history-panel');
    panel.classList.toggle('open');
}

function addToCalcHistory(expression, result) {
    calcHistory.unshift({ op: expression, res: result });
    if (calcHistory.length > 20) calcHistory.pop(); 
    renderCalcHistory();
}

function renderCalcHistory() {
    const list = document.getElementById('calc-history-list');
    if (calcHistory.length === 0) {
        list.innerHTML = '<div class="hist-empty">Історії немає</div>';
        return;
    }
    
    list.innerHTML = calcHistory.map((item, index) => `
        <div class="hist-item" onclick="useCalcHistoryItem(${index})">
            <div class="hist-op">${item.op.replace('.', ',')}</div>
            <div class="hist-res">${item.res.replace('.', ',')}</div>
        </div>
    `).join('');
}

function useCalcHistoryItem(index) {
    const item = calcHistory[index];
    calcCurrent = item.res;
    calcExpression = []; 
    calcReset = true; 
    calcUpdateDisplay();
    calcToggleHistory(); 
}

function calcClearHistory() {
    calcHistory = [];
    renderCalcHistory();
}

/* === РОЗШИРЕНЕ УПРАВЛІННЯ З КЛАВІАТУРИ === */
document.addEventListener('keydown', (e) => {
    // 1. Ігноруємо натискання, якщо користувач друкує текст у генераторі логінів чи шаблонах
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // 2. НОВЕ: Швидке копіювання (Ctrl+C або Cmd+C на Mac)
    // Перевіряємо як латинську 'c', так і кириличну 'с' (для української розкладки)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С')) {
        e.preventDefault(); // Зупиняємо стандартну поведінку браузера
        copyCalcResult();   // Викликаємо вашу існуючу функцію копіювання (з галочкою)
        return;             // Виходимо, щоб не обробляти інші клавіші
    }

    // 3. Звичайні кнопки калькулятора
    if (e.key >= '0' && e.key <= '9') calcAppend(e.key);
    if (e.key === '.' || e.key === ',') calcAppend('.');
    
    if (e.key === '+') calcAppendOperator('+');
    if (e.key === '-') calcAppendOperator('-');
    if (e.key === '*' || e.key === 'x' || e.key === 'X') calcAppendOperator('*');
    if (e.key === '/') calcAppendOperator('/');
    
    if (e.key === 'Enter' || e.key === '=') { 
        e.preventDefault(); // Забороняє браузеру робити "Submit" сторінки
        calcCalculate(); 
    }
    
    if (e.key === '%') calcPercent(); 
    
    if (e.key === 'Backspace') calcDelete();      
    if (e.key === 'Escape' || e.key === 'Delete') calcClear(); // І Esc, і Delete очищають екран
});
// === РОЗУМНИЙ ПАРСЕР (ЧИТАЄ ЗНИЗУ ВГОРУ) ===
    function initChangelog() {
        fetch('changelog.txt?v=' + Date.now())
            .then(response => {
                if (!response.ok) throw new Error("Файл не знайдено");
                return response.text();
            })
            .then(text => {
                // 1. Розбиваємо весь текст на рядки
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                
                // 2. Групуємо рядки у "блоки версій"
                let versions = [];
                let currentVer = null;

                lines.forEach(line => {
                    // Перевіряємо, чи це заголовок версії (наприклад "v1.0")
                    if (line.match(/^v\d/i)) {
                        // Якщо вже збирали попередню версію, зберігаємо її
                        if (currentVer) versions.push(currentVer);
                        
                        // Починаємо нову версію
                        currentVer = {
                            title: line,
                            changes: []
                        };
                    } else if (currentVer) {
                        // Якщо це не заголовок, значить це опис змін — додаємо до поточної версії
                        currentVer.changes.push(line);
                    }
                });
                // Не забуваємо додати останню версію, яка була в циклі
                if (currentVer) versions.push(currentVer);

                // === МАГІЯ ТУТ ===
                // Якщо ви пишете нові версії ВНИЗУ файлу, нам треба перевернути масив,
                // щоб на сайті найновіша (остання в файлі) стала першою.
                versions.reverse(); 

                // 3. Відображення (Рендеринг)
                const numEl = document.getElementById('ver-number');
                const dateEl = document.getElementById('ver-date');
                const listContainer = document.getElementById('ver-list');
                
                if (listContainer) listContainer.innerHTML = '';
                if (dateEl) dateEl.textContent = ''; // Ховаємо дату в шапці

                versions.forEach((ver, index) => {
                    // Першу (тепер вже найновішу) версію ставимо в заголовок пігулки
                    if (index === 0) {
                        if (numEl) numEl.textContent = ver.title;
                    } else {
                        // Інші версії відокремлюємо роздільником
                        const separator = document.createElement('li');
                        separator.style.display = 'block';
                        separator.innerHTML = `<div class="history-separator">${ver.title}</div>`;
                        listContainer.appendChild(separator);
                    }

                    // Виводимо зміни цієї версії
                    ver.changes.forEach(changeText => {
                        const li = document.createElement('li');
                        li.className = 'log-item';

                        const colonIndex = changeText.indexOf(':');
                        if (colonIndex > -1) {
                            const type = changeText.substring(0, colonIndex).trim().toUpperCase();
                            const desc = changeText.substring(colonIndex + 1).trim();

                            let badgeClass = 'upd';
                            if (type === 'NEW') badgeClass = 'new';
                            if (type === 'FIX') badgeClass = 'fix';
                            if (type === 'DEL') badgeClass = 'fix';

                            li.innerHTML = `
                                <span class="badge ${badgeClass}">${type}</span>
                                <span>${desc}</span>
                            `;
                        } else {
    // Додаємо порожній span, щоб текст інструкції змістився вправо (у другу колонку сітки)
    li.innerHTML = `<span></span><span class="log-sub-description">${changeText}</span>`;
}
                        listContainer.appendChild(li);
                    });
                });
            })
            .catch(err => {
                console.warn(err);
                document.getElementById('ver-number').textContent = "v?.?";
            });
    }


    document.addEventListener('DOMContentLoaded', initChangelog);

// === КЕРУВАННЯ БОКОВИМИ ПІГУЛКАМИ ===
document.addEventListener('DOMContentLoaded', () => {
    const allPills = document.querySelectorAll('.version-pill, .extension-pill');

    document.addEventListener('click', (e) => {
        // 1. Шукаємо, чи був клік всередині пігулки взагалі
        const clickedPill = e.target.closest('.version-pill, .extension-pill');

        if (clickedPill) {
            // Перевіряємо, чи ця пігулка зараз відкрита
            const isOpen = clickedPill.classList.contains('is-open');
            
            // Перевіряємо, чи клік припав САМЕ НА ІКОНКУ
            const clickedIcon = e.target.closest('.version-emoji, .extension-emoji');

            if (isOpen) {
                // Якщо пігулка ВЖЕ ВІДКРИТА...
                if (clickedIcon) {
                    // ...і ми клікнули по іконці -> ЗАКРИВАЄМО її
                    clickedPill.classList.remove('is-open');
                }
                // Якщо клікнули не по іконці (а по тексту, скролу, кнопці) -> нічого не робимо (залишається відкритою)
                
            } else {
                // Якщо пігулка БУЛА ЗАКРИТА -> відкриваємо її (і закриваємо інші)
                allPills.forEach(p => p.classList.remove('is-open'));
                clickedPill.classList.add('is-open');
            }
            
        } else {
            // 2. Якщо клік був ЗА МЕЖАМИ пігулок (по фону сайту) -> закриваємо всі
            allPills.forEach(p => p.classList.remove('is-open'));
        }
    });
});


// === АВТОМАТИЧНЕ ОТРИМАННЯ ВЕРСІЇ РОЗШИРЕННЯ З GITHUB (БЕЗ КЕШУ) ===
document.addEventListener('DOMContentLoaded', () => {
    
    // ВСТАВТЕ СЮДИ ВАШЕ ПОСИЛАННЯ НА RAW MANIFEST.JSON
    const MANIFEST_URL = 'https://raw.githubusercontent.com/ultranetpopilnya/UltraEnergy-SMS-Tool/refs/heads/main/manifest.json';
    
    const badgeElement = document.querySelector('.extension-version-badge');
    if (!badgeElement) return;

    async function fetchExtensionVersion() {
        try {
            // Додаємо поточний час до URL, щоб браузер точно не використовував старий кеш
            const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, {
                cache: 'no-store' // Вказуємо браузеру не кешувати запит
            });
            
            if (!response.ok) {
                throw new Error('Не вдалося отримати дані з GitHub');
            }

            const manifest = await response.json();
            
            // Якщо у файлі є поле version, оновлюємо бейдж
            if (manifest && manifest.version) {
                badgeElement.textContent = `v${manifest.version}`;
            }

        } catch (error) {
            console.error('Помилка отримання версії розширення:', error);
            // Якщо немає інтернету або GitHub недоступний, на сайті просто 
            // залишиться та версія, яку ви написали в HTML (наприклад, v1.0.0)
        }
    }

    // Запускаємо функцію при кожному заході на сайт
    fetchExtensionVersion();
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // 1. Перевіряємо, чи зберіг користувач темну тему раніше
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark');
    }

    // 2. Логіка перемикання при кліку
    themeToggle.addEventListener('click', () => {
        // Перемикаємо клас .dark на body
        body.classList.toggle('dark');
        
        // Зберігаємо вибір
        if (body.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
});