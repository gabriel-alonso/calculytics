import Calculator from './modules/Calculator';

/**
 * Declare interface ElementEvent.
 * @author Gabriel Alonso
 */
declare interface ElementEvent extends Event {
  currentTarget: HTMLElement; //alvo atual
  target: HTMLElement; //alvo posterior
}

/**
 * Main Function of the calculator.
 * @return void
 * @author Gabriel Alonso
 */
function main() {
  const display: HTMLParagraphElement = document.querySelector('p#display'); //é um interface que fornece propriedades especiais de um <p> elemento.
  const calc = new Calculator(); //cria um objeto da classe calculadora.
  const calcBtns = document.querySelectorAll('.calcButton'); //vai retornar as informações desse selector, então nesse caso vai informações sobre o botão.

  const handleDisplayUpdate = (val: string) => {
    display.innerText = val ? val : '0';
  };

  calc.onDisplayUpdate(handleDisplayUpdate);

  const handleBtnClick = (e: ElementEvent) => {
    const el = e.currentTarget;
    const {value, type} = el.dataset;
    calc.buttonPressed({
      type,
      value,
    });
  };

  calcBtns.forEach((btn) => btn.addEventListener('click', handleBtnClick));
}

document.addEventListener('DOMContentLoaded', main);
