// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем на всю высоту

// Применяем темы Telegram
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);

// Получаем элементы страницы
const numberInput = document.getElementById('numberInput');
const fromBaseSelect = document.getElementById('fromBase');
const toBaseSelect = document.getElementById('toBase');
const customFromBase = document.getElementById('customFromBase');
const customToBase = document.getElementById('customToBase');
const convertBtn = document.getElementById('convertBtn');
const resultElement = document.getElementById('result');
const historyElement = document.getElementById('history');

// Массив для хранения истории конвертаций
let conversionHistory = [];

// Обработка выбора пользовательской системы счисления
fromBaseSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customFromBase.classList.remove('hidden');
    } else {
        customFromBase.classList.add('hidden');
    }
});

toBaseSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customToBase.classList.remove('hidden');
    } else {
        customToBase.classList.add('hidden');
    }
});

// Функция конвертации числа между системами счисления
function convertNumber(number, fromBase, toBase) {
    // Проверяем входное число на соответствие указанной системе счисления
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = String(number).toUpperCase().split('');
    
    for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        const digitValue = validChars.indexOf(digit);
        if (digitValue === -1 || digitValue >= fromBase) {
            throw new Error(`Недопустимая цифра "${digit}" для системы счисления ${fromBase}`);
        }
    }
    
    // Конвертируем число в десятичную систему счисления
    let decimalValue = 0;
    for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        const digitValue = validChars.indexOf(digit);
        decimalValue = decimalValue * fromBase + digitValue;
    }
    
    // Если целевая система счисления десятичная, возвращаем результат
    if (toBase === 10) {
        return decimalValue.toString();
    }
    
    // Конвертируем десятичное число в целевую систему счисления
    let result = '';
    let value = decimalValue;
    
    while (value > 0) {
        const remainder = value % toBase;
        result = validChars[remainder] + result;
        value = Math.floor(value / toBase);
    }
    
    return result || '0';
}

// Обработчик нажатия на кнопку конвертации
convertBtn.addEventListener('click', function() {
    try {
        const number = numberInput.value.trim();
        
        if (!number) {
            throw new Error('Введите число для конвертации');
        }
        
        // Определяем исходную систему счисления
        let fromBase = parseInt(fromBaseSelect.value);
        if (fromBaseSelect.value === 'custom') {
            fromBase = parseInt(customFromBase.value);
            if (isNaN(fromBase) || fromBase < 2 || fromBase > 36) {
                throw new Error('Основание системы счисления должно быть от 2 до 36');
            }
        }
        
        // Определяем целевую систему счисления
        let toBase = parseInt(toBaseSelect.value);
        if (toBaseSelect.value === 'custom') {
            toBase = parseInt(customToBase.value);
            if (isNaN(toBase) || toBase < 2 || toBase > 36) {
                throw new Error('Основание системы счисления должно быть от 2 до 36');
            }
        }
        
        // Конвертируем число
        const result = convertNumber(number, fromBase, toBase);
        
        // Отображаем результат
        resultElement.textContent = result;
        
        // Добавляем в историю
        addToHistory(number, fromBase, result, toBase);
        
    } catch (error) {
        // Обрабатываем ошибки
        resultElement.textContent = `Ошибка: ${error.message}`;
    }
});

// Функция добавления конвертации в историю
function addToHistory(input, fromBase, output, toBase) {
    // Ограничиваем историю 10 последними записями
    if (conversionHistory.length >= 10) {
        conversionHistory.shift();
    }
    
    // Добавляем новую запись
    conversionHistory.push({
        input,
        fromBase,
        output,
        toBase,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Обновляем отображение истории
    updateHistoryDisplay();
}

// Функция обновления отображения истории
function updateHistoryDisplay() {
    historyElement.innerHTML = '';
    
    for (let i = conversionHistory.length - 1; i >= 0; i--) {
        const item = conversionHistory[i];
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div>
                <strong>${item.input}<sub>${item.fromBase}</sub> → ${item.output}<sub>${item.toBase}</sub></strong>
                <div class="timestamp">${item.timestamp}</div>
            </div>
            <button class="copy-btn" data-result="${item.output}">Копировать</button>
        `;
        
        historyElement.appendChild(li);
    }
    
    // Добавляем обработчики для кнопок копирования
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.getAttribute('data-result');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Скопировано';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Ошибка при копировании: ', err);
                });
        });
    });
}

// Добавляем возможность закрытия приложения
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        tg.close();
    }
}); 