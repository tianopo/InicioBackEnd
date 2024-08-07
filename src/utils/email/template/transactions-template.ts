import { CompraDto } from "../../../modules/send-email/dto/compraDto";
import { VendaDto } from "../../../modules/send-email/dto/vendaDto";

const formatTransacao = (transacao: VendaDto | CompraDto, tipo: "venda" | "compra") => `
  <li><strong>Nome ${tipo === "venda" ? "do Comprador" : "do Vendedor"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).nomeComprador : (transacao as CompraDto).nomeVendedor}</li>
  <li><strong>CPF ${tipo === "venda" ? "do Comprador" : "do Vendedor"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).cpfComprador : ""}</li>
  <li><strong>Número da Ordem:</strong> ${transacao.numeroOrdem}</li>
  <li><strong>Hora da Transação:</strong> ${transacao.horaTransacao}</li>
  <li><strong>Exchange Utilizada:</strong> ${transacao.exchangeUtilizada}</li>
  <li><strong>Ativo Digital:</strong> ${transacao.ativoDigital}</li>
  <li><strong>Tipo de Transação:</strong> ${transacao.tipoTransacao}</li>
  <li><strong>Quantidade ${tipo === "venda" ? "Vendida" : "Comprada"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).quantidadeVendida : (transacao as CompraDto).quantidadeComprada}</li>
  <li><strong>Valor da ${tipo === "venda" ? "Venda" : "Compra"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).valorVenda : (transacao as CompraDto).valorCompra}</li>
  <li><strong>Valor do Token na Data da ${tipo === "venda" ? "Venda" : "Compra"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).valorTokenDataVenda : (transacao as CompraDto).valorTokenDataCompra}</li>
  <li><strong>Taxa da Transação:</strong> ${transacao.taxaTransacao}</li>
`;

export const transactionsTemplate = (vendas: VendaDto[], compras: CompraDto[]): string => {
  const totalVendas = vendas.reduce(
    (acc, venda) =>
      acc + parseFloat(venda.valorVenda.replace("R$", "").replace(".", "").replace(",", ".")),
    0,
  );
  const totalCompras = compras.reduce(
    (acc, compra) =>
      acc + parseFloat(compra.valorCompra.replace("R$", "").replace(".", "").replace(",", ".")),
    0,
  );
  const lucroTotal = totalVendas - totalCompras;
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
          }
          .logo {
            max-width: 150px;
            margin: 0 auto 20px;
          }
          h1 {
            color: #228BE5;
            margin-bottom: 20px;
          }
          p {
            margin: 10px 0;
          }
          .details {
            text-align: left;
            margin-top: 20px;
            padding: 0 20px;
          }
          .details ul {
            list-style-type: none;
            padding: 0;
          }
          .details li {
            margin: 10px 0;
            font-size: 16px;
          }
          .details li strong {
            color: #333;
          }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="./cryptotech.png" alt="Logo" class="logo">
          <h1>Data das Transações: ${new Date().toLocaleDateString()}</h1>
          <h2>Resumo das Transações</h2>
          <div class="details">
            <ul>
              <li><strong>Total de Vendas:</strong> ${vendas.length}</li>
              <li><strong>Total de Compras:</strong> ${compras.length}</li>
              <li><strong>Lucro total do dia:</strong> ${lucroTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
            </ul>
          </div>
          <h2>Detalhamento das Transações de Venda</h2>
          <div class="details">
            <ul>
              ${vendas
                .map(
                  (venda, index) => `
                <h3>Transação ${index + 1}</h3>
                ${formatTransacao(venda, "venda")}
              `,
                )
                .join("")}
            </ul>
          </div>
          <h2>Detalhamento das Transações de Compra</h2>
          <div class="details">
            <ul>
              ${compras
                .map(
                  (compra, index) => `
                <h3>Transação ${index + 1}</h3>
                ${formatTransacao(compra, "compra")}
              `,
                )
                .join("")}
            </ul>
          </div>
        </div>
      </body>
    </html>
  `;
};
