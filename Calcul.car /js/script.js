let euroRate; // Курс євро
    let selectedCurrencyRate; // Курс обраної валюти
    let priceInEuro; // Ціна в євро
    let vatAmount; // Значення ПДВ

    // Отримання курсу валют через API НБУ
    async function fetchCurrencyRate() {
        const selectedCurrency = document.getElementById('val').value; // Обрана валюта
        let apiUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'; // API НБУ

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Отримуємо курс обраної валюти та курс євро
            selectedCurrencyRate = data.find(currency => currency.cc === selectedCurrency)?.rate;
            euroRate = data.find(currency => currency.cc === 'EUR')?.rate;

            if (selectedCurrencyRate) {
                document.getElementById('kursValue').value = selectedCurrencyRate;
            } else {
                document.getElementById('kursValue').value = 'Немає даних';
            }

            // Якщо валюта не євро, конвертуємо в євро
            if (selectedCurrency !== 'EUR' && selectedCurrencyRate && euroRate) {
                convertToEuro();
            }

        } catch (error) {
            console.error('Помилка при отриманні курсу:', error);
            document.getElementById('kursValue').value = 'Помилка';
        }
    }

    // Конвертація в євро
    function convertToEuro() {
        const price = parseFloat(document.getElementById('prs').value);
        if (!isNaN(price) && selectedCurrencyRate && euroRate) {
            priceInEuro = price * (selectedCurrencyRate / euroRate);
        }
    }

    // Функція для обчислення ПДВ
    function calculateVAT() {
        const rikValue = getRikValue();
        const dv = document.getElementById('dv').value;
        const obym = parseFloat(document.getElementById('obym').value);
        const price = parseFloat(document.getElementById('prs').value);

        let dvMultiplier;

        if (dv === 'Бензин') {
            dvMultiplier = obym <= 3000 ? 0.05 : 0.1;
        } else if (dv === 'Дизель') {
            dvMultiplier = obym <= 3500 ? 0.075 : 0.15;
        }

        if (!isNaN(rikValue) && dvMultiplier && !isNaN(price) && !isNaN(obym)) {
            const baseAmount = rikValue * (dvMultiplier * obym) + (price * 0.1) + price;
            vatAmount = baseAmount * 0.2;
        }
    }

    // Функція для обчислення значення року
    function getRikValue() {
        const rik = document.getElementById('rik').value;
        const yearMapping = {
            "2024": 0, "2023": 1, "2022": 2, "2021": 3, "2020": 4,
            "2019": 5, "2018": 6, "2017": 7, "2016": 8, "2015": 9,
            "2014": 10, "2013": 11, "2012": 12, "2011": 13, "2010": 14,
            "старше": 15
        };
        return yearMapping[rik] || 15; // Повертаємо 15, якщо "Старше"
    }

    // Функція для обчислення загальної формули
    function calculateTotal() {
        calculateVAT();

        const rikValue = getRikValue();
        const dv = document.getElementById('dv').value;
        const obym = parseFloat(document.getElementById('obym').value);
        const price = parseFloat(document.getElementById('prs').value);

        let dvMultiplier;

        if (dv === 'Бензин') {
            dvMultiplier = obym <= 3000 ? 0.05 : 0.1;
        } else if (dv === 'Дизель') {
            dvMultiplier = obym <= 3500 ? 0.075 : 0.15;
        }

        if (!isNaN(rikValue) && dvMultiplier && !isNaN(price) && !isNaN(obym)) {
            const baseAmount = rikValue * (dvMultiplier * obym) + (price * 0.1) ;
            const totalAmountEuro = baseAmount + vatAmount;
            const totalAmountGrn = totalAmountEuro * euroRate;

            // Заповнюємо поля результату
            document.getElementById('resValue').value = totalAmountEuro.toFixed(2);
            document.getElementById('resGrn').value = totalAmountGrn.toFixed(2);

            // Встановлюємо дату розрахунку
            const currentDate = new Date().toLocaleDateString();
            document.getElementById('data').value = currentDate;
        }
    }