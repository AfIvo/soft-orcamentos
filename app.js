// ======================================================
// SOFT. ORÇAMENTOS v0.01
// ======================================================


// ======================================================
// BASE DE DADOS TEMPORÁRIA DE MATERIAIS
// Mais tarde passamos isto para uma base de dados real.
// ======================================================

let materiais = [
    {
        codigo: "Mat01",
        descricao: 'Hidronil 3/4"',
        unidade: "Mt",
        preco: 1.50
    },
    {
        codigo: "Mat05",
        descricao: 'Joelho Latão 1"',
        unidade: "Und.",
        preco: 3.50
    },
    {
        codigo: "Mat06",
        descricao: 'Joelho Latão 3/4"',
        unidade: "Und.",
        preco: 5.00
    },
    {
        codigo: "Mat07",
        descricao: 'Joelho Latão Red. 1" - 3/4"',
        unidade: "Und.",
        preco: 4.00
    },
    {
        codigo: "Hora01",
        descricao: "Hora de Trabalho",
        unidade: "Hora",
        preco: 15.00
    },
    {
        codigo: "Desl01",
        descricao: "Deslocação",
        unidade: "Qtd.",
        preco: 20.00
    }
];

const materiaisGuardados = localStorage.getItem("materiais");

if (materiaisGuardados !== null) {
    materiais = JSON.parse(materiaisGuardados);
} else {
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );
}

// ======================================================
// VARIÁVEIS
// ======================================================

let itensOrcamento = [];
let materialSelecionado = null;
let orcamentoEmEdicaoId = null;
let filtroEstadoOrcamentos = "Todos";

function mostrarEcra(idEcra) {

    // Fechar o ecrã inicial
    document.getElementById("ecraInicio")
        ?.classList.remove("ativo");

    // Fechar todos os restantes ecrãs
    document.querySelectorAll(".ecra").forEach(ecra => {
        ecra.classList.remove("ativo");

        // Limpar eventuais estilos antigos de navegação
        ecra.style.display = "";
    });

    // Garantir que a aplicação está visível
    const app = document.querySelector(".app");

    if (app) {
        app.style.display = "";
    }

    // Abrir apenas o ecrã pretendido
    document.getElementById(idEcra)
        ?.classList.add("ativo");

    window.scrollTo(0, 0);
}

// ======================================================
// ARMAZENAMENTO LOCAL
// ======================================================

function obterOrcamentos() {

    const dados = localStorage.getItem("softOrcamentos");

    if (!dados) {
        return [];
    }

    try {
        return JSON.parse(dados);
    } catch (erro) {
        console.error("Erro ao ler orçamentos:", erro);
        return [];
    }
}


function guardarListaOrcamentos(orcamentos) {

    localStorage.setItem(
        "softOrcamentos",
        JSON.stringify(orcamentos)
    );
}


// ======================================================
// NUMERAÇÃO AUTOMÁTICA
// ======================================================

function obterProximoNumero() {

    const orcamentos = obterOrcamentos();

    let maiorNumero = 0;

    orcamentos.forEach(orcamento => {

        const numero = parseInt(
            String(orcamento.numero).replace("ORC_", "")
        );

        if (!isNaN(numero) && numero > maiorNumero) {
            maiorNumero = numero;
        }

    });

    const proximo = maiorNumero + 1;

    return "ORC_" + String(proximo).padStart(3, "0");
}


// ======================================================
// NAVEGAÇÃO
// ======================================================

function abrirNovoOrcamento() {

    // Começamos sempre um orçamento limpo
    itensOrcamento = [];

    document.getElementById("nomeOrcamento").value = "";
    document.getElementById("pesquisaMaterial").value = "";
    document.getElementById("resultadosPesquisa").innerHTML = "";
    document.getElementById("observacoes").value = "";

    atualizarLista();

    document.getElementById("numeroOrcamento").textContent =
        obterProximoNumero();

    document
        .getElementById("ecraInicio")
        .classList.remove("ativo");

    document
        .getElementById("ecraNovoOrcamento")
        .classList.add("ativo");
}


function voltarInicio() {
    mostrarEcra("ecraInicio");
    atualizarInicio();
}

function abrirMateriais() {
    mostrarEcra("ecraMateriais");
    mostrarMateriais();
}


function voltarDosMateriais() {
    document.getElementById("ecraMateriais")?.classList.remove("ativo");
    document.getElementById("ecraInicio")?.classList.add("ativo");

    atualizarInicio();
}

function mostrarMateriais() {
    const lista = document.getElementById("listaMateriais");
    const contador = document.getElementById("contadorMateriais");
    const pesquisa = document.getElementById("pesquisaListaMateriais");

    if (!lista || !contador) return;

    const textoPesquisa = pesquisa
        ? pesquisa.value.trim().toLowerCase()
        : "";

    const filtrados = materiais.filter(material => {
        const codigo = String(material.codigo || "").toLowerCase();
        const descricao = String(material.descricao || "").toLowerCase();

        return (
            codigo.includes(textoPesquisa) ||
            descricao.includes(textoPesquisa)
        );
    });

    contador.textContent =
        materiais.length === 1
            ? "1 material"
            : `${materiais.length} materiais`;

    if (filtrados.length === 0) {
        lista.innerHTML = `
            <div class="lista-vazia">
                Nenhum material encontrado.
            </div>
        `;
        return;
    }

    lista.innerHTML = filtrados
        .map(material => `
            <div class="material-lista" onclick="abrirDetalheMaterial('${material.codigo}')">
                <div>
                    <strong>${escaparHTML(material.descricao)}</strong>

                    <small>
                        ${escaparHTML(material.codigo)}
                        ·
                        ${escaparHTML(material.unidade)}
                    </small>
                </div>

                <div class="material-lista-direita">
                    <strong>
                        ${formatarEuro(Number(material.preco) || 0)}
                    </strong>

                    <span>›</span>
                </div>
            </div>
        `)
        .join("");
}

