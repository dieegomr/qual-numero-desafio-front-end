const segmento = document.documentElement.style;

let seletor = 'unidade';
let estado = 'blue';

let arr = [0, 0, 0, 0, 0, 0, 0];

const display = (numBinario, seletor, estado) => {
  numBinario.forEach((num, index) => {
    if (num) {
      console.log('entrei');
      segmento.setProperty(`--seg${index}-${seletor}-color`, `${estado}`);
    }
  });
};

display(arr, seletor, estado);

let arrBinario = [];

const decimalParaBinario = (num) => {
  let dec = parseInt(num);
  let bin = dec.toString(2);
  arrBinario = ('binario', bin.padStart(4, '0').split(''));
};

decimalParaBinario(9);

let arrNumbers = arrBinario.map((str) => Number(str));
console.log(arrNumbers);

let A = arrNumbers[3];
let B = arrNumbers[2];
let C = arrNumbers[1];
let D = arrNumbers[0];

let seg_a = D || B || (!C && !A) || (C && A);
let seg_b = !C || (!B && !A) || (B && A);
let seg_c = C || !B + A;
let seg_d = D || (!C && !A) || (!C && B) || (B && !A) || (C && !B && A);
let seg_e = (!C && !A) || (B && !A);
let seg_f = D || (!B && !A) || (C && !B) || (C && !A);
let seg_g = D || (C && !B) || (C && !A) || (!C && B);

let arr1 = [seg_a, seg_b, seg_c, seg_d, seg_e, seg_f, seg_g];

console.log('arr1', arr1);
display(arr1, seletor, estado);
