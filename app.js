```javascript
/* =========================================================
   БУХГАЛТЕРСКИЙ КАБИНЕТ KZ
   2026
========================================================= */


/* =========================================================
   НАСТРОЙКИ
========================================================= */

const defaultSettings = {
    mrp: 4325,

    simplifiedRate: 4,

    opv: 0.10,

    voms: 0.02,

    opvr: 0.035,

    osms: 0.03,

    social: 0.05,

    basicDeductionMrp: 30
};


/* =========================================================
   ЗАГРУЗКА НАСТРОЕК
========================================================= */

let settings =
    JSON.parse(localStorage.getItem("buhgalterSettings"))
    || defaultSettings;


/* =========================================================
   ДАННЫЕ
========================================================= */

let incomes =
    JSON.parse(localStorage.getItem("buhgalterIncome"))
    || [];

let expenses =
    JSON.parse(localStorage.getItem("buhgalterExpenses"))
    || [];

let employees =
    JSON.parse(localStorage.getItem("buhgalterEmployees"))
    || [];


/* =========================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================================= */

function money(value) {

    return new Intl.NumberFormat(
        "ru-RU",
        {
            maximumFractionDigits: 0
        }
    ).format(Math.round(value)) + " ₸";
}


function saveData() {

    localStorage.setItem(
        "buhgalterIncome",
        JSON.stringify(incomes)
    );

    localStorage.setItem(
        "buhgalterExpenses",
        JSON.stringify(expenses)
    );

    localStorage.setItem(
        "buhgalterEmployees",
        JSON.stringify(employees)
    );

    localStorage.setItem(
        "buhgalterSettings",
        JSON.stringify(settings)
    );
}


function today() {

    return new Date().toLocaleDateString("ru-RU");
}


/* =========================================================
   НАВИГАЦИЯ
========================================================= */

const menuButtons =
    document.querySelectorAll(".menu-btn");

const sections =
    document.querySelectorAll(".section");


menuButtons.forEach(button => {

    button.addEventListener("click", () => {

        const target =
            button.dataset.section;


        menuButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        sections.forEach(section => {

            section.classList.remove("active");

        });


        button.classList.add("active");


        document
            .getElementById(target)
            .classList.add("active");

    });

});


/* =========================================================
   КАЛЬКУЛЯТОР ЗАРПЛАТЫ
========================================================= */

function calculateSalary() {

    const gross =
        Number(
            document.getElementById("salaryInput").value
        ) || 0;


    /* ОПВ */

    const opv =
        gross * settings.opv;


    /* ВОСМС */

    const voms =
        gross * settings.voms;


    /* Базовый вычет */

    let basicDeduction = 0;


    const useDeduction =
        document.getElementById("basicDeduction").value;


    if (useDeduction === "yes") {

        basicDeduction =
            settings.mrp *
            settings.basicDeductionMrp;

    }


    /* Налогооблагаемый доход */

    const taxableIncome =
        Math.max(
            0,
            gross -
            opv -
            voms -
            basicDeduction
        );


    /*
       Для обычного месячного расчёта
       используем 10%.

       Прогрессивную годовую часть
       можно будет добавить в следующей версии.
    */

    const ipn =
        taxableIncome * 0.10;


    /* На руки */

    const net =
        gross -
        opv -
        voms -
        ipn;


    /* Работодатель */

    const opvr =
        gross * settings.opvr;


    const osms =
        gross * settings.osms;


    const social =
        gross * settings.social;


    const employerTotal =
        gross +
        opvr +
        osms +
        social;


    /* Вывод */

    document.getElementById(
        "salaryGross"
    ).textContent = money(gross);


    document.getElementById(
        "salaryOpv"
    ).textContent = money(opv);


    document.getElementById(
        "salaryVoms"
    ).textContent = money(voms);


    document.getElementById(
        "salaryIpn"
    ).textContent = money(ipn);


    document.getElementById(
        "salaryNet"
    ).textContent = money(net);


    document.getElementById(
        "salaryOpvr"
    ).textContent = money(opvr);


    document.getElementById(
        "salaryOsms"
    ).textContent = money(osms);


    document.getElementById(
        "salarySo"
    ).textContent = money(social);


    document.getElementById(
        "salaryEmployer"
    ).textContent = money(employerTotal);

}


document
    .getElementById("calculateSalary")
    .addEventListener(
        "click",
        calculateSalary
    );


/* =========================================================
   КАЛЬКУЛЯТОР НАЛОГОВ
========================================================= */

function calculateTax() {

    const income =
        Number(
            document.getElementById("taxIncome").value
        ) || 0;


    const mode =
        document.getElementById("taxMode").value;


    let rate;


    if (mode === "simplified") {

        rate =
            Number(settings.simplifiedRate);

    } else {

        /*
          Упрощённый ориентировочный расчёт ОУР.

          Для полноценного ОУР потребуется отдельно
          учитывать расходы, вычеты, КПН/ИПН,
          НДС и другие обязательства.
        */

        rate = 20;

    }


    const tax =
        income * rate / 100;


    document.getElementById(
        "taxIncomeResult"
    ).textContent = money(income);


    document.getElementById(
        "taxRateResult"
    ).textContent = rate + "%";


    document.getElementById(
        "taxResult"
    ).textContent = money(tax);

}


document
    .getElementById("calculateTax")
    .addEventListener(
        "click",
        calculateTax
    );


/* =========================================================
   ДОХОДЫ
========================================================= */

function renderIncome() {

    const table =
        document.getElementById("incomeTable");


    table.innerHTML = "";


    incomes.forEach((item, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${item.date}</td>

            <td>${escapeHtml(item.description)}</td>

            <td>${money(item.amount)}</td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteIncome(${index})"
                >
                    Удалить
                </button>
            </td>

        `;


        table.appendChild(row);

    });


    updateDashboard();

}