// ======================================================
// PESQUISA DE MATERIAIS
// ======================================================

function pesquisarMateriais() {

    const pesquisa = document
        .getElementById("pesquisaMaterial")
        .value
        .toLowerCase()
        .trim();

    const resultados =
        document.getElementById("resultadosPesquisa");

    resultados.innerHTML = "";

    if (pesquisa === "") {
        return;
    }

    const encontrados = materiais.filter(material =>

        material.descricao
            .toLowerCase()
            .includes(pesquisa)

        ||

        material.codigo
            .toLowerCase()
            .includes(pesquisa)

    );


    if (encontrados.length === 0) {

        resultados.innerHTML = `
            <div class="resultado">
                Nenhum material encontrado.
            </div>
        `;

        return;
    }


    encontrados.forEach(material => {

        const elemento =
            document.createElement("div");

        elemento.className = "resultado";

        elemento.innerHTML = `
            <div>
                <strong>${material.descricao}</strong>
                <small>
                    ${material.codigo} · ${material.unidade}
                </small>
            </div>

            <div class="resultado-preco">
                ${formatarEuro(material.preco)}
            </div>
        `;

        elemento.onclick = () =>
            abrirMaterial(material.codigo);

        resultados.appendChild(elemento);
    });
}


// ======================================================
// MODAL DE MATERIAL
// ======================================================

function abrirMaterial(codigo) {

    materialSelecionado =
        materiais.find(material =>
            material.codigo === codigo
        );

    if (!materialSelecionado) return;


    document.getElementById("modalCodigo").textContent =
        materialSelecionado.codigo;

    document.getElementById("modalDescricao").textContent =
        materialSelecionado.descricao;

    document.getElementById("modalPreco").textContent =
        formatarEuro(materialSelecionado.preco);

    document.getElementById("modalUnidade").textContent =
        materialSelecionado.unidade;

    document.getElementById("modalQuantidade").value = 1;

    document.getElementById("modalMargem").value = 0;

    atualizarPreview();

    document
        .getElementById("modalMaterial")
        .classList.add("aberto");
}


function fecharModal() {

    document
        .getElementById("modalMaterial")
        .classList.remove("aberto");

    materialSelecionado = null;
}


// ======================================================
// CÁLCULO DO MATERIAL
// ======================================================

function atualizarPreview() {

    if (!materialSelecionado) return;

    const quantidade =
        Number(
            document.getElementById("modalQuantidade").value
        ) || 0;

    const margem =
        Number(
            document.getElementById("modalMargem").value
        ) || 0;

    const valorUnitario =
        materialSelecionado.preco *
        (1 + margem / 100);

    const total =
        valorUnitario * quantidade;

    document.getElementById("modalTotal").textContent =
        formatarEuro(total);
}


// ======================================================
// ADICIONAR MATERIAL
// ======================================================

function adicionarMaterial() {

    if (!materialSelecionado) return;

    const quantidade =
        Number(
            document.getElementById("modalQuantidade").value
        );

    const margem =
        Number(
            document.getElementById("modalMargem").value
        ) || 0;


    if (quantidade <= 0) {

        alert("Indica uma quantidade válida.");

        return;
    }


    const valorUnitario =
        materialSelecionado.preco *
        (1 + margem / 100);

    const total =
        valorUnitario * quantidade;


    itensOrcamento.push({

        id:
            Date.now() +
            Math.floor(Math.random() * 1000),

        codigo:
            materialSelecionado.codigo,

        descricao:
            materialSelecionado.descricao,

        unidade:
            materialSelecionado.unidade,

        precoBase:
            materialSelecionado.preco,

        quantidade,

        margem,

        valorUnitario,

        total
    });


    atualizarLista();

    fecharModal();

    document.getElementById("pesquisaMaterial").value = "";

    document.getElementById("resultadosPesquisa").innerHTML = "";
}


// ======================================================
// LISTA DE ITENS
// ======================================================

function atualizarLista() {

    const lista =
        document.getElementById("listaItens");

    lista.innerHTML = "";


    if (itensOrcamento.length === 0) {

        lista.innerHTML = `
            <div class="lista-vazia">
                Ainda não adicionaste nenhum material.
            </div>
        `;
    }


    itensOrcamento.forEach(item => {

        const elemento =
            document.createElement("div");

        elemento.className = "item";

        elemento.innerHTML = `

            <div class="item-info">

                <strong>
                    ${item.descricao}
                </strong>

                <small>
                    ${item.quantidade}
                    ${item.unidade}
                    ×
                    ${formatarEuro(item.valorUnitario)}
                </small>

                ${
                    item.margem > 0
                        ?
                        `<small>Margem: ${item.margem}%</small>`
                        :
                        ""
                }

            </div>


            <div class="item-valor">

                <strong>
                    ${formatarEuro(item.total)}
                </strong>

                <button
                    class="remover"
                    onclick="removerItem(${item.id})"
                >
                    Remover
                </button>

            </div>
        `;

        lista.appendChild(elemento);
    });


    atualizarTotal();
}


