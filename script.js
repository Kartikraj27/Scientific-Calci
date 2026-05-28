// ======================== SCIENTIFIC CALCULATOR ENGINE ========================
let currentInput = "0";
let previousInput = "";
let currentOperator = null;
let waitingForOperand = false;
let inverseActive = false;

// DOM Elements
const expressionSpan = document.getElementById("expressionDisplay");
const resultSpan = document.getElementById("resultDisplay");
const invToggleBtn = document.getElementById("invToggleBtn");
const invSinBtn = document.getElementById("invSinBtn");
const invCosBtn = document.getElementById("invCosBtn");
const invTanBtn = document.getElementById("invTanBtn");

// Theme Elements
const modeToggle = document.getElementById("modeToggle");
const modeIcon = document.getElementById("modeIcon");
const modeLabel = document.getElementById("modeLabel");

// ========== THEME MODE (Dark/White) ==========
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('calciTheme', 'dark');
        modeIcon.innerHTML = '🌙';
        modeLabel.innerHTML = 'Dark';
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('calciTheme', 'light');
        modeIcon.innerHTML = '🌞';
        modeLabel.innerHTML = 'Light';
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

function loadSavedTheme() {
    const saved = localStorage.getItem('calciTheme');
    if (saved === 'dark') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// ========== DISPLAY UPDATE ==========
function updateDisplay() {
    let displayValue = currentInput === "" ? "0" : currentInput;
    if (displayValue.length > 22 && !displayValue.includes("e")) {
        let num = parseFloat(displayValue);
        if (!isNaN(num)) displayValue = num.toExponential(10);
    }
    resultSpan.innerText = displayValue;

    if (currentOperator && previousInput !== "") {
        let opSymbol = "";
        if (currentOperator === "+") opSymbol = "+";
        else if (currentOperator === "-") opSymbol = "−";
        else if (currentOperator === "*") opSymbol = "×";
        else if (currentOperator === "/") opSymbol = "÷";
        let prevShort = previousInput.length > 10 ? parseFloat(previousInput).toExponential(6) : previousInput;
        expressionSpan.innerText = `${prevShort} ${opSymbol}`;
    } else {
        expressionSpan.innerText = "";
    }
}

function resetScreen() {
    currentInput = "0";
    waitingForOperand = false;
}

// ========== BASIC OPERATIONS ==========
function appendNumber(number) {
    if (waitingForOperand) {
        currentInput = number;
        waitingForOperand = false;
    } else {
        if (number === ".") {
            if (currentInput.includes(".")) return;
            if (currentInput === "" || currentInput === "0") {
                currentInput = "0.";
                updateDisplay();
                return;
            }
        }
        if (currentInput === "0" && number !== ".") {
            currentInput = number;
        } else {
            currentInput += number;
        }
    }
    if (currentInput.length > 18) currentInput = currentInput.slice(0, 18);
    updateDisplay();
}

function clearAll() {
    currentInput = "0";
    previousInput = "";
    currentOperator = null;
    waitingForOperand = false;
    updateDisplay();
}

function backspace() {
    if (waitingForOperand) return;
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith("-"))) {
        currentInput = "0";
    } else {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "") currentInput = "0";
    }
    updateDisplay();
}

function percentage() {
    if (waitingForOperand) resetScreen();
    let val = parseFloat(currentInput);
    if (isNaN(val)) val = 0;
    let result = (val / 100).toString();
    if (result.includes(".")) result = result.replace(/\.?0+$/, "");
    currentInput = result === "" ? "0" : result;
    updateDisplay();
}

function setOperator(op) {
    if (currentOperator && !waitingForOperand && previousInput !== "") {
        compute();
    }
    previousInput = currentInput;
    currentOperator = op;
    waitingForOperand = true;
    updateDisplay();
}

