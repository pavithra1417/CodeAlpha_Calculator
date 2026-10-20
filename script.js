const display = document.getElementById("display");
const history = document.getElementById("history");
const keypad = document.querySelector(".keypad");

let currentInput = "0";
let firstOperand = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function updateDisplay() {
    display.value = currentInput;
}

function clearAll() {
    currentInput = "0";
    firstOperand = null;
    operator = null;
    waitingForOperand = false;
    justCalculated = false;
    history.textContent = "";
    updateDisplay();
}

function inputNumber(number) {
    if (waitingForOperand || justCalculated) {
        currentInput = number;
        waitingForOperand = false;
        justCalculated = false;
    } else if (currentInput === "0") {
        currentInput = number;
    } else if (currentInput.length < 16) {
        currentInput += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (waitingForOperand || justCalculated) {
        currentInput = "0.";
        waitingForOperand = false;
        justCalculated = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    updateDisplay();
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number.parseFloat(number.toPrecision(12)));
}

function calculate(a, b, op) {
    switch (op) {
        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":
            return b === 0 ? NaN : a / b;

        default:
            return b;
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[op] || op;
}

function chooseOperator(nextOperator) {
    const inputValue = Number(currentInput);

    if (!Number.isFinite(inputValue)) {
        clearAll();
        return;
    }

    if (operator && !waitingForOperand) {
        const result = calculate(
            firstOperand,
            inputValue,
            operator
        );

        if (!Number.isFinite(result)) {
            currentInput = "Error";
            firstOperand = null;
            operator = null;
            waitingForOperand = true;

            updateDisplay();
            history.textContent = "Cannot divide by zero";
            return;
        }

        currentInput = formatNumber(result);
        firstOperand = result;
        updateDisplay();
    } else {
        firstOperand = inputValue;
    }

    operator = nextOperator;
    waitingForOperand = true;
    justCalculated = false;

    history.textContent =
        `${currentInput} ${getOperatorSymbol(nextOperator)}`;
}

function calculateResult() {
    if (operator === null || waitingForOperand) {
        return;
    }

    const secondOperand = Number(currentInput);

    const result = calculate(
        firstOperand,
        secondOperand,
        operator
    );

    history.textContent =
        `${formatNumber(firstOperand)} ${getOperatorSymbol(operator)} ${formatNumber(secondOperand)} =`;

    if (!Number.isFinite(result)) {
        currentInput = "Error";
        history.textContent = "Cannot divide by zero";
    } else {
        currentInput = formatNumber(result);
    }

    firstOperand = null;
    operator = null;
    waitingForOperand = true;
    justCalculated = true;

    updateDisplay();
}

function deleteLast() {
    if (
        waitingForOperand ||
        justCalculated ||
        currentInput === "Error"
    ) {
        currentInput = "0";
        waitingForOperand = false;
        justCalculated = false;
    } else if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);

        if (currentInput === "-") {
            currentInput = "0";
        }
    } else {
        currentInput = "0";
    }

    updateDisplay();
}

function percentage() {
    const value = Number(currentInput);

    if (!Number.isFinite(value)) {
        clearAll();
        return;
    }

    currentInput = formatNumber(value / 100);
    waitingForOperand = false;
    justCalculated = false;

    updateDisplay();
}

function toggleSign() {
    if (currentInput === "0" || currentInput === "Error") {
        return;
    }

    currentInput = currentInput.startsWith("-")
        ? currentInput.slice(1)
        : "-" + currentInput;

    updateDisplay();
}

/* Calculator button clicks */

keypad.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number !== undefined) {
        if (currentInput === "Error") {
            clearAll();
        }

        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        if (currentInput !== "Error") {
            chooseOperator(button.dataset.operator);
        }

        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearAll();
            break;

        case "delete":
            deleteLast();
            break;

        case "percent":
            percentage();
            break;

        case "decimal":
            if (currentInput === "Error") {
                clearAll();
            }

            inputDecimal();
            break;

        case "sign":
            toggleSign();
            break;

        case "equals":
            calculateResult();
            break;
    }
});

/* Keyboard support */

document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        if (currentInput === "Error") {
            clearAll();
        }

        inputNumber(key);
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();

        if (currentInput !== "Error") {
            chooseOperator(key);
        }

        return;
    }

    if (key === ".") {
        if (currentInput === "Error") {
            clearAll();
        }

        inputDecimal();
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
        return;
    }

    if (key === "Backspace") {
        deleteLast();
        return;
    }

    if (key === "Escape" || key === "Delete") {
        clearAll();
        return;
    }

    if (key === "%") {
        percentage();
    }
});

/* Dark and light theme */

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLight =
        document.body.classList.contains("light-theme");

    themeBtn.textContent = isLight ? "☾" : "☀";
    themeBtn.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
    );
});

/* Initial display */

updateDisplay();