// ======================================================
// REMOVER ITEM
// ======================================================

function removerItem(id) {

    itensOrcamento =
        itensOrcamento.filter(
            item => item.id !== id
        );

    atualizarLista();
}


// ======================================================
// TOTAL
// ======================================================

function atualizarTotal() {

    const total =
        itensOrcamento.reduce(
            (soma, item) =>
                soma + item.total,
            0
        );


    document.getElementById("totalOrcamento").textContent =
        formatarEuro(total);


    document.getElementById("contadorItens").textContent =
        itensOrcamento.length === 1
            ? "1 item"
            : `${itensOrcamento.length} itens`;
}


// ======================================================
// GUARDAR ORÇAMENTO
// ======================================================

function guardarOrcamento() {

    const nome = document
        .getElementById("nomeOrcamento")
        .value
        .trim();


    if (nome === "") {

        alert("Indica o nome do orçamento.");

        return;
    }


    if (itensOrcamento.length === 0) {

        alert("Adiciona pelo menos um item.");

        return;
    }


    const orcamentos = obterOrcamentos();

let numero;
let id;
let data;

if (orcamentoEmEdicaoId !== null) {
    const existente = orcamentos.find(
        item => Number(item.id) === Number(orcamentoEmEdicaoId)
    );

    if (!existente) {
        alert("Não foi possível encontrar o orçamento a editar.");
        return;
    }

    numero = existente.numero;
    id = existente.id;
    data = existente.data;
} else {
    numero = obterProximoNumero();
    id = Date.now();
    data = new Date().toLocaleDateString("pt-PT");
}


    const total =
        itensOrcamento.reduce(
            (soma, item) =>
                soma + item.total,
            0
        );


const orcamento = {
    id,
    numero,
    nome,
    data,
    estado: "Em elaboração",
    itens: itensOrcamento,
    observacoes: document
        .getElementById("observacoes")
        .value
        .trim(),
    total
};

if (orcamentoEmEdicaoId !== null) {

    const indice = orcamentos.findIndex(
        item => Number(item.id) === Number(orcamentoEmEdicaoId)
    );

    orcamentos[indice] = orcamento;

} else {

    orcamentos.push(orcamento);

}

    guardarListaOrcamentos(orcamentos);

    orcamentoEmEdicaoId = null;

    alert(
        `${numero} guardado com sucesso!`
    );


    voltarInicio();
}


// ======================================================
// ATUALIZAR PÁGINA INICIAL
// ======================================================

function atualizarInicio() {

    const orcamentos =
        obterOrcamentos();


    const lista =
        document.querySelector(
            "#ecraInicio .recentes"
        );


    if (!lista) return;


    const recentes =
        orcamentos
            .slice()
            .reverse()
            .slice(0, 3);


    let html = `

        <div class="titulo-secao">

            <h2>
                Orçamentos Recentes
            </h2>

            <span>
                ${orcamentos.length} guardados
            </span>

        </div>
    `;


    if (recentes.length === 0) {

        html += `

            <div class="lista-vazia">
                Ainda não existem orçamentos.
            </div>
        `;

    } else {

        recentes.forEach(orcamento => {

            html += `

                <div class="orcamento" onclick="abrirDetalheOrcamento(${orcamento.id})">

                    <div>

                        <strong>
                            ${orcamento.numero}
                        </strong>

                        <p>
                            ${orcamento.nome}
                        </p>

                        <small>
                            ${orcamento.data}
                        </small>

                    </div>


                    <div class="valor">

                        <strong>
                            ${formatarEuro(orcamento.total)}
                        </strong>

                        <span class="estado">
                            ● ${orcamento.estado}
                        </span>

                    </div>

                </div>
            `;
        });
    }


    lista.innerHTML = html;
}


// ======================================================
// FORMATAÇÃO €
// ======================================================

function formatarEuro(valor) {

    return new Intl.NumberFormat(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(valor);
}


// ======================================================
// ARRANQUE DA APP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarInicio();

    }
);


// =====================================================
// GESTÃO DE ORÇAMENTOS
// Lista + detalhe + eliminar
// =====================================================

let orcamentoAtualId = null;


// =====================================================
// ABRIR LISTA DE ORÇAMENTOS
// =====================================================

function abrirOrcamentos() {
    mostrarEcra("ecraOrcamentos");
    mostrarOrcamentos();
}

// =====================================================
// VOLTAR DA LISTA PARA O INÍCIO
// =====================================================

function voltarDosOrcamentos() {

    // Fechar todos os ecrãs
    document.querySelectorAll(".ecra").forEach(ecra => {
        ecra.classList.remove("ativo");
    });

    // Voltar ao início
    document.getElementById("ecraInicio")
        .classList.add("ativo");

    // Atualizar os dados apresentados no início
    atualizarInicio();

    window.scrollTo(0, 0);
}


// =====================================================
// MOSTRAR / PESQUISAR ORÇAMENTOS
// =====================================================

