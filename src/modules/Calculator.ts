interface Button {
  type: string;
  value: string;
}

interface History {
  operation: Function;
  leftNumber: number;
  rightNumber: number;
}

const add: Function = (number1: number, number2: number): number => number1 + number2;
const subtract: Function = (number1: number, number2: number): number => number1 - number2;
const divide: Function = (number1: number, number2: number): number => number1 / number2;
const multiply: Function = (number1: number, number2: number): number => number1 * number2;

const operations: {[index: string]: Function} = {
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
};

class Calculator {
  currentTotal: number;
  currentOperatorActive: string;
  lastOperatorPressed: string;
  displayShouldClear: boolean;
  onDisplayUpdateHandlers: Array<Function>;
  onDisplay: string;
  history: History[];

  constructor() {
    this.history = [];
    this.onDisplayUpdateHandlers = [];
    this.clear();
  }

  fireDisplayUpdateHandlers = (): void => {
    this.onDisplayUpdateHandlers.forEach((func) => func(this.onDisplay));
  };

  onDisplayUpdate = (func: Function): void => {
    this.onDisplayUpdateHandlers.push(func);
  };

  offDisplayUpdate = (func: Function): boolean => {
    const index = this.onDisplayUpdateHandlers.indexOf(func);
    if (index > -1) {
      this.onDisplayUpdateHandlers.splice(index, 1);
      return true;
    }
    return false;
  };

  numberPressed = (btn: Button) => {
    const isNegativeZero = this.onDisplay === '-0';
    if (this.displayShouldClear) {
      this.clear();
      this.displayShouldClear = false;
    }

    if (this.currentOperatorActive && this.onDisplay && !isNegativeZero) {
      this.removeHangingDecimal();

      if (this.currentTotal) {
        const operation = operations[this.lastOperatorPressed];
        const result = operation(this.currentTotal, parseFloat(this.onDisplay));
        this.currentTotal = result;
      } else {
        this.currentTotal = parseFloat(this.onDisplay);
      }

      this.onDisplay = null;

      this.lastOperatorPressed = this.currentOperatorActive;
      this.currentOperatorActive = null;
    }

    if (this.onDisplay === null || isNegativeZero) {
      this.onDisplay = isNegativeZero ? '-' + btn.value : btn.value;
      this.fireDisplayUpdateHandlers();
      return;
    }

    if (this.onDisplay === '0' && btn.value === '0') {
      return;
    }

    this.onDisplay = this.onDisplay + btn.value;
    this.fireDisplayUpdateHandlers();
    return;
  };

  removeHangingDecimal = () => {
    if (this.onDisplay.indexOf('.') === this.onDisplay.length) {
      this.onDisplay = this.onDisplay.slice(0, this.onDisplay.length - 1);
    }
  };

  evaluate = () => {
    if (!this.currentOperatorActive && !this.lastOperatorPressed) return;

    this.removeHangingDecimal();

    let leftNumber;
    let rightNumber;
    let operation;
    if (this.displayShouldClear) {
      const latestOperation = this.history[this.history.length - 1];
      leftNumber = parseFloat(this.onDisplay);
      rightNumber = latestOperation.rightNumber;
      operation = latestOperation.operation;
    } else {
      leftNumber = this.currentTotal;
      rightNumber = parseFloat(this.onDisplay);
      operation = operations[this.currentOperatorActive || this.lastOperatorPressed];
    }

    const result = operation(leftNumber, rightNumber);
    this.currentTotal = null;
    this.onDisplay = result.toString();
    this.fireDisplayUpdateHandlers();
    this.displayShouldClear = true;
    this.history.push({
      operation: operation,
      leftNumber,
      rightNumber,
    });
    return result;
  };

  clear = () => {
    this.onDisplay = null;
    this.fireDisplayUpdateHandlers();
    this.currentTotal = null;
    this.currentOperatorActive = null;
    this.lastOperatorPressed = null;
    this.displayShouldClear = true;
  };

  actionPressed = (btn: Button) => {
    switch (btn.value) {
      case 'evaluate':
        this.evaluate();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        this.currentOperatorActive = btn.value;
        this.displayShouldClear = false;
        break;
      case 'clear':
        this.clear();
        break;
      case '.':
        if (typeof this.onDisplay === 'string' && !this.onDisplay.includes('.') && this.onDisplay.length > 0 && !this.displayShouldClear) {
          const newVal = this.onDisplay + '.';
          this.onDisplay = newVal;
          this.fireDisplayUpdateHandlers();
        } else if (this.displayShouldClear || this.onDisplay === null) {
          const newVal = '0.';
          this.onDisplay = newVal;
          this.fireDisplayUpdateHandlers();
          this.displayShouldClear = false;
        }
        break;
      case 'switchPolarity':
        if (this.currentOperatorActive && this.onDisplay) {
          this.currentTotal = parseFloat(this.onDisplay);
        }
        if (!this.onDisplay || (this.onDisplay && this.currentOperatorActive)) {
          this.onDisplay = '0';
        }
        if (this.onDisplay.substr(0, 1) === '-') {
          this.onDisplay = this.onDisplay.substr(1, this.onDisplay.length);
        } else {
          this.onDisplay = '-' + this.onDisplay;
        }
        this.displayShouldClear = false;
        this.fireDisplayUpdateHandlers();
        break;
      default:
        break;
    }
  };

  buttonPressed = (btn: Button) => {
    switch (btn.type) {
      case 'number':
        this.numberPressed(btn);
        break;
      case 'operator':
        this.actionPressed(btn);
        break;
      default:
        throw new Error('Esse tipo de botão é inválido.');
    }
    return;
  };

  pressButtons = (arr: Array<Button>) => {
    arr.forEach(this.buttonPressed);
  };
}
export default Calculator;
