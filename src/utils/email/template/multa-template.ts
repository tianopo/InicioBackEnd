import { MultaDto } from "../../../modules/send-email/dto/multaDto";

export const multaTemplate = (data: MultaDto): string => {
  const today = new Date().toLocaleDateString();
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
            text-align: left;
          }
          .header, .footer {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin: 0 auto 20px;
          }
          h1 {
            color: #228BE5;
            margin-bottom: 20px;
          }
          p, li {
            margin: 10px 0;
          }
          .details {
            margin-top: 20px;
          }
          .details ul {
            list-style-type: none;
            padding: 0;
          }
          .details li {
            margin: 10px 0;
            font-size: 16px;
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
          <div class="header">
            <img src="https://via.placeholder.com/150" class="logo" alt="JBG Logística">
            <h1>NOTIFICAÇÃO DE DESCONTO DE MULTA</h1>
          </div>
          <div class="details">
            <p><strong>1 - Identificação do Infrator</strong></p>
            <ul>
              <li>Nome: ${data.nome}</li>
              <li>CPF: ${data.cpf}</li>
              <li>CNH: ${data.cnh}</li>
              <li>Categoria: ${data.categoria}</li>
              <li>Validade: ${data.validade}</li>
            </ul>
            <p><strong>2 - Tipo de Desconto</strong></p>
            <ul>
              <li>Multa de trânsito: SIM [ ] NÃO [ ]</li>
              <li>Auto de Infração Nº: ${data.numeroAutoInfracao}</li>
              <li>Data: ${data.dataInfracao}</li>
              <li>Hora: ${data.horaInfracao}</li>
              <li>Local da infração: ${data.localInfracao}</li>
              <li>Veículo Placa: ${data.placaVeiculo}</li>
              <li>Marca/Modelo/Ano: ${data.marcaModeloAno}</li>
              <li>TIPO: CARRETA [ ] CAVALO [ ]</li>
            </ul>
            <p><strong>3 - Base Legal e Justificativa</strong></p>
            <p>Este desconto está sendo realizado com base no parágrafo nono do Contrato de Prestação de Serviço (Agregados), conforme estipulado no regulamento interno da empresa e acordado entre as partes.</p>
            <p><strong>4 – Notificação</strong></p>
            <p>Fica NOTIFICADO para os devidos fins o infrator acima identificado (Campo 1) que será descontado em sua remuneração/frete o valor equivalente a R$ ${data.valorMulta}.</p>
            <p>Ao assinar esse documento o infrator identificado AUTORIZA o desconto integral da multa descriminado anteriormente.</p>
            <p>O infrator tem o prazo de ${data.prazoRecurso} dias para apresentar recurso contra esta notificação, conforme o procedimento estipulado pela empresa.</p>
            <p>São José dos Campos  ___________ de ______________________ de 2024.</p>
            <p>Por ser verdade o presente será firmado em 02 (duas) vias.</p>
            <p>Assinatura do(a) infrator(a): ______________________</p>
            <p>Assinatura do(a) gestor(a) Operacional: ______________________</p>
          </div>
          <div class="footer">
            <p>Telefone: (12) 3921 - 6302</p>
            <p>E-mail: comercial@jbblog.com.br</p>
            <p>Endereço: Av. Cassiano Ricardo, 319 - sala 1806 - Jardim Aquarius, São José dos Campos - SP</p>
            <p>${today}</p>
            <p style="font-size: 12px;">Na hipótese de não apresentação do recurso referente à cobrança da multa por infração de trânsito, o valor da multa será acrescido de uma penalidade adicional. Esta penalidade será equivalente ao valor da multa, duplicado, em virtude da falta de identificação do condutor infrator.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