function mostrarOrcamentos() {

    const lista = document.getElementById("listaOrcamentos");
    const contador = document.getElementById("contadorOrcamentos");
    const pesquisa = document.getElementById("pesquisaOrcamento");

    if (!lista || !contador) return;

const orcamentos = obterOrcamentos();

const textoPesquisa =
    pesquisa
        ? pesquisa.value.trim().toLowerCase()
        : "";

    const filtrados = orcamentos
    .filter(orcamento => {

        const numero =
            String(orcamento.numero || "").toLowerCase();

        const nome =
            String(orcamento.nome || "").toLowerCase();

        const correspondePesquisa =
            numero.includes(textoPesquisa) ||
            nome.includes(textoPesquisa);

        const estadoOrcamento =
            orcamento.estado || "Em elaboração";

        const correspondeEstado =
            filtroEstadoOrcamentos === "Todos" ||
            estadoOrcamento === filtroEstadoOrcamentos;

        return correspondePesquisa && correspondeEstado;
    })
    .reverse();
       


    // CONTADOR

    contador.textContent =
    filtrados.length === 1
        ? "1 orçamento"
        : `${filtrados.length} orçamentos`;


    // LISTA VAZIA

    if (filtrados.length === 0) {

        lista.innerHTML = `
            <div class="lista-vazia">
                <strong>Nenhum orçamento encontrado</strong>
                <span>
                    ${
                        orcamentos.length === 0
                            ? "Cria o teu primeiro orçamento."
                            : "Experimenta outra pesquisa."
                    }
                </span>
            </div>
        `;

        return;
    }


    // CRIAR LISTA

    lista.innerHTML = filtrados
        .map(orcamento => {

            const estado =
                orcamento.estado || "Em elaboração";

            return `
                <div
                    class="orcamento-lista"
                    onclick="abrirDetalheOrcamento(${orcamento.id})"
                >

                    <div>

                        <strong>
                            ${escaparHTML(orcamento.numero)}
                        </strong>

                        <div class="nome-orcamento">
                            ${escaparHTML(orcamento.nome)}
                        </div>

                        <span class="data-orcamento">
                            ${escaparHTML(orcamento.data)}
                        </span>

                    </div>


                    <div class="orcamento-lista-direita">

                        <strong>
                            ${formatarEuro(Number(orcamento.total) || 0)}
                        </strong>

                        <span class="estado-lista">
                            ● ${escaparHTML(estado)}
                        </span>

                    </div>

                </div>
            `;

        })
        .join("");
}


// =====================================================
// ABRIR DETALHE
// =====================================================

function abrirDetalheOrcamento(id) {

    const orcamentos = obterOrcamentos();

    const orcamento =
        orcamentos.find(
            item => Number(item.id) === Number(id)
        );

    if (!orcamento) {
        alert("Não foi possível encontrar este orçamento.");
        return;
    }

    orcamentoAtualId = orcamento.id;


    // CABEÇALHO

    document.getElementById("detalheNumero").textContent =
        orcamento.numero || "";

    document.getElementById("detalheNome").textContent =
        orcamento.nome || "";

    document.getElementById("detalheData").textContent =
        orcamento.data || "";

        const detalheEstado = document.getElementById("detalheEstado");

const estado = orcamento.estado || "Em elaboração";

const estados = {
    "Em elaboração": "🟢 Em elaboração",
    "Enviado": "🔵 Enviado",
    "Aceite": "🟢 Aceite",
    "Rejeitado": "🔴 Rejeitado"
};

detalheEstado.textContent =
    estados[estado] || "🟢 Em elaboração";


    // ITENS

    const detalheItens =
        document.getElementById("detalheItens");

    const itens =
        Array.isArray(orcamento.itens)
            ? orcamento.itens
            : [];

    detalheItens.innerHTML =
        itens.map(item => {

            const quantidade =
                Number(item.quantidade) || 0;

            const valorUnitario =
                Number(item.valorUnitario) || 0;

            const totalItem =
                Number(item.total) ||
                (quantidade * valorUnitario);

            return `
                <div class="item-detalhe">

                    <div>

                        <strong>
                            ${escaparHTML(item.descricao)}
                        </strong>

                        <small>
                            ${quantidade}
                            ${escaparHTML(item.unidade)}
                            ×
                            ${formatarEuro(valorUnitario)}
                        </small>

                    </div>

                    <div class="item-detalhe-valor">

                        <strong>
                            ${formatarEuro(totalItem)}
                        </strong>

                    </div>

                </div>
            `;

        }).join("");


    // TOTAL

    document.getElementById("detalheTotal").textContent =
        formatarEuro(Number(orcamento.total) || 0);


    // OBSERVAÇÕES

    const blocoObservacoes =
        document.getElementById("blocoObservacoesDetalhe");

    const detalheObservacoes =
        document.getElementById("detalheObservacoes");

    if (
        orcamento.observacoes &&
        orcamento.observacoes.trim() !== ""
    ) {

        blocoObservacoes.style.display = "block";

        detalheObservacoes.textContent =
            orcamento.observacoes;

    } else {

        blocoObservacoes.style.display = "none";
    }


// TROCAR ECRÃ
mostrarEcra("ecraDetalheOrcamento");
}


// =====================================================
// VOLTAR DO DETALHE PARA A LISTA
// =====================================================

function voltarListaOrcamentos() {
    mostrarEcra("ecraOrcamentos");
    mostrarOrcamentos();
}

// =====================================================
// NOVO ORÇAMENTO A PARTIR DA LISTA
// =====================================================

