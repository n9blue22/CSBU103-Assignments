class Calculator {
    constructor() {
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
    }

    appendNumber(number) {
        this.currentInput += number;
    }

    chooseOperation(operation) {
        if (this.currentInput === '') return;
        if (this.previousInput !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousInput = this.currentInput;
        this.currentInput = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                computation = prev / current;
                break;
            default:
                return;
        }
        this.currentInput = computation;
        this.operation = null;
        this.previousInput = '';
    }

    updateDisplay(display) {
        display.value = this.currentInput;
    }

    clear() {
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
    }
}

const calculator = new Calculator();
const display = document.getElementById('display');

// Event handlers
const numberButtons = document.querySelectorAll('.number');
const operationButtons = document.querySelectorAll('.operation');
const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay(display);
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay(display);
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay(display);
});

clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay(display);
});

// Keyboard support
window.addEventListener('keydown', (e) => {
    if (/[0-9]/.test(e.key)) {
        calculator.appendNumber(e.key);
        calculator.updateDisplay(display);
    }
    if (['+', '-', '*', '/'].includes(e.key)) {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay(display);
    }
    if (e.key === 'Enter') {
        calculator.compute();
        calculator.updateDisplay(display);
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay(display);
    }
});