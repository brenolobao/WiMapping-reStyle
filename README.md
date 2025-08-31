
# WiMapping-reStyle

WiMapping-reStyle é uma aplicação web para medir a velocidade e instabilidade da sua conexão de internet, com visualização gráfica dos resultados e opção de mapeamento por cômodos.

## Como funciona

A aplicação realiza testes de velocidade de download utilizando quatro arquivos de tamanhos diferentes (5 MB, 10 MB, 15 MB e 20 MB). O usuário pode escolher entre dois modos:

- **Teste Normal:** Executa múltiplas rodadas de download, calculando a velocidade média e exibindo gráficos dos resultados.
- **Mapeamento:** Permite testar a velocidade em diferentes cômodos da casa, registrando o nome do local e os resultados para cada ambiente.

Os resultados são apresentados em gráficos interativos e podem ser exportados em PDF. O teste é feito diretamente no navegador, sem necessidade de instalação.

## Como usar

1. Baixe ou clone este repositório / ou acesse o deploy no github pages.
2. Abra o arquivo `index.html` em seu navegador.
3. Escolha o modo de teste desejado (Normal ou Mapeamento).
4. Defina o número de rodadas e downloads.
5. Clique em “Começar Teste” ou, no modo mapeamento, insira o nome do cômodo e clique em “Realizar Teste neste Cômodo”.
6. Visualize os resultados nos gráficos e, se desejar, faça o download do relatório.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- [Chart.js](https://www.chartjs.org/) para gráficos
- [jsPDF](https://github.com/parallax/jsPDF) e [html2canvas](https://github.com/niklasvh/html2canvas) para exportação de relatórios

## Estrutura do Projeto

```
index.html           # Página principal
script.js            # Lógica dos testes e gráficos
style.css            # Estilos visuais
assets/              # Imagens e ícones
```