function abrirNovoAPartirDaLista() {

    document.getElementById("ecraOrcamentos").style.display = "none";
    document.getElementById("ecraDetalheOrcamento").style.display = "none";

    document.querySelector(".app").style.display = "";

    novoOrcamento();

    window.scrollTo(0, 0);
}


// =====================================================
// ELIMINAR ORÇAMENTO
// =====================================================

function eliminarOrcamentoAtual() {

    if (orcamentoAtualId === null) return;

    const orcamentos = obterOrcamentos();

    const orcamento =
        orcamentos.find(
            item =>
                Number(item.id) ===
                Number(orcamentoAtualId)
        );

    if (!orcamento) return;


    const confirmar = confirm(
        `Eliminar ${orcamento.numero} - ${orcamento.nome}?\n\nEsta ação não pode ser anulada.`
    );

    if (!confirmar) return;


    const novaLista =
        orcamentos.filter(
            item =>
                Number(item.id) !==
                Number(orcamentoAtualId)
        );


    guardarListaOrcamentos(novaLista);

    orcamentoAtualId = null;

    alert("Orçamento eliminado com sucesso.");

    voltarListaOrcamentos();
}


// =====================================================
// EDITAR ORÇAMENTO
// =====================================================

function editarOrcamentoAtual() {

    if (!orcamentoAtualId) {
        alert("Não foi possível identificar o orçamento.");
        return;
    }

    const orcamentos = obterOrcamentos();

    const orcamento = orcamentos.find(
        item => Number(item.id) === Number(orcamentoAtualId)
    );

    if (!orcamento) {
        alert("Não foi possível encontrar o orçamento.");
        return;
    }

    // Guardar qual orçamento estamos a editar
    orcamentoEmEdicaoId = orcamento.id;

    // Copiar os itens para não alterar diretamente o orçamento guardado
    itensOrcamento = (orcamento.itens || []).map(item => ({
        ...item
    }));

    // Preencher os campos
    document.getElementById("nomeOrcamento").value =
        orcamento.nome || "";

    document.getElementById("observacoes").value =
        orcamento.observacoes || "";

    document.getElementById("pesquisaMaterial").value = "";

    document.getElementById("resultadosPesquisa").innerHTML = "";

    // Manter o mesmo número do orçamento
    document.getElementById("numeroOrcamento").textContent =
        orcamento.numero;

    // Atualizar lista e total
    atualizarLista();

    // Fechar detalhe
    document
        .getElementById("ecraDetalheOrcamento")
        .classList.remove("ativo");

    // Abrir formulário
    document
        .getElementById("ecraNovoOrcamento")
        .classList.add("ativo");
}


// =====================================================
// GERAR PDF
// =====================================================

