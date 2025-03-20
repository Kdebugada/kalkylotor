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
const precisionInput = document.getElementById('precisionInput'); // Новое поле для точности
const negativeCheckbox = document.getElementById('negativeCheckbox'); // Новое поле для отрицательных чисел
const favoriteBtn = document.getElementById('favoriteBtn'); // Кнопка для добавления в избранное
const favoritesElement = document.getElementById('favorites'); // Список избранных конвертаций
const showStepsBtn = document.getElementById('showStepsBtn'); // Кнопка для показа шагов конвертации
const stepsContainer = document.getElementById('stepsContainer'); // Контейнер для шагов конвертации
const tabButtons = document.querySelectorAll('.tab-btn'); // Кнопки вкладок
const tabContents = document.querySelectorAll('.tab-content'); // Содержимое вкладок

// Инициализация вкладок
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Деактивируем все вкладки и контент
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Активируем выбранную вкладку
        this.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Массив для хранения истории конвертаций
let conversionHistory = [];

// Массив для хранения избранных конвертаций
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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

// Функция конвертации числа между системами счисления с поддержкой дробных чисел
function convertNumber(number, fromBase, toBase, precision = 10) {
    // Обрабатываем отрицательные числа
    let isNegative = false;
    if (number.startsWith('-')) {
        isNegative = true;
        number = number.substring(1);
    }
    
    // Разделяем число на целую и дробную части
    const parts = number.split('.');
    const integerPart = parts[0];
    const fractionalPart = parts.length > 1 ? parts[1] : '';
    
    // Проверяем входные данные на соответствие указанной системе счисления
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Проверка целой части
    const integerDigits = String(integerPart).toUpperCase().split('');
    for (let i = 0; i < integerDigits.length; i++) {
        const digit = integerDigits[i];
        const digitValue = validChars.indexOf(digit);
        if (digitValue === -1 || digitValue >= fromBase) {
            throw new Error(`Недопустимая цифра "${digit}" для системы счисления ${fromBase}`);
        }
    }
    
    // Проверка дробной части
    if (fractionalPart) {
        const fractionalDigits = String(fractionalPart).toUpperCase().split('');
        for (let i = 0; i < fractionalDigits.length; i++) {
            const digit = fractionalDigits[i];
            const digitValue = validChars.indexOf(digit);
            if (digitValue === -1 || digitValue >= fromBase) {
                throw new Error(`Недопустимая цифра "${digit}" для системы счисления ${fromBase}`);
            }
        }
    }
    
    // Конвертируем целую часть в десятичную систему
    let intDecimalValue = 0;
    for (let i = 0; i < integerDigits.length; i++) {
        const digit = integerDigits[i];
        const digitValue = validChars.indexOf(digit);
        intDecimalValue = intDecimalValue * fromBase + digitValue;
    }
    
    // Конвертируем дробную часть в десятичную систему (если есть)
    let fracDecimalValue = 0;
    if (fractionalPart) {
        const fractionalDigits = String(fractionalPart).toUpperCase().split('');
        for (let i = 0; i < fractionalDigits.length; i++) {
            const digit = fractionalDigits[i];
            const digitValue = validChars.indexOf(digit);
            fracDecimalValue += digitValue * Math.pow(fromBase, -(i + 1));
        }
    }
    
    // Общее десятичное значение
    let decimalValue = intDecimalValue + fracDecimalValue;
    
    // Если число отрицательное, меняем знак
    if (isNegative) {
        decimalValue = -decimalValue;
    }
    
    // Если целевая система счисления десятичная, возвращаем результат
    if (toBase === 10) {
        return decimalValue.toString();
    }
    
    // Конвертируем десятичное число в целевую систему счисления
    // Разделяем на целую и дробную части
    const absDecimalValue = Math.abs(decimalValue);
    const targetIntegerPart = Math.floor(absDecimalValue);
    const targetFractionalPart = absDecimalValue - targetIntegerPart;
    
    // Конвертируем целую часть
    let intResult = '';
    let intValue = targetIntegerPart;
    
    if (intValue === 0) {
        intResult = '0';
    } else {
        while (intValue > 0) {
            const remainder = intValue % toBase;
            intResult = validChars[remainder] + intResult;
            intValue = Math.floor(intValue / toBase);
        }
    }
    
    // Конвертируем дробную часть (если есть)
    let fracResult = '';
    if (targetFractionalPart > 0 && precision > 0) {
        fracResult = '.';
        let fracValue = targetFractionalPart;
        let count = 0;
        
        while (fracValue > 0 && count < precision) {
            fracValue *= toBase;
            const digit = Math.floor(fracValue);
            fracResult += validChars[digit];
            fracValue -= digit;
            count++;
        }
    }
    
    // Формируем результат с учетом знака
    let result = intResult + fracResult;
    if (isNegative) {
        result = '-' + result;
    }
    
    return result;
}