function compute() {
    if (!currentOperator || waitingForOperand || previousInput === "") return;
    let a = parseFloat(previousInput);
    let b = parseFloat(currentInput);
    if (isNaN(a) || isNaN(b)) {
        clearAll();
        resultSpan.innerText = "Error";
        return;
    }
    let result;
    switch (currentOperator) {
        case "+": result = a + b; break;
        case "-": result = a - b; break;
        case "*": result = a * b; break;
        case "/":
            if (b === 0) {
                resultSpan.innerText = "Error";
                expressionSpan.innerText = "Cannot divide by zero";
                clearAll();
                return;
            }
            result = a / b; break;
        default: return;
    }
    result = parseFloat(result.toFixed(10));
    let resultStr = result.toString();
    if (resultStr.includes(".")) resultStr = resultStr.replace(/\.?0+$/, "");
    if (Math.abs(result) > 1e12 && resultStr.length > 16) resultStr = result.toExponential(10);
    currentInput = resultStr;
    previousInput = "";
    currentOperator = null;
    waitingForOperand = true;
    updateDisplay();
}

function equals() {
    if (currentOperator && previousInput !== "" && !waitingForOperand) {
        compute();
    } else {
        waitingForOperand = true;
        updateDisplay();
    }
}

// ========== SCIENTIFIC FUNCTIONS ==========
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
}

function applyScientific(funcType) {
    if (waitingForOperand) resetScreen();
    let inputVal = parseFloat(currentInput);
    if (isNaN(inputVal)) inputVal = 0;
    let result;

    let activeFunc = funcType;
    if (inverseActive) {
        if (funcType === "sin") activeFunc = "asin";
        else if (funcType === "cos") activeFunc = "acos";
        else if (funcType === "tan") activeFunc = "atan";
    }

    switch (activeFunc) {
        case "sin": result = Math.sin(inputVal); break;
        case "cos": result = Math.cos(inputVal); break;
        case "tan": result = Math.tan(inputVal); break;
        case "asin": result = Math.asin(Math.min(1, Math.max(-1, inputVal))); break;
        case "acos": result = Math.acos(Math.min(1, Math.max(-1, inputVal))); break;
        case "atan": result = Math.atan(inputVal); break;
        case "ln": result = Math.log(inputVal); if (inputVal <= 0) result = NaN; break;
        case "log": result = Math.log10(inputVal); if (inputVal <= 0) result = NaN; break;
        case "sqrt": result = inputVal < 0 ? NaN : Math.sqrt(inputVal); break;
        case "square": result = inputVal * inputVal; break;
        case "cube": result = inputVal * inputVal * inputVal; break;
        case "exp": result = Math.exp(inputVal); break;
        case "fact": result = factorial(inputVal); break;
        case "percent": result = inputVal / 100; break;
        case "pi": result = Math.PI; break;
        default: return;
    }

    if (isNaN(result) || !isFinite(result)) {
        currentInput = "Math Error";
    } else {
        let resStr = result.toString();
        if (resStr.length > 18) resStr = result.toExponential(10);
        currentInput = resStr;
    }
    previousInput = "";
    currentOperator = null;
    waitingForOperand = true;
    updateDisplay();
}

// ========== INV MODE TOGGLE ==========
function toggleInverseMode() {
    inverseActive = !inverseActive;
    if (inverseActive) {
        invToggleBtn.classList.add("inv-active");
        invToggleBtn.style.filter = "brightness(1.1)";
        if (invSinBtn) invSinBtn.innerText = "asin";
        if (invCosBtn) invCosBtn.innerText = "acos";
        if (invTanBtn) invTanBtn.innerText = "atan";
    } else {
        invToggleBtn.classList.remove("inv-active");
        invToggleBtn.style.filter = "";
        if (invSinBtn) invSinBtn.innerText = "sin⁻¹";
        if (invCosBtn) invCosBtn.innerText = "cos⁻¹";
        if (invTanBtn) invTanBtn.innerText = "tan⁻¹";
    }
}