function gerarPDFOrcamentoAtual() {

    if (!orcamentoAtualId) {
        alert("Não foi possível identificar o orçamento.");
        return;
    }

    const orcamentos = obterOrcamentos();

    const orcamento = orcamentos.find(
        item => Number(item.id) === Number(orcamentoAtualId)
    );

    if (!orcamento) {
        alert("Não foi possível encontrar o orçamento.");
        return;
    }

    const itens = Array.isArray(orcamento.itens)
        ? orcamento.itens
        : [];

    const linhasItens = itens.map(item => {

        const quantidade = Number(item.quantidade) || 0;
        const valorUnitario = Number(item.valorUnitario) || 0;
        const totalItem =
            Number(item.total) ||
            (quantidade * valorUnitario);

        return `
            <tr>
                <td>${escaparHTML(item.descricao)}</td>
                <td>${escaparHTML(item.unidade)}</td>
                <td class="centro">${quantidade}</td>
                <td class="direita">${formatarEuro(valorUnitario)}</td>
                <td class="direita">${formatarEuro(totalItem)}</td>
            </tr>
        `;
    }).join("");

    const observacoes = orcamento.observacoes
        ? `
            <div class="observacoes">
                <h3>Observações</h3>
                <p>${escaparHTML(orcamento.observacoes)}</p>
            </div>
        `
        : "";

    const janela = window.open("", "_blank");

    if (!janela) {
        alert("O navegador bloqueou a janela de impressão.");
        return;
    }

    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <title>${escaparHTML(orcamento.numero)}</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #10294d;
                    margin: 0;
                    padding: 40px;
                    background: white;
                }

                .cabecalho {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #1687df;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                .marca h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .marca p {
                    margin: 5px 0 0;
                    color: #68778d;
                }

                .numero {
                    text-align: right;
                }

                .numero strong {
                    font-size: 22px;
                }

                .numero p {
                    margin: 5px 0;
                    color: #68778d;
                }

                .cliente {
                    margin-bottom: 30px;
                }

                .cliente h2 {
                    margin-bottom: 5px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th {
                    background: #f1f6fb;
                    text-align: left;
                    padding: 12px;
                    border-bottom: 1px solid #d5dfeb;
                }

                td {
                    padding: 12px;
                    border-bottom: 1px solid #e1e7ef;
                }

                .centro {
                    text-align: center;
                }

                .direita {
                    text-align: right;
                }

                .total {
                    margin-top: 30px;
                    margin-left: auto;
                    width: 300px;
                    background: #10294d;
                    color: white;
                    padding: 18px 20px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 20px;
                    font-weight: bold;
                }

                .observacoes {
                    margin-top: 35px;
                    background: #f5f8fc;
                    padding: 20px;
                    border-radius: 8px;
                }

                .observacoes h3 {
                    margin-top: 0;
                }

                .observacoes p {
                    white-space: pre-wrap;
                }

                .rodape {
                    margin-top: 50px;
                    padding-top: 15px;
                    border-top: 1px solid #d5dfeb;
                    font-size: 12px;
                    color: #7a8798;
                    text-align: center;
                }

                @media print {
                    body {
                        padding: 15mm;
                    }
                }

            </style>
        </head>

        <body>

            <div class="cabecalho">

                <div class="marca">
                    <h1>🔧 Orçamento</h1>
                    <p>Soft. Orçamentos</p>
                </div>

                <div class="numero">
                    <strong>${escaparHTML(orcamento.numero)}</strong>
                    <p>Data: ${escaparHTML(orcamento.data)}</p>
                    <p>${escaparHTML(orcamento.estado || "Em elaboração")}</p>
                </div>

            </div>

            <div class="cliente">
                <h2>${escaparHTML(orcamento.nome)}</h2>
            </div>

            <table>

                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Unidade</th>
                        <th class="centro">Qtd.</th>
                        <th class="direita">Preço unit.</th>
                        <th class="direita">Total</th>
                    </tr>
                </thead>

                <tbody>
                    ${linhasItens}
                </tbody>

            </table>

            <div class="total">
                <span>Total</span>
                <span>${formatarEuro(Number(orcamento.total) || 0)}</span>
            </div>

            ${observacoes}

            <div class="rodape">
                Documento gerado através do Soft. Orçamentos
            </div>

        </body>
        </html>
    `);

    janela.document.close();

    janela.onload = function () {
        janela.focus();
        janela.print();
    };
}


// =====================================================
// SEGURANÇA PARA TEXTO INSERIDO PELO UTILIZADOR
// =====================================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


  function abrirDetalheMaterial(codigo) {
    const material = materiais.find(
        item => String(item.codigo) === String(codigo)
    );

    if (!material) {
        alert("Não foi possível encontrar este material.");
        return;
    }

    materialSelecionado = material;

    document.getElementById("detalheMaterialDescricao").textContent =
        material.descricao || "";

    document.getElementById("detalheMaterialCodigo").textContent =
        material.codigo || "";

    document.getElementById("detalheMaterialUnidade").textContent =
        material.unidade || "";

    document.getElementById("detalheMaterialPreco").textContent =
        formatarEuro(Number(material.preco) || 0);

    document.getElementById("ecraMateriais")
        .classList.remove("ativo");

    document.getElementById("ecraDetalheMaterial")
        .classList.add("ativo");
}

function voltarListaMateriais() {
    document.getElementById("ecraDetalheMaterial")
        .classList.remove("ativo");

    document.getElementById("ecraMateriais")
        .classList.add("ativo");

    mostrarMateriais();
}

function editarMaterialAtual() {
    if (!materialSelecionado) {
        alert("Não foi possível identificar o material.");
        return;
    }

    // Preencher formulário com os dados atuais
    document.getElementById("editarMaterialDescricao").value =
        materialSelecionado.descricao || "";

    document.getElementById("editarMaterialCodigo").value =
        materialSelecionado.codigo || "";

    document.getElementById("editarMaterialUnidade").value =
        materialSelecionado.unidade || "";

    document.getElementById("editarMaterialPreco").value =
        Number(materialSelecionado.preco) || 0;

    document.getElementById("editarMaterialCodigoTitulo").textContent =
        materialSelecionado.codigo || "";

    // Fechar detalhe
    document.getElementById("ecraDetalheMaterial")
        .classList.remove("ativo");

    // Abrir edição
    document.getElementById("ecraEditarMaterial")
        .classList.add("ativo");
}


function cancelarEdicaoMaterial() {
    document.getElementById("ecraEditarMaterial")
        .classList.remove("ativo");

    document.getElementById("ecraDetalheMaterial")
        .classList.add("ativo");
}

function guardarEdicaoMaterial() {
    if (!materialSelecionado) {
        alert("Não foi possível identificar o material.");
        return;
    }

    const descricao = document
        .getElementById("editarMaterialDescricao")
        .value
        .trim();

    const codigo = document
        .getElementById("editarMaterialCodigo")
        .value
        .trim();

    const unidade = document
        .getElementById("editarMaterialUnidade")
        .value
        .trim();

    const preco = Number(
        document.getElementById("editarMaterialPreco").value
    );

    // Validar campos
    if (descricao === "") {
        alert("Indica a descrição do material.");
        return;
    }

    if (codigo === "") {
        alert("Indica o código do material.");
        return;
    }

    if (unidade === "") {
        alert("Indica a unidade do material.");
        return;
    }

    // Impedir código igual ao de outro material
const codigoDuplicado = materiais.some(
    material =>
        material !== materialSelecionado &&
        String(material.codigo).toLowerCase() ===
        codigo.toLowerCase()
);

if (codigoDuplicado) {
    alert("Já existe outro material com este código.");
    return;
}

    if (isNaN(preco) || preco < 0) {
        alert("Indica um preço válido.");
        return;
    }

    // Atualizar o material
    materialSelecionado.descricao = descricao;
    materialSelecionado.codigo = codigo;
    materialSelecionado.unidade = unidade;
    materialSelecionado.preco = preco;

    // Atualizar armazenamento
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );

    // Fechar edição
    document.getElementById("ecraEditarMaterial")
        .classList.remove("ativo");

    // Voltar a abrir o detalhe já atualizado
    abrirDetalheMaterial(codigo);

    alert("Material atualizado com sucesso!");
}

function eliminarMaterialAtual() {
    if (!materialSelecionado) {
        alert("Não foi possível identificar o material.");
        return;
    }

    const confirmar = confirm(
        `Tens a certeza que pretendes eliminar "${materialSelecionado.descricao}"?`
    );

    if (!confirmar) {
        return;
    }

    const indice = materiais.findIndex(
        item => String(item.codigo) === String(materialSelecionado.codigo)
    );

    if (indice === -1) {
        alert("Não foi possível encontrar o material.");
        return;
    }

    // Eliminar da lista
    materiais.splice(indice, 1);

    // Guardar nova lista
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );

    // Limpar seleção
    materialSelecionado = null;

    // Fechar detalhe
    document.getElementById("ecraDetalheMaterial")
        .classList.remove("ativo");

    // Abrir lista de materiais
    document.getElementById("ecraMateriais")
        .classList.add("ativo");

    mostrarMateriais();

    alert("Material eliminado com sucesso!");
}

function novoMaterial() {
    // Limpar os campos
    document.getElementById("novoMaterialDescricao").value = "";
    document.getElementById("novoMaterialCodigo").value = "";
    document.getElementById("novoMaterialUnidade").value = "";
    document.getElementById("novoMaterialPreco").value = "";

    // Fechar lista de materiais
    document.getElementById("ecraMateriais")
        .classList.remove("ativo");

    // Abrir formulário de novo material
    document.getElementById("ecraNovoMaterial")
        .classList.add("ativo");
}


function cancelarNovoMaterial() {
    document.getElementById("ecraNovoMaterial")
        .classList.remove("ativo");

    document.getElementById("ecraMateriais")
        .classList.add("ativo");

    mostrarMateriais();
}

function guardarNovoMaterial() {
    const descricao = document
        .getElementById("novoMaterialDescricao")
        .value
        .trim();

    const codigo = document
        .getElementById("novoMaterialCodigo")
        .value
        .trim();

    const unidade = document
        .getElementById("novoMaterialUnidade")
        .value
        .trim();

    const preco = Number(
        document.getElementById("novoMaterialPreco").value
    );

    // Validar campos
    if (descricao === "") {
        alert("Indica a descrição do material.");
        return;
    }

    if (codigo === "") {
        alert("Indica o código do material.");
        return;
    }

    if (unidade === "") {
        alert("Indica a unidade do material.");
        return;
    }

    if (isNaN(preco) || preco < 0) {
        alert("Indica um preço válido.");
        return;
    }

    // Verificar se o código já existe
    const codigoExiste = materiais.some(
        material =>
            String(material.codigo).toLowerCase() ===
            codigo.toLowerCase()
    );

    if (codigoExiste) {
        alert("Já existe um material com este código.");
        return;
    }

    // Criar material
    const novoMaterial = {
        codigo,
        descricao,
        unidade,
        preco
    };

    // Adicionar à base
    materiais.push(novoMaterial);

    // Guardar no navegador
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );

    // Fechar formulário
    document.getElementById("ecraNovoMaterial")
        .classList.remove("ativo");

    // Voltar aos materiais
    document.getElementById("ecraMateriais")
        .classList.add("ativo");

    mostrarMateriais();

    alert("Material adicionado com sucesso!");
}

function guardarNovoMaterial() {
    const descricao = document
        .getElementById("novoMaterialDescricao")
        .value
        .trim();

    const codigo = document
        .getElementById("novoMaterialCodigo")
        .value
        .trim();

    const unidade = document
        .getElementById("novoMaterialUnidade")
        .value
        .trim();

    const preco = Number(
        document.getElementById("novoMaterialPreco").value
    );

    // Validar campos
    if (descricao === "") {
        alert("Indica a descrição do material.");
        return;
    }

    if (codigo === "") {
        alert("Indica o código do material.");
        return;
    }

    if (unidade === "") {
        alert("Indica a unidade do material.");
        return;
    }

    if (isNaN(preco) || preco < 0) {
        alert("Indica um preço válido.");
        return;
    }

    // Impedir códigos repetidos
    const codigoExiste = materiais.some(
        material =>
            String(material.codigo).toLowerCase() ===
            codigo.toLowerCase()
    );

    if (codigoExiste) {
        alert("Já existe um material com este código.");
        return;
    }

    const novoMaterial = {
        codigo,
        descricao,
        unidade,
        preco
    };

    materiais.push(novoMaterial);

    // Guardar permanentemente
    localStorage.setItem(
        "materiais",
        JSON.stringify(materiais)
    );

    document.getElementById("ecraNovoMaterial")
        .classList.remove("ativo");

    document.getElementById("ecraMateriais")
        .classList.add("ativo");

    mostrarMateriais();

    alert("Material adicionado com sucesso!");
}

function abrirMais() {

    // Fechar o início
    document.getElementById("ecraInicio")
        .classList.remove("ativo");

    // Fechar todos os outros ecrãs
    document.querySelectorAll(".ecra").forEach(ecra => {
        ecra.classList.remove("ativo");
    });

    // Abrir o ecrã Mais
    document.getElementById("ecraMais")
        .classList.add("ativo");
}

function abrirBackup() {
    document.getElementById("ecraMais")
        .classList.remove("ativo");

    document.getElementById("ecraBackup")
        .classList.add("ativo");
}


function voltarMais() {
    document.getElementById("ecraBackup")
        .classList.remove("ativo");

    document.getElementById("ecraMais")
        .classList.add("ativo");
}

function exportarDados() {
    const orcamentos = obterOrcamentos();

    const backup = {
        aplicacao: "Soft. Orçamentos",
        versao: "0.01",
        dataBackup: new Date().toISOString(),

        materiais: materiais,
        orcamentos: orcamentos
    };

    const conteudo = JSON.stringify(backup, null, 2);

    const blob = new Blob(
        [conteudo],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const hoje = new Date()
        .toLocaleDateString("pt-PT")
        .replaceAll("/", "-");

    link.href = url;
    link.download = `Soft-Orcamentos_Backup_${hoje}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Cópia de segurança criada com sucesso!");
}


