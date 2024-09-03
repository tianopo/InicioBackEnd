import { CompraDto } from "../../../modules/send-email/dto/compra.dto";
import { VendaDto } from "../../../modules/send-email/dto/venda.dto";

const formatTransacao = (transacao: VendaDto | CompraDto, tipo: "venda" | "compra") => `
<li><strong>Nome ${tipo === "venda" ? "do Comprador" : "do Vendedor"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).nomeComprador : (transacao as CompraDto).nomeVendedor}</li>
  <li><strong>Apelido ${tipo === "venda" ? "do Comprador" : "do Vendedor"}:</strong> ${tipo === "venda" ? (transacao as VendaDto).apelidoComprador : (transacao as CompraDto).apelidoVendedor}</li>
  <li>${tipo === "venda" ? `<strong>CPF/CNPJ do Comprador:</strong> ${(transacao as VendaDto).cpfComprador}` : ""}</li>
  <li><strong>Número da Ordem:</strong> ${transacao.numeroOrdem}</li>
  <li><strong>Data e Hora da Transação:</strong> ${transacao.dataHoraTransacao}</li>
  <li><strong>Exchange Utilizada:</strong> ${transacao.exchangeUtilizada.split(" ")[0]}</li>
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
      acc + parseFloat(venda.valorVenda.replace("R$", "").replace(/\./g, "").replace(",", ".")),
    0,
  );
  const totalCompras = compras.reduce(
    (acc, compra) =>
      acc + parseFloat(compra.valorCompra.replace("R$", "").replace(/\./g, "").replace(",", ".")),
    0,
  );
  const lucroTotal = totalVendas - totalCompras;

  const hoje = new Date();

  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  const hojeAtual = new Date(ano, mes - 1, dia);

  const dataHojeAtual = hojeAtual.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
          .policy {
            text-align: left;
            margin-top: 20px;
            padding: 0 20px;
            font-size: 14px;
          }
          .policy h2 {
            color: #228BE5;
          }
          .support {
            text-align: left;
            margin-top: 20px;
            padding: 0 20px;
            font-size: 14px;
          }
          .support h2 {
            color: #228BE5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="./cryptotech.png" alt="Logo" class="logo">
          <h1>Apuração de Transações na Data de ${dataHojeAtual}</h1>
          <h2>Resumo das Transações</h2>
          <div class="details">
            <ul>
              <li><strong>Total de Vendas:</strong> ${vendas.length}</li>
              <li><strong>Total de Compras:</strong> ${compras.length}</li>
              <li><strong>Lucro total do dia:</strong> R$ ${lucroTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
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
          <div class="policy">
            <h2>Política de Pagamento</h2>
            <p><strong>Comprovação de Identidade:</strong> Não aceito pagamentos sem CPF, mas a pessoa pode se negar a passar por questão de segurança da plataforma se a pessoa já for verificada. Eles são concordados em serem verificados e validados nesses seguintes sites:</p>
            <ul>
              <li><a href="https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista?pagina=1&tamanhoPagina=10">Portal da Transparência: https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista?pagina=1&tamanhoPagina=10</a></li>
              <li><a href="https://www.situacao-cadastral.com/">Situação Cadastral: https://www.situacao-cadastral.com/</a></li>
              <li><a href="https://buscaprime.com.br/buscar-dados-pelo-cpf/consulta.php">Consulta CPF: https://buscaprime.com.br/buscar-dados-pelo-cpf/consulta.php</a></li>
              <li><a href="https://totalconsulta.com/">Consulta CPF: https://totalconsulta.com/</a></li>
              <li><a href="https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp">Receita Federal: https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp</a></li>
            </ul>
            <p><strong>Proibição de Pagamentos por Terceiros:</strong> Não aceito pagamentos realizados por terceiros. O pagamento deve ser feito pela mesma pessoa que está realizando a compra ou conta pessoa jurídica somente com sócio ou titular.</p>
            <p><strong>Liberação de Ativos Digitais:</strong> Os ativos digitais são liberados apenas mediante a apresentação de um comprovante de transação em BRL (Reais).</p>
          </div>
          <div class="policy">
            <h2>Termos e Condições para Transacionar com a Cryptotech</h2>
            <p>Não aceitamos pagamentos por terceiros. Conta PJ somente com sócio ou titular.</p>
            <p>Ao iniciar o pedido, você concorda que seu CPF será verificado de várias maneiras, além de fornecer as seguintes informações para as devidas verificações: Documento com foto, Nome completo, CPF e, opcionalmente, data de nascimento.</p>
            <p>Após o pagamento, enviar o COMPROVANTE no CHAT para liberação das criptos, por gentileza.</p>
          </div>
          <div class="support">
            <h2>Suporte de Dúvidas</h2>
            <p>Para saber mais sobre um pedido de compra P2P e garantir que as transações não são fraudulentas, acesse o link abaixo e procure falar com um atendente para maiores informações:</p>
            <ul>
              <li><a href="https://www.bybit.com/pt-BR/help-center/?language=pt_BR">Bybit - Suporte: https://www.bybit.com/pt-BR/help-center/?language=pt_BR</a></li>
              <li><a href="https://www.binance.com/pt-BR/chat">Binance - Suporte: https://www.binance.com/pt-BR/chat</a></li>
              <li><a href="https://www.kucoin.com/support">KuCoin - Suporte: https://www.kucoin.com/support</a></li>
              <li><a href="https://www.gate.io/pt/help">Gate.io - Suporte: https://www.gate.io/pt/help</a></li>
            </ul>
          </div>
          <div class="footer">
            Este é um e-mail automático, por favor não responda.
          </div>
        </div>
      </body>
    </html>
  `;
};
