/**
 * dashboard.js
 * Controla a lógica da página do painel de gráficos (dashboard.html).
 */

// URL base da nossa API
const URL_DA_API = 'http://localhost:8080/api_lanches/';

// --- Mapeamento dos Elementos do HTML ---
// Controles de Filtro
const periodoVendasSelect = document.getElementById('periodo-vendas');
const dataEspecificaInput = document.getElementById('data-especifica');
const btnAtualizarGraficos = document.getElementById('btn-atualizar-graficos');

// Telas (Canvas) dos Gráficos
const vendasPorHoraCanvas = document.getElementById('vendasPorHoraChart');
const maisVendidosCanvas = document.getElementById('maisVendidosChart');
const pagamentosCanvas = document.getElementById('pagamentosChart');

// Variáveis para guardar as instâncias dos gráficos (para poder atualizá-los)
let vendasPorHoraChart;
let maisVendidosChart;
let pagamentosChart;


// --- Funções de Carregamento dos Gráficos ---

/**
 * Busca os dados de vendas por hora para uma data específica e desenha o gráfico de linha.
 * @param {string} data - A data no formato AAAA-MM-DD. Se vazio, a API usará a data atual.
 */
async function carregarGraficoVendasPorHora(data = '') {
    const url = new URL(`${URL_DA_API}get_vendas_por_dia.php`);
    if (data) url.searchParams.append('data', data);

    const response = await fetch(url);
    const resultado = await response.json();

    if (resultado.sucesso) {
        const labels = resultado.vendas.map(venda => venda.hora);
        const data = resultado.vendas.map(venda => parseFloat(venda.total_vendas));

        // Se o gráfico já existir, destrói a instância antiga antes de criar uma nova
        if (vendasPorHoraChart) {
            vendasPorHoraChart.destroy();
        }

        vendasPorHoraChart = new Chart(vendasPorHoraCanvas, {
            type: 'line', // Tipo do gráfico
            data: {
                labels: labels,
                datasets: [{
                    label: `Vendas em ${resultado.data}`,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            }
        });
    }
}

/**
 * Busca os 5 produtos mais vendidos para um período e desenha o gráfico de barras.
 * @param {string} periodo - 'dia', 'semana' ou 'mes'.
 */
async function carregarGraficoMaisVendidos(periodo = 'dia') {
    const response = await fetch(`${URL_DA_API}get_mais_vendidos_dashboard.php?periodo=${periodo}`);
    const resultado = await response.json();

    if (resultado.sucesso) {
        const labels = resultado.mais_vendidos.map(item => item.nome);
        const data = resultado.mais_vendidos.map(item => item.total_vendido);

        if (maisVendidosChart) {
            maisVendidosChart.destroy();
        }

        maisVendidosChart = new Chart(maisVendidosCanvas, {
            type: 'bar', // Tipo do gráfico
            data: {
                labels: labels,
                datasets: [{
                    label: `Quantidade Vendida`,
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Mais Vendidos (${resultado.periodo})`
                    }
                }
            }
        });
    }
}

/**
 * Busca os totais por forma de pagamento para uma data e desenha o gráfico de pizza.
 * @param {string} data - A data no formato AAAA-MM-DD. Se vazio, a API usará a data atual.
 */
async function carregarGraficoPagamentos(data = '') {
    const url = new URL(`${URL_DA_API}get_pagamentos_por_dia.php`);
    if (data) url.searchParams.append('data', data);
    
    const response = await fetch(url);
    const resultado = await response.json();

    if (resultado.sucesso) {
        const labels = resultado.pagamentos.map(pg => pg.forma_pagamento || 'N/A');
        const data = resultado.pagamentos.map(pg => parseFloat(pg.total));

        if (pagamentosChart) {
            pagamentosChart.destroy();
        }

        pagamentosChart = new Chart(pagamentosCanvas, {
            type: 'doughnut', // Tipo do gráfico (pizza com um furo no meio)
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total (R$)',
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ]
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Pagamentos em ${resultado.data}`
                    }
                }
            }
        });
    }
}

/**
 * Função "maestro" que lê os filtros e chama as funções para atualizar os gráficos.
 */
function atualizarDashboard() {
    const periodo = periodoVendasSelect.value;
    const dataEspecifica = dataEspecificaInput.value;

    // Se uma data específica for escolhida, ela tem prioridade para os gráficos diários.
    if (dataEspecifica) {
        carregarGraficoVendasPorHora(dataEspecifica);
        carregarGraficoPagamentos(dataEspecifica);
    } else {
        // Se não, usa a data de hoje como padrão.
        carregarGraficoVendasPorHora();
        carregarGraficoPagamentos();
    }
    // O gráfico de mais vendidos sempre usa o filtro de período (Hoje, Semana, Mês).
    carregarGraficoMaisVendidos(periodo);
}

// --- Configuração dos Eventos (Listeners) ---

// Quando o botão de atualizar for clicado, chama o maestro.
btnAtualizarGraficos.addEventListener('click', atualizarDashboard);

// Quando a data específica for alterada, limpa o filtro de período para evitar confusão.
dataEspecificaInput.addEventListener('change', () => {
    if (dataEspecificaInput.value) {
        periodoVendasSelect.value = 'dia'; // Volta para 'Hoje' para não confundir
    }
});


// --- Inicialização ---

// Chama o maestro uma vez para carregar os gráficos com os dados de hoje ao abrir a página.
atualizarDashboard();