// Функция для визуализации процесса конвертации
function visualizeConversion(number, fromBase, toBase, precision) {
    const steps = [];
    
    // Обрабатываем отрицательные числа
    let isNegative = false;
    if (number.startsWith('-')) {
        isNegative = true;
        number = number.substring(1);
        steps.push(`Обнаружено отрицательное число. Отделяем знак "-" и работаем с положительным числом ${number}`);
    }
    
    // Разделяем число на целую и дробную части
    const parts = number.split('.');
    const integerPart = parts[0];
    const fractionalPart = parts.length > 1 ? parts[1] : '';
    
    if (fractionalPart) {
        steps.push(`Разделяем число на целую часть (${integerPart}) и дробную часть (${fractionalPart})`);
    }
    
    const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Конвертируем целую часть в десятичную систему
    let intDecimalValue = 0;
    const integerDigits = String(integerPart).toUpperCase().split('');
    
    if (fromBase !== 10) {
        steps.push(`Шаг 1: Конвертируем целую часть (${integerPart}) из системы ${fromBase} в десятичную:`);
        let calculation = '';
        
        for (let i = 0; i < integerDigits.length; i++) {
            const digit = integerDigits[i];
            const digitValue = validChars.indexOf(digit);
            const position = integerDigits.length - i - 1;
            const contribution = digitValue * Math.pow(fromBase, position);
            
            if (i === 0) {
                calculation = `${digit} × ${fromBase}^${position} = ${contribution}`;
            } else {
                calculation += ` + ${digit} × ${fromBase}^${position} = ${contribution}`;
            }
            
            intDecimalValue += contribution;
        }
        
        steps.push(calculation);
        steps.push(`Результат: целая часть в десятичной системе = ${intDecimalValue}`);
    } else {
        intDecimalValue = parseInt(integerPart);
        steps.push(`Целая часть уже в десятичной системе: ${intDecimalValue}`);
    }
    
    // Конвертируем дробную часть в десятичную систему (если есть)
    let fracDecimalValue = 0;
    if (fractionalPart) {
        if (fromBase !== 10) {
            steps.push(`Шаг 2: Конвертируем дробную часть (${fractionalPart}) из системы ${fromBase} в десятичную:`);
            let calculation = '';
            
            const fractionalDigits = String(fractionalPart).toUpperCase().split('');
            for (let i = 0; i < fractionalDigits.length; i++) {
                const digit = fractionalDigits[i];
                const digitValue = validChars.indexOf(digit);
                const position = -(i + 1);
                const contribution = digitValue * Math.pow(fromBase, position);
                
                if (i === 0) {
                    calculation = `${digit} × ${fromBase}^${position} = ${contribution.toFixed(precision)}`;
                } else {
                    calculation += ` + ${digit} × ${fromBase}^${position} = ${contribution.toFixed(precision)}`;
                }
                
                fracDecimalValue += contribution;
            }
            
            steps.push(calculation);
            steps.push(`Результат: дробная часть в десятичной системе = ${fracDecimalValue.toFixed(precision)}`);
        } else {
            fracDecimalValue = parseFloat(`0.${fractionalPart}`);
            steps.push(`Дробная часть уже в десятичной системе: ${fracDecimalValue}`);
        }
    }
    
    // Общее десятичное значение
    let decimalValue = intDecimalValue + fracDecimalValue;
    
    if (fractionalPart) {
        steps.push(`Шаг 3: Десятичное значение = ${intDecimalValue} + ${fracDecimalValue.toFixed(precision)} = ${decimalValue.toFixed(precision)}`);
    }
    
    // Если число отрицательное, меняем знак
    if (isNegative) {
        decimalValue = -decimalValue;
        steps.push(`Возвращаем знак "-": ${decimalValue.toFixed(precision)}`);
    }
    
    // Если целевая система счисления десятичная, возвращаем результат
    if (toBase === 10) {
        steps.push(`Конвертация завершена, результат: ${decimalValue}`);
        return {steps, result: decimalValue.toString()};
    }
    
    // Конвертируем из десятичной в целевую систему
    steps.push(`Шаг 4: Конвертируем из десятичной в систему с основанием ${toBase}:`);
    
    // Разделяем на целую и дробную части
    const absDecimalValue = Math.abs(decimalValue);
    const targetIntegerPart = Math.floor(absDecimalValue);
    const targetFractionalPart = absDecimalValue - targetIntegerPart;
    
    // Конвертируем целую часть
    let intResult = '';
    let intValue = targetIntegerPart;
    let intStep = `Конвертируем целую часть (${targetIntegerPart}):`;
    
    if (intValue === 0) {
        intResult = '0';
        intStep += ` 0`;
    } else {
        let divisionSteps = [];
        
        while (intValue > 0) {
            const remainder = intValue % toBase;
            intResult = validChars[remainder] + intResult;
            
            divisionSteps.push(`${intValue} ÷ ${toBase} = ${Math.floor(intValue / toBase)} (остаток ${remainder} → ${validChars[remainder]})`);
            intValue = Math.floor(intValue / toBase);
        }
        
        intStep += ` используем деление с остатком:\n${divisionSteps.join('\n')}`;
        intStep += `\nРезультат для целой части: ${intResult}`;
    }
    
    steps.push(intStep);
    
    // Конвертируем дробную часть (если есть)
    let fracResult = '';
    if (targetFractionalPart > 0 && precision > 0) {
        fracResult = '.';
        let fracValue = targetFractionalPart;
        let fracStep = `Конвертируем дробную часть (${targetFractionalPart.toFixed(precision)}):`;
        let multiplicationSteps = [];
        let count = 0;
        
        while (fracValue > 0 && count < precision) {
            fracValue *= toBase;
            const digit = Math.floor(fracValue);
            fracResult += validChars[digit];
            
            multiplicationSteps.push(`${fracValue.toFixed(precision)} → целая часть ${digit} → ${validChars[digit]}`);
            fracValue -= digit;
            count++;
        }
        
        fracStep += ` используем умножение и выделение целой части:\n${multiplicationSteps.join('\n')}`;
        fracStep += `\nРезультат для дробной части: ${fracResult}`;
        steps.push(fracStep);
    }
    
    // Формируем результат с учетом знака
    let result = intResult + fracResult;
    if (isNegative) {
        result = '-' + result;
        steps.push(`Возвращаем знак "-" к результату: ${result}`);
    }
    
    steps.push(`Итоговый результат: ${result}`);
    
    return {steps, result};
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
        
        // Определяем точность для дробной части
        const precision = precisionInput ? parseInt(precisionInput.value) : 10;
        
        // Применяем отрицательный знак, если нужно
        let inputNumber = number;
        if (negativeCheckbox && negativeCheckbox.checked && !number.startsWith('-')) {
            inputNumber = '-' + number;
        }
        
        // Конвертируем число
        const result = convertNumber(inputNumber, fromBase, toBase, precision);
        
        // Отображаем результат
        resultElement.textContent = result;
        
        // Сохраняем шаги конвертации, если нужно показать визуализацию
        if (showStepsBtn && stepsContainer) {
            // Сохраняем данные для визуализации
            showStepsBtn.dataset.number = inputNumber;
            showStepsBtn.dataset.fromBase = fromBase;
            showStepsBtn.dataset.toBase = toBase;
            showStepsBtn.dataset.precision = precision;
            
            // Делаем кнопку видимой
            showStepsBtn.classList.remove('hidden');
        }
        
        // Добавляем в историю
        addToHistory(inputNumber, fromBase, result, toBase);
        
    } catch (error) {
        // Обрабатываем ошибки
        resultElement.textContent = `Ошибка: ${error.message}`;
        
        // Скрываем кнопку показа шагов
        if (showStepsBtn) {
            showStepsBtn.classList.add('hidden');
        }
    }
});