function addIncome() {

    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            ).value
        ) || 0;


    const description =
        document.getElementById(
            "incomeDescription"
        ).value.trim();


    if (amount <= 0) {

        alert("Введите сумму дохода.");

        return;

    }


    incomes.push({

        amount: amount,

        description:
            description || "Доход",

        date: today()

    });


    saveData();


    document.getElementById(
        "incomeAmount"
    ).value = "";


    document.getElementById(
        "incomeDescription"
    ).value = "";


    renderIncome();

}


function deleteIncome(index) {

    incomes.splice(index, 1);

    saveData();

    renderIncome();

}


document
    .getElementById("addIncome")
    .addEventListener(
        "click",
        addIncome
    );


/* =========================================================
   РАСХОДЫ
========================================================= */

function renderExpenses() {

    const table =
        document.getElementById(
            "expenseTable"
        );


    table.innerHTML = "";


    expenses.forEach((item, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${item.date}</td>

            <td>${escapeHtml(item.description)}</td>

            <td>${money(item.amount)}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${index})"
                >
                    Удалить
                </button>

            </td>

        `;


        table.appendChild(row);

    });


    updateDashboard();

}


function addExpense() {

    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        ) || 0;


    const description =
        document.getElementById(
            "expenseDescription"
        ).value.trim();


    if (amount <= 0) {

        alert("Введите сумму расхода.");

        return;

    }


    expenses.push({

        amount: amount,

        description:
            description || "Расход",

        date: today()

    });


    saveData();


    document.getElementById(
        "expenseAmount"
    ).value = "";


    document.getElementById(
        "expenseDescription"
    ).value = "";


    renderExpenses();

}


function deleteExpense(index) {

    expenses.splice(index, 1);

    saveData();

    renderExpenses();

}


document
    .getElementById("addExpense")
    .addEventListener(
        "click",
        addExpense
    );


/* =========================================================
   СОТРУДНИКИ
========================================================= */

function renderEmployees() {

    const table =
        document.getElementById(
            "employeeTable"
        );


    table.innerHTML = "";


    employees.forEach((employee, index) => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(employee.name)}
            </td>

            <td>
                ${money(employee.salary)}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteEmployee(${index})"
                >
                    Удалить
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


function addEmployee() {

    const name =
        document.getElementById(
            "employeeName"
        ).value.trim();


    const salary =
        Number(
            document.getElementById(
                "employeeSalary"
            ).value
        ) || 0;


    if (!name) {

        alert("Введите ФИО сотрудника.");

        return;

    }


    if (salary <= 0) {

        alert("Введите оклад.");

        return;

    }


    employees.push({

        name: name,

        salary: salary

    });


    saveData();


    document.getElementById(
        "employeeName"
    ).value = "";


    document.getElementById(
        "employeeSalary"
    ).value = "";


    renderEmployees();

}


function deleteEmployee(index) {

    employees.splice(index, 1);

    saveData();

    renderEmployees();

}


document
    .getElementById("addEmployee")
    .addEventListener(
        "click",
        addEmployee
    );


/* =========================================================
   НАСТРОЙКИ
========================================================= */

function loadSettings() {

    document.getElementById(
        "mrp"
    ).value = settings.mrp;


    document.getElementById(
        "simplifiedRate"
    ).value =
        settings.simplifiedRate;


    updateCompanyInfo();

}


function saveSettings() {

    settings.mrp =
        Number(
            document.getElementById(
                "mrp"
            ).value
        ) || 4325;


    settings.simplifiedRate =
        Number(
            document.getElementById(
                "simplifiedRate"
            ).value
        ) || 4;


    saveData();


    document.getElementById(
        "settingsMessage"
    ).textContent =
        "Настройки сохранены.";


    updateCompanyInfo();

}


document
    .getElementById("saveSettings")
    .addEventListener(
        "click",
        saveSettings
    );


/* =========================================================
   ИНФОРМАЦИЯ О КОМПАНИИ
========================================================= */

function updateCompanyInfo() {

    const company =
        document.getElementById(
            "companyType"
        ).value;


    const mode =
        document.getElementById(
            "taxMode"
        ).value;


    document.getElementById(
        "companyTypeView"
    ).textContent =
        company === "ip"
            ? "ИП"
            : "ТОО";


    document.getElementById(
        "taxModeView"
    ).textContent =
        mode === "simplified"
            ? "Упрощённая декларация"
            : "ОУР";


    document.getElementById(
        "taxRateView"
    ).textContent =
        mode === "simplified"
            ? settings.simplifiedRate + "%"
            : "ОУР";

}


document
    .getElementById("companyType")
    .addEventListener(
        "change",
        updateCompanyInfo
    );


document
    .getElementById("taxMode")
    .addEventListener(
        "change",
        updateCompanyInfo
    );


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalIncome =
        incomes.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        );


    const totalExpenses =
        expenses.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        );


    const rate =
        Number(settings.simplifiedRate);


    const tax =
        totalIncome * rate / 100;


    const profit =
        totalIncome -
        totalExpenses;


    document.getElementById(
        "dashboardIncome"
    ).textContent =
        money(totalIncome);


    document.getElementById(
        "dashboardExpenses"
    ).textContent =
        money(totalExpenses);


    document.getElementById(
        "dashboardTax"
    ).textContent =
        money(tax);


    document.getElementById(
        "dashboardProfit"
    ).textContent =
        money(profit);

}


/* =========================================================
   ЗАЩИТА HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================================
   ЗАПУСК
========================================================= */

loadSettings();

renderIncome();

renderExpenses();

renderEmployees();

calculateSalary();

calculateTax();

updateDashboard();

updateCompanyInfo();
```
