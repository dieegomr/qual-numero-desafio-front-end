'use strict';

/**
 * @fileoverview O programa consiste em um jogo onde recebe-se um número através de uma requisição e o usuário deve acertar este número através de palpites. Ao errar um palpite, irá ser informado se o número obtido é maior ou menor do que o palpite feito. O palpite realizado ou status code de erro de requisição são exibidos na tela no formato de LED de 7 segmentos. O palpite é recibido através campo de texto, que é processado apenas quando o botão ENVIAR é clicado.
 *
 * A lógica do programa foi baseada em funções, onde cada função desempenha uma atividade específica.
 * Para o algorismo do display, foi utilizado conhecimento prévio de eletrônica sobre funcionamento de displays de 7 segmentos
 * onde usa-se um decodificador de DCB (Decimal Codificado em Binario) em uma combinação para o display de 7 segmentos.
 * Foram utilizados tabela verdade e mapa de karnaugh para criar a lógica decodificadora
 * @author Diego Mendes Rocha
 */

const input = document.querySelector('.input');
const styleVariaveis = document.documentElement.style;
const enviarButton = document.querySelector('.enviar_button');
const displayContainer = document.querySelector('.container-display');
const novaPartidaButton = document.querySelector('.nova-partida_button');
let mensagem = document.querySelector('.mensagem');

/**
 * Objeto que armazena o estado do jogo
 * @type {{situacao: string, cor: string, motivo: string}}
 */
let estado = { situacao: '', cor: '', motivo: 'ok' };

/**
 * Número secreto recebido através da requisição API
 * @type {string}
 */
let numeroSecreto = '';

/**
 * Cor padrão do segmento do display de 7 segmentos
 * @type {string}
 */
let corPadrao = '#dddddd';

/**
 * Limite inferior do número secreto. Configurada para o modo padrão de jogo
 * @type {string}
 */
const limiteInferior = '1';
/**
 * Limite superior do número secreto. Configurada para o modo padrão de jogo
 * @type {string}
 */
const limiteSuperior = '300';

/**
 * HTML para um dos displays de 7 segmentos
 * @type {string}
 */
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

/**
 * HTML para um dos displays de 7 segmentos
 * @type {string}
 */
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

/**
 * HTML para um dos displays de 7 segmentos
 * @type {string}
 */
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

/**
 * Função que Habilita ou Desabilita o formulário manipulando as classes CSS. Classe jogando quando o jogo está em andamento e Classe pausado quando o usuário acertou o número ou houve algum erro
 */
const habilitarDesabilitaFormulario = () => {
  input.classList.toggle('jogando');
  input.classList.toggle('pausado');
  enviarButton.classList.toggle('jogando');
  enviarButton.classList.toggle('pausado');
};

/**
 * Função que coloca o jogo em condições iniciais
 */
const novaPartidaHandler = () => {
  renderizarMensagem('', estado.motivo, 'remove');

  mudarEstadoJogo('#262A34', 'jogando', 'ok');

  getSecretNumber(limiteInferior, limiteSuperior);

  renderizarNumeroTela('0');

  novaPartidaButton.classList.toggle('hidden');

  habilitarDesabilitaFormulario();
};

/**
 * Função que muda o estado do jogo
 * @param {string} cor cor usada nos seguimentos
 * @param {string} situacao Jogo pausado ou em andamento
 * @param {string} motivo Descreve o motivo da situação do jogo
 */
const mudarEstadoJogo = (cor, situacao, motivo) => {
  estado.cor = cor;
  estado.situacao = situacao;
  estado.motivo = motivo;
};

/**
 * Função que faz a requisição do número aleatório e trata os possíveis erros
 * @param {string} min Menor numero que pode ser gerado
 * @param {string} max Maior número que pode ser gerado
 * @throws Gera erro se acontecer algo de errado com a requisição
 */
const getSecretNumber = async function (min, max) {
  try {
    const resp = await fetch(
      `https://us-central1-ss-devops.cloudfunctions.netabc/rand?min=${min}&max=${max}`
    );
    if (!resp.ok) throw new Error(resp.status);

    const data = await resp.json();

    numeroSecreto = data.value;
  } catch (err) {
    mudarEstadoJogo('rgba(204, 51, 0, 1)', 'pausado', 'erro');

    renderizarMensagem('ERRO', estado.motivo, 'add');

    novaPartidaButton.classList.toggle('hidden');

    habilitarDesabilitaFormulario();
    console.log(err);
    renderizarNumeroTela(err.message);
  }
};