function selecionarBackup() {
    document.getElementById("inputBackup").click();
}


function importarDados(event) {
    const ficheiro = event.target.files[0];

    if (!ficheiro) return;

    const leitor = new FileReader();

    leitor.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            // Validar estrutura do ficheiro
            if (
                !backup ||
                !Array.isArray(backup.materiais) ||
                !Array.isArray(backup.orcamentos)
            ) {
                alert("Este ficheiro não é uma cópia de segurança válida.");
                return;
            }

            const confirmar = confirm(
                "Ao restaurar esta cópia de segurança, os materiais e orçamentos atuais serão substituídos.\n\nDesejas continuar?"
            );

            if (!confirmar) {
                return;
            }

            // Guardar materiais
            localStorage.setItem(
                "materiais",
                JSON.stringify(backup.materiais)
            );

            // Guardar orçamentos
            guardarListaOrcamentos(backup.orcamentos);

            alert("Cópia de segurança restaurada com sucesso!");

            // Recarregar para atualizar toda a aplicação
            location.reload();

        } catch (erro) {
            alert("Não foi possível ler esta cópia de segurança.");
        }
    };

    leitor.readAsText(ficheiro);

    // Permite selecionar novamente o mesmo ficheiro
    event.target.value = "";
}

function abrirSobre() {
    document.getElementById("ecraMais")
        .classList.remove("ativo");

    document.getElementById("ecraSobre")
        .classList.add("ativo");
}


