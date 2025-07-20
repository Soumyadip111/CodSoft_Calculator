class Calculator {
  constructor() {
    this.currentInput = '0';
    this.previousInput = '';
    this.operator = null;
    this.waitingForOperator = false;
    this.history = '';
    
    this.display = {
      current: document.getElementById('current'),
      history: document.getElementById('history')
    };
    
    this.initializeEventListeners();
    this.updateDisplay();
  }
  
  initializeEventListeners() {
    // Button click events
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.matches('[data-number]')) {
          this.inputNumber(target.dataset.number);
        }
        
        if (target.matches('[data-action]')) {
          this.handleAction(target.dataset.action);
        }
      });
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }
  
  handleKeyboard(e) {
    e.preventDefault();
    
    if (e.key >= '0' && e.key <= '9') {
      this.inputNumber(e.key);
    } else if (e.key === '.') {
      this.inputDecimal();
    } else if (e.key === '+') {
      this.handleOperator('add');
    } else if (e.key === '-') {
      this.handleOperator('subtract');
    } else if (e.key === '*') {
      this.handleOperator('multiply');
    } else if (e.key === '/') {
      this.handleOperator('divide');
    } else if (e.key === '%') {
      this.handleOperator('percent');
    } else if (e.key === 'Enter' || e.key === '=') {
      this.calculate();
    } else if (e.key === 'Escape') {
      this.clearAll();
    } else if (e.key === 'Backspace') {
      this.clear();
    }
  }
  
  handleAction(action) {
    switch (action) {
      case 'clear-all':
        this.clearAll();
        break;
      case 'clear':
        this.clear();
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'equals':
        this.calculate();
        break;
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
      case 'percent':
        this.handleOperator(action);
        break;
    }
  }
  
  inputNumber(num) {
    if (this.waitingForOperator) {
      this.currentInput = num;
      this.waitingForOperator = false;
    } else {
      this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
    }
    
    this.updateDisplay();
  }
  
  inputDecimal() {
    if (this.waitingForOperator) {
      this.currentInput = '0.';
      this.waitingForOperator = false;
    } else if (this.currentInput.indexOf('.') === -1) {
      this.currentInput += '.';
    }
    
    this.updateDisplay();
  }
  
  clear() {
    if (this.currentInput !== '0') {
      this.currentInput = this.currentInput.slice(0, -1) || '0';
    }
    this.updateDisplay();
  }
  
  clearAll() {
    this.currentInput = '0';
    this.previousInput = '';
    this.operator = null;
    this.waitingForOperator = false;
    this.history = '';
    this.removeActiveOperator();
    this.updateDisplay();
  }
  
  handleOperator(nextOperator) {
    const inputValue = parseFloat(this.currentInput);
    
    if (this.previousInput === '') {
      this.previousInput = inputValue;
    } else if (this.operator) {
      const currentValue = this.previousInput || 0;
      const newValue = this.performCalculation(currentValue, inputValue, this.operator);
      
      if (newValue === null) return;
      
      this.currentInput = String(newValue);
      this.previousInput = newValue;
      
      this.updateHistory(currentValue, this.operator, inputValue, newValue);
    }
    
    this.waitingForOperator = true;
    this.operator = nextOperator;
    this.setActiveOperator(nextOperator);
    this.updateDisplay();
  }
  
  calculate() {
    const inputValue = parseFloat(this.currentInput);
    
    if (this.previousInput !== '' && this.operator) {
      const currentValue = this.previousInput;
      const newValue = this.performCalculation(currentValue, inputValue, this.operator);
      
      if (newValue === null) return;
      
      this.updateHistory(currentValue, this.operator, inputValue, newValue);
      
      this.currentInput = String(newValue);
      this.previousInput = '';
      this.operator = null;
      this.waitingForOperator = true;
      this.removeActiveOperator();
      this.updateDisplay();
    }
  }
  
  performCalculation(firstOperand, secondOperand, operator) {
    let result;
    
    switch (operator) {
      case 'add':
        result = firstOperand + secondOperand;
        break;
      case 'subtract':
        result = firstOperand - secondOperand;
        break;
      case 'multiply':
        result = firstOperand * secondOperand;
        break;
      case 'divide':
        if (secondOperand === 0) {
          this.showError('Cannot divide by zero');
          return null;
        }
        result = firstOperand / secondOperand;
        break;
      case 'percent':
        result = firstOperand * (secondOperand / 100);
        break;
      default:
        return null;
    }
    
    // Handle precision issues with floating point arithmetic
    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    
    // Check for overflow
    if (!isFinite(result)) {
      this.showError('Result too large');
      return null;
    }
    
    return result;
  }
  
  updateHistory(first, operator, second, result) {
    const operatorSymbols = {
      'add': '+',
      'subtract': '−',
      'multiply': '×',
      'divide': '÷',
      'percent': '%'
    };
    
    this.history = `${this.formatNumber(first)} ${operatorSymbols[operator]} ${this.formatNumber(second)} = ${this.formatNumber(result)}`;
  }
  
  formatNumber(num) {
    // Format number for display, handling very large and very small numbers
    if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
      return num.toExponential(2);
    }
    
    // Remove trailing zeros after decimal point
    return parseFloat(num.toFixed(8)).toString();
  }
  
  showError(message) {
    this.currentInput = 'Error';
    this.history = message;
    this.updateDisplay();
    
    // Clear error after 2 seconds
    setTimeout(() => {
      this.clearAll();
    }, 2000);
  }
  
  setActiveOperator(operator) {
    this.removeActiveOperator();
    const operatorButton = document.querySelector(`[data-action="${operator}"]`);
    if (operatorButton) {
      operatorButton.classList.add('active');
    }
  }
  
  removeActiveOperator() {
    document.querySelectorAll('.btn-operator').forEach(btn => {
      btn.classList.remove('active');
    });
  }
  
  updateDisplay() {
    // Format current input for display
    let displayValue = this.currentInput;
    
    if (displayValue !== 'Error' && displayValue !== '0') {
      const num = parseFloat(displayValue);
      if (!isNaN(num)) {
        displayValue = this.formatNumber(num);
      }
    }
    
    // Truncate display if too long
    if (displayValue.length > 12) {
      displayValue = parseFloat(displayValue).toExponential(5);
    }
    
    this.display.current.textContent = displayValue;
    this.display.history.textContent = this.history;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});

// Add some visual feedback for button presses
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
});