// Обработчик кнопки показа шагов конвертации
if (showStepsBtn && stepsContainer) {
    showStepsBtn.addEventListener('click', function() {
        const number = this.dataset.number;
        const fromBase = parseInt(this.dataset.fromBase);
        const toBase = parseInt(this.dataset.toBase);
        const precision = parseInt(this.dataset.precision);
        
        // Визуализируем процесс конвертации
        const visualization = visualizeConversion(number, fromBase, toBase, precision);
        
        // Отображаем шаги
        stepsContainer.innerHTML = '';
        stepsContainer.classList.remove('hidden');
        
        visualization.steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'conversion-step';
            stepElement.innerHTML = `<div class="step-number">${index + 1}</div><div class="step-content">${step}</div>`;
            stepsContainer.appendChild(stepElement);
        });
        
        // Прокручиваем к контейнеру с шагами
        stepsContainer.scrollIntoView({ behavior: 'smooth' });
    });
}

// Обработчик кнопки добавления в избранное
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', function() {
        const number = numberInput.value.trim();
        
        if (!number) {
            alert('Введите число для добавления в избранное');
            return;
        }
        
        // Определяем исходную систему счисления
        let fromBase = parseInt(fromBaseSelect.value);
        if (fromBaseSelect.value === 'custom') {
            fromBase = parseInt(customFromBase.value);
        }
        
        // Определяем целевую систему счисления
        let toBase = parseInt(toBaseSelect.value);
        if (toBaseSelect.value === 'custom') {
            toBase = parseInt(customToBase.value);
        }
        
        // Проверяем, не добавлена ли уже такая конвертация
        const exists = favorites.some(fav => 
            fav.number === number && fav.fromBase === fromBase && fav.toBase === toBase
        );
        
        if (!exists) {
            // Добавляем в избранное
            favorites.push({
                number,
                fromBase,
                toBase,
                timestamp: new Date().toLocaleString()
            });
            
            // Сохраняем в localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Обновляем отображение избранного
            updateFavoritesDisplay();
            
            alert('Конвертация добавлена в избранное');
        } else {
            alert('Эта конвертация уже есть в избранном');
        }
    });
}