function handleInvTrig(funcName) {
    let inputVal = parseFloat(currentInput);
    if (isNaN(inputVal)) inputVal = 0;
    let result;
    switch (funcName) {
        case "asin": result = Math.asin(Math.min(1, Math.max(-1, inputVal))); break;
        case "acos": result = Math.acos(Math.min(1, Math.max(-1, inputVal))); break;
        case "atan": result = Math.atan(inputVal); break;
        default: return;
    }
    if (isNaN(result) || !isFinite(result)) {
        currentInput = "Math Error";
    } else {
        let resStr = result.toString();
        if (resStr.length > 18) resStr = result.toExponential(10);
        currentInput = resStr;
    }
    previousInput = "";
    currentOperator = null;
    waitingForOperand = true;
    updateDisplay();
}

// ========== EVENT LISTENERS ==========
function bindEvents() {
    // Number buttons
    document.querySelectorAll("[data-num]").forEach(btn => {
        btn.addEventListener("click", () => {
            const num = btn.getAttribute("data-num");
            if (num !== null) appendNumber(num);
        });
    });

    // Operator buttons
    document.querySelectorAll("[data-op]").forEach(btn => {
        btn.addEventListener("click", () => {
            const op = btn.getAttribute("data-op");
            if (op === "+") setOperator("+");
            else if (op === "-") setOperator("-");
            else if (op === "*") setOperator("*");
            else if (op === "/") setOperator("/");
        });
    });

    // Clear, backspace, equal
    const clearBtn = document.querySelector("[data-action='clear']");
    if (clearBtn) clearBtn.addEventListener("click", () => clearAll());
    const backBtn = document.querySelector("[data-action='backspace']");
    if (backBtn) backBtn.addEventListener("click", () => backspace());
    const equalBtn = document.querySelector("[data-action='equal']");
    if (equalBtn) equalBtn.addEventListener("click", () => equals());

    // Scientific functions
    document.querySelectorAll("[data-func]").forEach(btn => {
        btn.addEventListener("click", () => {
            const func = btn.getAttribute("data-func");
            if (func) applyScientific(func);
        });
    });

    // Inverse trig buttons
    document.querySelectorAll("[data-inv-func]").forEach(btn => {
        btn.addEventListener("click", () => {
            const invFunc = btn.getAttribute("data-inv-func");
            if (invFunc) handleInvTrig(invFunc);
        });
    });

    // INV toggle
    const invToggle = document.getElementById("invToggleBtn");
    if (invToggle) invToggle.addEventListener("click", () => toggleInverseMode());
}

// Keyboard Support
function onKeyboard(e) {
    const key = e.key;
    if (/[0-9]/.test(key)) { e.preventDefault(); appendNumber(key); }
    else if (key === ".") { e.preventDefault(); appendNumber("."); }
    else if (key === "+") { e.preventDefault(); setOperator("+"); }
    else if (key === "-") { e.preventDefault(); setOperator("-"); }
    else if (key === "*") { e.preventDefault(); setOperator("*"); }
    else if (key === "/") { e.preventDefault(); setOperator("/"); }
    else if (key === "Enter" || key === "=") { e.preventDefault(); equals(); }
    else if (key === "Escape") { e.preventDefault(); clearAll(); }
    else if (key === "Backspace") { e.preventDefault(); backspace(); }
    else if (key === "%") { e.preventDefault(); percentage(); }
    else if (key === "s" || key === "S") { e.preventDefault(); applyScientific("sin"); }
    else if (key === "c" || key === "C") { e.preventDefault(); applyScientific("cos"); }
    else if (key === "t" || key === "T") { e.preventDefault(); applyScientific("tan"); }
    else if (key === "l") { e.preventDefault(); applyScientific("ln"); }
    else if (key === "g") { e.preventDefault(); applyScientific("log"); }
    else if (key === "q") { e.preventDefault(); applyScientific("sqrt"); }
    else if (key === "p") { e.preventDefault(); applyScientific("pi"); }
    else if (key === "i" || key === "I") { e.preventDefault(); toggleInverseMode(); }
}

// ========== INITIALIZATION ==========
function init() {
    loadSavedTheme();
    bindEvents();
    window.addEventListener("keydown", onKeyboard);
    clearAll();
}

// Theme toggle event
modeToggle.addEventListener("click", toggleTheme);

// Start the app
init();
