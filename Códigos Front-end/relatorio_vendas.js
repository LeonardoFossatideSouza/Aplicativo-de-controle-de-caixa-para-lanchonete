window.electron.onPreencherRelatorio((dados) => {
    document.getElementById('periodo-relatorio').textContent = dados.periodo.toUpperCase();
    const corpoRelatorio = document.getElementById('corpo-relatorio');
    corpoRelatorio.innerHTML = '';
    dados.relatorio.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.total_vendido}x</td><td>${item.nome}</td>`;
        corpoRelatorio.appendChild(tr);
    });
    window.electron.relatorioPronto();
});