function voltarDoSobre() {
    document.getElementById("ecraSobre")
        .classList.remove("ativo");

    document.getElementById("ecraMais")
        .classList.add("ativo");
}

function abrirLimparDados() {
    document.getElementById("ecraMais")
        .classList.remove("ativo");

    document.getElementById("ecraLimparDados")
        .classList.add("ativo");
}


function voltarDeLimparDados() {
    document.getElementById("ecraLimparDados")
        .classList.remove("ativo");

    document.getElementById("ecraMais")
        .classList.add("ativo");
}


function abrirBackupDesdeLimpar() {
    document.getElementById("ecraLimparDados")
        .classList.remove("ativo");

    document.getElementById("ecraBackup")
        .classList.add("ativo");
}


function confirmarLimpezaDados() {

    const confirmar = confirm(
        "ATENÇÃO!\n\n" +
        "Esta operação irá eliminar todos os orçamentos e repor os materiais para o estado inicial.\n\n" +
        "Esta ação não pode ser anulada.\n\n" +
        "Desejas continuar?"
    );

    if (!confirmar) {
        return;
    }

    const confirmarNovamente = confirm(
        "Última confirmação:\n\n" +
        "Tens a certeza de que pretendes eliminar todos os dados?"
    );

    if (!confirmarNovamente) {
        return;
    }

    // Eliminar orçamentos guardados
    localStorage.removeItem("softOrcamentos");

    // Eliminar materiais guardados.
    // Ao recarregar, serão usados novamente os materiais-base do app.js
    localStorage.removeItem("materiais");

    alert(
        "Os dados foram eliminados.\n\n" +
        "A aplicação será reposta para o estado inicial."
    );

    location.reload();
}


function abrirSeletorEstado() {
    document.getElementById("seletorEstado")
        .classList.add("ativo");
}

function fecharSeletorEstado() {
    document.getElementById("seletorEstado")
        .classList.remove("ativo");
}

function alterarEstadoOrcamento(novoEstado) {

    if (!orcamentoAtualId) {
        alert("Não foi possível identificar o orçamento.");
        return;
    }

    const orcamentos = obterOrcamentos();

    const indice = orcamentos.findIndex(
        item => Number(item.id) === Number(orcamentoAtualId)
    );

    if (indice === -1) {
        alert("Não foi possível encontrar o orçamento.");
        return;
    }

    orcamentos[indice].estado = novoEstado;

    guardarListaOrcamentos(orcamentos);

    const icones = {
        "Em elaboração": "🟢",
        "Enviado": "🔵",
        "Aceite": "🟢",
        "Rejeitado": "🔴"
    };

    document.getElementById("detalheEstado").textContent =
        `${icones[novoEstado]} ${novoEstado}`;

    fecharSeletorEstado();

    atualizarInicio();
}

function filtrarOrcamentos(estado, botao) {

    filtroEstadoOrcamentos = estado;

    document.querySelectorAll(".filtro-orcamento")
        .forEach(item => {
            item.classList.remove("ativo");
        });

    botao.classList.add("ativo");

    mostrarOrcamentos();
}