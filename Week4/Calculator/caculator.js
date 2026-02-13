/**
 * CALCULATOR LOGIC
 * Class Calculator quản lý toàn bộ trạng thái và phương thức tính toán
 */
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    // Xóa toàn bộ dữ liệu
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    // Xóa ký tự cuối cùng
    delete() {
        if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    // Thêm số vào màn hình
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return; // Chỉ cho phép 1 dấu chấm
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // Chọn phép tính (+, -, *, /)
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        // Nếu đã có phép tính trước đó chưa thực hiện xong, tính luôn
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    // Thực hiện tính toán
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

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
            case '/': // Xử lý chia cho 0
                if (current === 0) {
                    computation = "Infinity"; 
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        // Làm tròn số để tránh lỗi floating point (vd: 0.1 + 0.2)
        if (computation !== "Infinity") {
             computation = Math.round(computation * 100000000) / 100000000;
        }
        
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
    }

    // Cập nhật giao diện
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            // Hiển thị dấu phép tính trên màn hình phụ
            let opSymbol = this.operation;
            if(opSymbol === '/') opSymbol = '÷';
            if(opSymbol === '*') opSymbol = '×';
            this.previousOperandTextElement.innerText = `${this.previousOperand} ${opSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// --- KHỞI TẠO VÀ SỰ KIỆN ---

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

const buttons = document.querySelectorAll('button');

// Sự kiện Click chuột / Touch
buttons.forEach(button => {
    button.addEventListener('click', () => {
        handleInput(button);
    });
});

// Sự kiện Bàn phím
document.addEventListener('keydown', (e) => {
    let key = e.key;
    
    // Mapping phím đặc biệt
    if (key === 'Enter') key = '=';
    if (key === 'Backspace') key = 'delete';
    if (key === 'Escape') key = 'clear';
    
    // Tìm nút tương ứng để xử lý logic và hiệu ứng
    let button;
    if(key === 'clear' || key === 'delete' || key === '=') {
        // Tìm theo data-action cho các phím chức năng
        // Logic này hơi đơn giản hóa, nhưng đủ cho yêu cầu
         const actionMap = { 'clear': 'clear', 'delete': 'delete', '=': 'calculate' };
         button = document.querySelector(`button[data-action="${actionMap[key]}"]`);
    } else {
        // Tìm theo data-key cho số và phép tính
        button = document.querySelector(`button[data-key="${key}"]`);
    }

    if (button) {
        button.click(); // Trigger logic
        button.classList.add('pressed'); // Trigger animation
        setTimeout(() => button.classList.remove('pressed'), 100);
    }
});

// Hàm xử lý logic trung tâm
function handleInput(button) {
    if (button.hasAttribute('data-key')) {
        const value = button.getAttribute('data-key');
        if (['+', '-', '*', '/'].includes(value)) {
            calculator.chooseOperation(value);
        } else {
            calculator.appendNumber(value);
        }
    } else if (button.hasAttribute('data-action')) {
        const action = button.getAttribute('data-action');
        if (action === 'clear') calculator.clear();
        if (action === 'delete') calculator.delete();
        if (action === 'calculate') calculator.compute();
    }
    calculator.updateDisplay();
}
