const input = document.getElementById('input');
const segmento = document.documentElement.style;
const button = document.querySelector('.button');
const displayContainer = document.querySelector('.container-display');
const novaPartidaButton = document.querySelector('.nova-partida_button');
let mensagem = document.querySelector('.mensagem');

let estado = '#262A34';
let secretNumber = '';
let corpadrao = '#dddddd';
// let html = '';

const HTML = `
<div class="display-7seg display-centena">
  <div class="segA centena"></div>
  <div class="segB centena"></div>
  <div class="segC centena"></div>
  <div class="segD centena"></div>
  <div class="segE centena"></div>
  <div class="segF centena"></div>
  <div class="segG-1 centena"></div>
  <div class="segG-2 centena"></div>
</div>`;

const HTML2 = `
<div class="display-7seg display-dezena">
  <div class="segA dezena"></div>
  <div class="segB dezena"></div>
  <div class="segC dezena"></div>
  <div class="segD dezena"></div>
  <div class="segE dezena"></div>
  <div class="segF dezena"></div>
  <div class="segG-1 dezena"></div>
  <div class="segG-2 dezena"></div>
</div>`;

const HTML3 = `
  <div class="display-7seg display-unidade">
    <div class="segA unidade"></div>
    <div class="segB unidade"></div>
    <div class="segC unidade"></div>
    <div class="segD unidade"></div>
    <div class="segE unidade"></div>
    <div class="segF unidade"></div>
    <div class="segG-1 unidade"></div>
    <div class="segG-2 unidade"></div>
  </div`;

const getSecretNumber = async function () {
  try {
    const resp = await fetch(
      'https://us-central1-ss-devops.cloudfunctions.net/rand?min=1&max=300'
    );
    if (!resp.ok) throw new Error(resp.status);
    console.log(resp);
    const data = await resp.json();
    secretNumber = data.value;
    console.log('novo numero secreto');
  } catch (err) {
    estado = 'rgba(204, 51, 0, 1)';
    mensagem.classList.add('erro');
    mensagem.textContent = 'ERRO';
    novaPartidaButton.classList.toggle('hidden');
    segmento.setProperty('--form-button-color', '#dddddd');
    segmento.setProperty('--form-border-color', '#CFCFCF');
    segmento.setProperty('--form-background-color', '#F5F5F5');
    displayOnScreen(err.message);
  }
};

getSecretNumber();

const eviarHandler = (event) => {
  event.preventDefault();
  if (estado === '#262A34') {
    let enteredNumber = input.value;
    checkSecretNumber(enteredNumber);
    displayOnScreen(enteredNumber);
    input.value = '';
    console.log('secret', secretNumber);
    console.log('cliquei');
  }
};

const novaPartidaHandler = () => {
  estado = '#262A34';
  mensagem.classList.remove('correct');
  getSecretNumber();
  displayOnScreen('0');
  mensagem.textContent = '';
  novaPartidaButton.classList.toggle('hidden');
  segmento.setProperty(
    '--form-button-color',
    'linear-gradient(180deg, #ef6c00 0%, #c0661c 100%)'
  );
  segmento.setProperty('--form-border-color', '#ff6600');
  segmento.setProperty('--form-background-color', '#ffffff');
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

/* seletor: centena = 0, dezena = 1, unidade = 2*/

const displayOn7Seg = (numBinario, seletor, estado) => {
  numBinario.forEach((num, index) => {
    if (num) {
      segmento.setProperty(`--seg${index}-${seletor}-color`, `${estado}`);
    } else {
      segmento.setProperty(`--seg${index}-${seletor}-color`, `${corpadrao}`);
    }
  });
};

const displayOnScreen = (enteredNumber) => {
  const numero = enteredNumber.split('');
  if (numero.length === 3) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.add('display3');
    while (displayContainer.firstChild) {
      displayContainer.firstChild.remove();
    }
    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);
    displayContainer.insertAdjacentHTML('beforeend', HTML3);
    numero.forEach((numero, index) => {
      displayOn7Seg(binarioParaDisplay(numero), index, estado);
    });
  } else if (numero.length === 2) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.add('display2');
    displayContainer.classList.remove('display3');
    while (displayContainer.firstChild) {
      displayContainer.firstChild.remove();
    }
    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);
    numero.forEach((numero, index) => {
      displayOn7Seg(binarioParaDisplay(numero), index, estado);
    });
  } else if (numero.length === 1) {
    displayContainer.classList.add('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.remove('display3');
    while (displayContainer.firstChild) {
      displayContainer.firstChild.remove();
    }
    displayContainer.insertAdjacentHTML('beforeend', HTML);
    numero.forEach((numero, index) => {
      displayOn7Seg(binarioParaDisplay(numero), index, estado);
    });
  }
};

const compareToSecretNumber = (number) => {
  mensagem.textContent = secretNumber > Number(number) ? 'É maior' : 'É menor';
};

const checkSecretNumber = (number) => {
  if (secretNumber === Number(number)) {
    estado = 'rgba(50, 191, 0, 1)';
    mensagem.classList.add('correct');
    mensagem.textContent = 'Você acertou!!!!';
    novaPartidaButton.classList.toggle('hidden');
    segmento.setProperty('--form-button-color', '#dddddd');
    segmento.setProperty('--form-border-color', '#CFCFCF');
    segmento.setProperty('--form-background-color', '#F5F5F5');
  } else if (secretNumber !== number) {
    estado = '#262A34';
    compareToSecretNumber(number);
  }
};

displayOnScreen('0');
