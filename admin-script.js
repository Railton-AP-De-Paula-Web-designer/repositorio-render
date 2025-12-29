
const btnTrava = document.getElementById('btn-trava');
const textoTrava = btnTrava.querySelector('.texto-trava');
const iconeCadeado = btnTrava.querySelector('.icone-cadeado');
const inputsEstoque = document.querySelectorAll('.input-estoque');
const cards = document.querySelectorAll('.card-produto');

let cliquesTrava = 0
let timerTrava;

// 2. Função para Atualizar as Cores dos Cards (Mecânica de Alerta)
function atualizarCorCard(input) {
    const card = input.closest('.card-produto');
    const valor = parseInt(input.value) || 0;


    // Remove clases antigas
    card.classList.remove('estoque-ok', 'estoque-atencao', 'estoque-critico', 'status-vazio');

    // Aplica a nova regra de cores baseada no estoque

    if (valor <= 3) {
        card.classList.add('estoque-critico'); // Vermelho (Gera o efeito riscado no Totem)

    } else if (valor <=10){
        card.classList.add('estoque-atencao') // amarelo
    } else {
        card.classList.add('estoque-ok'); //verde
    }
   
    
}

 // 3. Lógica da Trava de Segurança (3 Cliques)
 btnTrava.addEventListener('click', () =>{
    cliquesTrava++;

    // Reinicia o contador se demorar mais de 2 segundos entre os cliques
    clearTimeout(timerTrava);
    timerTrava = setTimeout(() => { cliquesTrava = 0;}, 2000);

    if (cliquesTrava === 3){
        alternarEstadoSistema();
        cliquesTrava = 0;
    }
 })

 function alternarEstadoSistema() {
    const estadoBloqueado = btnTrava.classList.contains('bloqueado')

    if (estadoBloqueado) {
        //liberar Sistema
        btnTrava.classList.replace('bloqueado', 'liberado');
        textoTrava.innerText = "sISTEMA LIBERADO";
        iconeCadeado.innerText ="🔓";
        inputsEstoque.forEach(input => input.disabled = false);
    } else {
        //bloquear Sistema
        btnTrava.classList.replace('liberado', 'bloqueado');
        textoTrava.innerText = "SISTEMA BLOQUEADO";
        iconeCadeado.innerText = "🔒"
        inputsEstoque.forEach(input => input.disabled = true);

        // Aqui chamaremos a função de salvar no banco.db futuramente
        salvarAlteracoesNoBanco();

    }

 }

 // 4. Monitoramento de Alterações (Inputs Manuais)

 inputsEstoque.forEach(input => {
    //atualiza a cor  assim que a pagina carrega
    atualizarCorCard(input);

    //Atualiza a cor quando o usuario digita

    input.addEventListener('input', () => {
        atualizarCorCard(input);
    })
 })

// 5. Integração REAL com o Back-end no RENDER
const API_URL = "https://repositorio-render-ck8j.onrender.com";

// Função para BUSCAR dados ao carregar a página
async function carregarDadosDoBanco() {
    const statusDb = document.getElementById('db-status');
    const ponto = document.querySelector('.ponto-conexao');

    try {
        statusDb.innerText = "Sincronizando...";
        const resposta = await fetch(`${API_URL}/estoque`);
        
        if (resposta.ok) {
            const dados = await resposta.json();
            
            // Se houver dados no banco, atualiza os inputs da tela
            dados.forEach(item => {
                const card = document.querySelector(`[data-sabor="${item.sabor}"]`);
                if (card) {
                    const input = card.querySelector('.input-estoque');
                    input.value = item.quantidade;
                    atualizarCorCard(input); // Atualiza a cor (verde/amarelo/vermelho)
                }
            });

            statusDb.innerText = "Sincronizado";
            ponto.style.background = "#2ecc71"; // FICA VERDE AQUI!
        }
    } catch (err) {
        statusDb.innerText = "Erro de Conexão";
        ponto.style.background = "#ff4d4d";
        console.error("Servidor ainda está acordando ou link errado.");
    }
}

// 6. Função para SALVAR (Já existente, mas otimizada)
async function salvarAlteracoesNoBanco() {
    const statusDb = document.getElementById('db-status');
    const ponto = document.querySelector('.ponto-conexao');
    const cards = document.querySelectorAll('.card-produto');
    const listaParaEnviar = [];

    cards.forEach(card => {
        const sabor = card.getAttribute('data-sabor');
        const qtd = card.querySelector('.input-estoque').value;
        listaParaEnviar.push({ sabor: sabor, quantidade: parseInt(qtd) || 0 });
    });

    try {
        const resposta = await fetch(`${API_URL}/atualizar-estoque`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listaParaEnviar)
        });

        if (resposta.ok) {
            statusDb.innerText = "Sincronizado";
            ponto.style.background = "#2ecc71";
        }
    } catch (err) {
        statusDb.innerText = "Erro ao Salvar";
        ponto.style.background = "#ff4d4d";
    }
}

// EXECUTA AUTOMATICAMENTE AO ABRIR A PÁGINA
carregarDadosDoBanco();