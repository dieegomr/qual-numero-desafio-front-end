const input = document.querySelector('.input');
const styleVariaveis = document.documentElement.style;
const enviarButton = document.querySelector('.enviar_button');
const displayContainer = document.querySelector('.container-display');
const novaPartidaButton = document.querySelector('.nova-partida_button');
let mensagem = document.querySelector('.mensagem');

let estado = { sitacao: '', cor: '', motivo: 'ok' };
let secretNumber = '';
let corPadrao = '#dddddd';

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

const habilitarDesabilitaFormulario = () => {
  input.classList.toggle('jogando');
  input.classList.toggle('pausado');
  enviarButton.classList.toggle('jogando');
  enviarButton.classList.toggle('pausado');
};

// Condições iniciais do jogo

const novaPartidaHandler = () => {
  // Retira o estado correct da mensagem
  mensagem.classList.remove(estado.motivo);

  // Mudando estado para ok
  estado.cor = '#262A34';
  estado.sitacao = 'jogando';
  estado.motivo = 'ok';

  // Requisita um novo número
  getSecretNumber();

  // Coloca o zero na tela
  renderizarNumeroTela('0');

  // Limpa a mensagem
  mensagem.textContent = '';

  // Oculta o botão Nova Partida
  novaPartidaButton.classList.toggle('hidden');

  // Habilita formulário enviar
  habilitarDesabilitaFormulario();
};

// Requisição do número secreto
const getSecretNumber = async function () {
  try {
    const resp = await fetch(
      'https://us-central1-ss-devops.cloudfunctions.net/rand?min=1&max=300'
    );
    console.log(resp);
    // Confere se tem erro
    if (!resp.ok) throw new Error(resp.status);

    const data = await resp.json();

    // Armazena o numero secreto em uma variável
    secretNumber = data.value;
  } catch (err) {
    // Mudando estado para erro
    estado.cor = 'rgba(204, 51, 0, 1)';
    estado.sitacao = 'pausado';
    estado.motivo = 'erro';

    // Adiciona classe erro
    mensagem.classList.add(estado.motivo);

    // Altera a mensagem
    mensagem.textContent = 'ERRO';

    // Renderiza botão nova partida
    novaPartidaButton.classList.toggle('hidden');

    // Desabilita formulário
    habilitarDesabilitaFormulario();

    // Renderiza erro na tela
    renderizarNumeroTela(err.message);
  }
};

// Ações ao enviar número
const enviarHandler = (event) => {
  event.preventDefault();

  // Converir se o jogo esta jogável
  if (estado.sitacao !== 'jogando') return;

  // Armazena o valor digitado
  let enteredNumber = input.value;

  // Confere se o numero digitado é correto
  checkSecretNumber(enteredNumber);

  // Mostra o número na tela
  renderizarNumeroTela(enteredNumber);

  // Apaga informação do input
  input.value = '';

  ///////////////////////////////// APAGAR
  console.log('secret', secretNumber);
  console.log('cliquei');
  //////////////////////////////////////////
};

// na saida, tenho um numero binario em formato de array
const decimalParaBinario = (numeroString) => {
  let numeroInteiro = parseInt(numeroString);
  let numeroBinario = numeroInteiro.toString(2);
  let arrBinarioStr = numeroBinario.padStart(4, '0').split('');
  return arrBinarioStr.map((str) => Number(str));
};

const converteDecimalPara7Seg = (numero) => {
  const arr = decimalParaBinario(numero);
  let A = arr[3];
  let B = arr[2];
  let C = arr[1];
  let D = arr[0];

  let aSegmento = D || B || (!C && !A) || (C && A);
  let bSegmento = !C || (!B && !A) || (B && A);
  let cSegmento = C || !B + A;
  let dSegmento = D || (!C && !A) || (!C && B) || (B && !A) || (C && !B && A);
  let eSegmento = (!C && !A) || (B && !A);
  let fSegmento = D || (!B && !A) || (C && !B) || (C && !A);
  let gSegmento = D || (C && !B) || (C && !A) || (!C && B);

  return [
    aSegmento,
    bSegmento,
    cSegmento,
    dSegmento,
    eSegmento,
    fSegmento,
    gSegmento,
  ];
};

enviarButton.addEventListener('click', enviarHandler);
novaPartidaButton.addEventListener('click', novaPartidaHandler);

/* seletor: centena = 0, dezena = 1, unidade = 2*/
const renderizarNumero7Seg = (numero, seletor, estado) => {
  let numero7Seg = converteDecimalPara7Seg(numero);
  numero7Seg.forEach((segmento, index) => {
    if (segmento) {
      styleVariaveis.setProperty(
        `--seg${index}-${seletor}-color`,
        `${estado.cor}`
      );
    } else {
      styleVariaveis.setProperty(
        `--seg${index}-${seletor}-color`,
        `${corPadrao}`
      );
    }
  });
};

// Retirar todos os displays de 7 segmentos da tela
const retirarTodos7SegTela = () => {
  while (displayContainer.firstChild) {
    displayContainer.firstChild.remove();
  }
};

// Renderiza números na tela dependendo do tamanho
const renderizarNumeroTela = (enteredNumber) => {
  const arrNumeroDigitado = enteredNumber.split('');

  // Se for uma centena
  if (arrNumeroDigitado.length === 3) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.add('display3');
    retirarTodos7SegTela();

    // Adicionar display de 7 segmentos na tela
    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);
    displayContainer.insertAdjacentHTML('beforeend', HTML3);

    // Renderizar numero na tela
    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });

    // Se for uma dezena
  } else if (arrNumeroDigitado.length === 2) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.add('display2');
    displayContainer.classList.remove('display3');

    retirarTodos7SegTela();

    // Adicionar display de 7 segmentos na tela
    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);

    // Renderizar numero na tela
    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });

    // Se for uma unidade
  } else if (arrNumeroDigitado.length === 1) {
    displayContainer.classList.add('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.remove('display3');

    retirarTodos7SegTela();

    // Adicionar display de 7 segmentos na tela
    displayContainer.insertAdjacentHTML('beforeend', HTML);

    // Renderizar numero na tela
    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });
  }
};

// Compara o numero digitado com o numero secreto
const compareToSecretNumber = (number) => {
  mensagem.textContent = secretNumber > Number(number) ? 'É maior' : 'É menor';
};

const checkSecretNumber = (number) => {
  if (secretNumber === Number(number)) {
    // Muda estado
    estado.cor = 'rgba(50, 191, 0, 1)';
    estado.sitacao = 'pausado';
    estado.motivo = 'ganhou';

    // Adiciona o estado correct para a mensagem
    mensagem.classList.add(estado.motivo);

    // Altera texto da mensagem
    mensagem.textContent = 'Você acertou!!!!';

    // Renderiza o botão nova partida
    novaPartidaButton.classList.toggle('hidden');

    // Desabilita formulário
    habilitarDesabilitaFormulario();
  } else if (secretNumber !== number) {
    // Compara o numero com o numero secreto
    compareToSecretNumber(number);
  }
};

novaPartidaHandler();