/**
 * Renderiza a mensagem em cima do LED
 * @param {string} texto texto que será renderizado
 * @param {string} estilo determina o estilo aplicado
 * @param {string} acao determina se estilo será removido ou adicionado
 */
const renderizarMensagem = (texto, estilo, acao) => {
  mensagem.textContent = texto;
  if (acao === 'add') mensagem.classList.add(estilo);
  if (acao === 'remove') mensagem.classList.remove(estilo);
};

/**
 * Função que trata o numero digitado no input e passa como argumento para as funções "compararComNumeroSecreto" e "renderizarNumeroTela"
 * @param {object} event
 * @returns
 */
const enviarHandler = (event) => {
  event.preventDefault();

  if (estado.situacao !== 'jogando') return;

  let numeroDigitado = input.value;

  comopararComNumeroSecreto(numeroDigitado);

  renderizarNumeroTela(numeroDigitado);

  input.value = '';
};

/**
 * Função que converte um número inteiro para um número binário
 * @param {string} numeroString numero que está no formato string
 * @returns {array} numero binario de 4 bits em formato de array
 */
const inteiroParaBinario = (numeroString) => {
  let numeroInteiro = parseInt(numeroString);
  let numeroBinario = numeroInteiro.toString(2);
  let arrBinarioStr = numeroBinario.padStart(4, '0').split('');
  return arrBinarioStr.map((str) => Number(str));
};

/**
 * Função que converte um número decimal para um numero no display de 7 segmentos.
 * @param {string} numero número que será convertido para 7 bits
 * @returns {array} retorna um array com 7 bits que combinados determinam o numero a ser exibido no display
 */
const converteDecimalPara7Seg = (numero) => {
  const arr = inteiroParaBinario(numero);
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

/**
 * Função que determina qual segmento deve mudar de cor para formar um número no display de 7 segmentos.
 * @param {string} numero numero a ser renderizado no display de 7 segmentos
 * @param {string} seletor determina qual o display de 7segmentos será alterado. Centena = 0, Dezena = 1, Unidade = 2
 * @param {object} estado objeto com a informação da cor de cada segmento
 */
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

/**
 * Função que retira todos os displays de 7 segmentos da tela
 */
const retirarTodos7SegTela = () => {
  while (displayContainer.firstChild) {
    displayContainer.firstChild.remove();
  }
};

/**
 * Função que determina quantos displays de 7 segmentos devem ser renderizados baseado no número digitado. O número digitado é transformado em um array e o tamanho do array determina se é um centena, dezena ou unidade
 * @param {string} numeroDigitado número digitado pelo usuário
 */
const renderizarNumeroTela = (numeroDigitado) => {
  const arrNumeroDigitado = numeroDigitado.split('');

  if (arrNumeroDigitado.length === 3) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.add('display3');

    retirarTodos7SegTela();

    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);
    displayContainer.insertAdjacentHTML('beforeend', HTML3);

    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });
  } else if (arrNumeroDigitado.length === 2) {
    displayContainer.classList.remove('display1');
    displayContainer.classList.add('display2');
    displayContainer.classList.remove('display3');

    retirarTodos7SegTela();

    displayContainer.insertAdjacentHTML('beforeend', HTML);
    displayContainer.insertAdjacentHTML('beforeend', HTML2);

    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });
  } else if (arrNumeroDigitado.length === 1) {
    displayContainer.classList.add('display1');
    displayContainer.classList.remove('display2');
    displayContainer.classList.remove('display3');

    retirarTodos7SegTela();

    displayContainer.insertAdjacentHTML('beforeend', HTML);

    arrNumeroDigitado.forEach((numero, index) => {
      renderizarNumero7Seg(numero, index, estado);
    });
  }
};

/**
 * Função que compara o número digitado com o número secreto
 * @param {string} number Numero a ser comparado com o número secreto
 */
const comopararComNumeroSecreto = (number) => {
  if (numeroSecreto === Number(number)) {
    mudarEstadoJogo('rgba(50, 191, 0, 1)', 'pausado', 'ganhou');

    renderizarMensagem('Você acertou!!!!', estado.motivo, 'add');

    novaPartidaButton.classList.toggle('hidden');

    habilitarDesabilitaFormulario();
  } else if (numeroSecreto !== number) {
    mensagem.textContent =
      numeroSecreto > Number(number) ? 'É maior' : 'É menor';
  }
};

novaPartidaHandler();