// Функция обновления отображения избранного
function updateFavoritesDisplay() {
    if (!favoritesElement) return;
    
    favoritesElement.innerHTML = '';
    
    if (favorites.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Список избранного пуст';
        favoritesElement.appendChild(emptyMessage);
        return;
    }
    
    favorites.forEach((fav, index) => {
        const item = document.createElement('li');
        item.className = 'favorite-item';
        
        item.innerHTML = `
            <div class="favorite-content">
                <strong>${fav.number}<sub>${fav.fromBase}</sub> → ?<sub>${fav.toBase}</sub></strong>
                <div class="timestamp">${fav.timestamp}</div>
            </div>
            <div class="favorite-actions">
                <button class="repeat-btn" data-index="${index}">Повторить</button>
                <button class="remove-btn" data-index="${index}">Удалить</button>
            </div>
        `;
        
        favoritesElement.appendChild(item);
    });
    
    // Добавляем обработчики для кнопок
    const repeatButtons = document.querySelectorAll('.repeat-btn');
    repeatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const fav = favorites[index];
            
            // Заполняем форму данными из избранного
            numberInput.value = fav.number;
            
            if (fav.fromBase <= 16) {
                fromBaseSelect.value = fav.fromBase;
                customFromBase.classList.add('hidden');
            } else {
                fromBaseSelect.value = 'custom';
                customFromBase.value = fav.fromBase;
                customFromBase.classList.remove('hidden');
            }
            
            if (fav.toBase <= 16) {
                toBaseSelect.value = fav.toBase;
                customToBase.classList.add('hidden');
            } else {
                toBaseSelect.value = 'custom';
                customToBase.value = fav.toBase;
                customToBase.classList.remove('hidden');
            }
            
            // Переключаемся на вкладку конвертера
            document.querySelector('.tab-btn[data-tab="converter"]').click();
            
            // Автоматически запускаем конвертацию
            convertBtn.click();
        });
    });
    
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            
            // Удаляем из избранного
            favorites.splice(index, 1);
            
            // Сохраняем в localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Обновляем отображение
            updateFavoritesDisplay();
        });
    });
}

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
            <div class="history-actions">
                <button class="copy-btn" data-result="${item.output}">Копировать</button>
                <button class="favorite-add-btn" data-index="${i}">★</button>
            </div>
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
    
    // Добавляем обработчики для кнопок добавления в избранное
    const favoriteAddButtons = document.querySelectorAll('.favorite-add-btn');
    favoriteAddButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const item = conversionHistory[index];
            
            // Проверяем, не добавлена ли уже такая конвертация
            const exists = favorites.some(fav => 
                fav.number === item.input && fav.fromBase === item.fromBase && fav.toBase === item.toBase
            );
            
            if (!exists) {
                // Добавляем в избранное
                favorites.push({
                    number: item.input,
                    fromBase: item.fromBase,
                    toBase: item.toBase,
                    timestamp: new Date().toLocaleString()
                });
                
                // Сохраняем в localStorage
                localStorage.setItem('favorites', JSON.stringify(favorites));
                
                // Обновляем отображение избранного
                updateFavoritesDisplay();
                
                alert('Конвертация добавлена в избранное');
            } else {
                alert('Эта конвертация уже есть в избранном');
            }
        });
    });
}

// Инициализация избранного при загрузке страницы
if (favoritesElement) {
    updateFavoritesDisplay();
}

// Добавляем возможность закрытия приложения
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        tg.close();
    }
}); 