// Número do primeiro quarto
var primeiroQuarto = 126;

// Número total de quartos que você deseja mostrar
var numeroDeQuartos = 8;

// Selecionando o elemento <ul> dentro do <aside>
var ul = document.querySelector("aside ul");

// Loop para criar as instâncias
for (var contador = primeiroQuarto; contador < primeiroQuarto + numeroDeQuartos; contador++) {
    // Criando uma cópia do primeiro item <li> para usar como modelo
    var primeiroLi = ul.querySelector("li");
    var novoLi = primeiroLi.cloneNode(true);

    // Alterando o texto do <a> para incluir o número do quarto
    novoLi.querySelector("a").textContent = "Quarto N° " + contador;

    // Adicionando o novo <li> ao <ul>
    ul.appendChild(novoLi);
}