const input = document.getElementById('input');
const segmento = document.documentElement.style;
const button = document.querySelector('.button');

const onClickHandler = (event) => {
  event.preventDefault();
  let numeroDigitado = input.value.split('');
  tamanhoDoNumero(numeroDigitado);
  // const numeroParaDisplay = binarioParaDisplay(numeroDigitado);
};

// na saida, tenho um numero binario em formato de array
const decimalParaBinario = (num) => {
  let dec = parseInt(num);
  let bin = dec.toString(2);
  let arrBinarioStr = ('binario', bin.padStart(4, '0').split(''));
  return arrBinarioStr.map((str) => Number(str));
};

const binarioParaDisplay = (num) => {
  const arr = decimalParaBinario(num);
  let A = arr[3];
  let B = arr[2];
  let C = arr[1];
  let D = arr[0];

  let seg_a = D || B || (!C && !A) || (C && A);
  let seg_b = !C || (!B && !A) || (B && A);
  let seg_c = C || !B + A;
  let seg_d = D || (!C && !A) || (!C && B) || (B && !A) || (C && !B && A);
  let seg_e = (!C && !A) || (B && !A);
  let seg_f = D || (!B && !A) || (C && !B) || (C && !A);
  let seg_g = D || (C && !B) || (C && !A) || (!C && B);

  return [seg_a, seg_b, seg_c, seg_d, seg_e, seg_f, seg_g];
};

button.addEventListener('click', onClickHandler);

/* seletor: centena = 0, dezena = 1, unidade = 2*/

let estado = '#262A34';
let corpadrao = '#dddddd';

const display = (numBinario, seletor, estado) => {
  numBinario.forEach((num, index) => {
    if (num) {
      segmento.setProperty(`--seg${index}-${seletor}-color`, `${estado}`);
    } else {
      segmento.setProperty(`--seg${index}-${seletor}-color`, `${corpadrao}`);
    }
  });
};

let arrteste = [];

const tamanhoDoNumero = (numero) => {
  if (numero.length === 3) {
    numero.forEach((numero, index) => {
      display(binarioParaDisplay(numero), index, estado);
    });
  } else if (numero.length === 2) {
    numero.forEach((numero, index) => {
      display(binarioParaDisplay(numero), index, estado);
    });
  } else if (numero.length === 1) {
    numero.forEach((numero, index) => {
      display(binarioParaDisplay(numero), index, estado);
    });
  }
};
