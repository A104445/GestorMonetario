const botaoEnviar = document.getElementById('botao-enviar');
const caixaRazao = document.getElementById('caixa-razao');
const caixaValor = document.getElementById('caixa-valor');
const tipoTransacao = document.getElementById('tipo-transacao');
const listaTransacoes = document.getElementById('lista-transacoes');
const valorSaldoTexto = document.getElementById('valor-saldo');

// 1. Criamos a lista (Array) para guardar os dados em memória
let transacoes = [];

// 2. Função que desenha tudo no ecrã
function atualizarInterface() {
    listaTransacoes.innerHTML = ""; // Limpa a lista atual
    let saldoTotal = 0;

    if (transacoes.length === 0) {
        listaTransacoes.innerHTML = '<li class="mensagem-vazia">Ainda sem movimentos</li>';
    }

    transacoes.forEach((t, index) => {
        // Cálculo do saldo
        if (t.tipo === "entrada") {
            saldoTotal += t.valor;
        } else {
            saldoTotal -= t.valor;
        }

        // Dentro da função onde geras a lista:
const novoItem = document.createElement('li');
novoItem.innerHTML = `
    <span>${razao}</span>
    <div class="valor-e-acoes">
        <strong style="color: ${tipo === 'entrada' ? 'green' : 'red'}">
            ${tipo === 'entrada' ? '+' : '-'} ${valor.toFixed(2)} €
        </strong>
        <button class="btn-apagar" onclick="removerTransacao(${index})">x</button>
    </div>
`;
listaTransacoes.appendChild(novoItem);
    });

    valorSaldoTexto.innerText = saldoTotal.toFixed(2) + " €";
}

// 3. Evento do Botão Registar
botaoEnviar.addEventListener('click', function() {
    const razao = caixaRazao.value;
    const valor = parseFloat(caixaValor.value);
    const tipo = tipoTransacao.value;
    
    if (razao === "" || isNaN(valor)) {
        alert("Preenche os campos corretamente!");
        return;
    }

    // Adiciona o novo objeto à nossa lista
    transacoes.push({ razao, valor, tipo });

    atualizarInterface(); // Redesenha a app

    caixaRazao.value = "";
    caixaValor.value = "";
});

// 4. Função para remover
function removerTransacao(index) {
    transacoes.splice(index, 1); // Remove da lista
    atualizarInterface(); // Redesenha a app
}   