import fs from "fs";
import jsPDF from "jspdf";
import path from "path";
import { MultaDto } from "../../modules/send-email/dto/multaDto";

const imageToBase64 = (filePath: string): string => {
  const imageBuffer = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
};

export const generatePDFMulta = (data: MultaDto): Buffer => {
  const doc = new jsPDF();
  const margin = 10;
  const topMargin = 5; // Reduzir margem superior
  const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  const pageHeight = doc.internal.pageSize.getHeight() - 2 * margin;

  // Adiciona a imagem de marca d'água reduzida e centralizada
  const marcaDaguaPath = path.join(process.cwd(), "public", "marcadaagua.jpg");
  const marcaDaguaBase64 = imageToBase64(marcaDaguaPath);
  const marcaDaguaWidth = pageWidth * 0.6; // Ajuste conforme o tamanho desejado
  const marcaDaguaHeight = marcaDaguaWidth * 0.5; // Mantém a proporção da imagem
  const marcaDaguaX = (doc.internal.pageSize.getWidth() - marcaDaguaWidth) / 2;
  const marcaDaguaY = (doc.internal.pageSize.getHeight() - marcaDaguaHeight) / 2;
  doc.addImage(
    marcaDaguaBase64,
    "JPEG",
    marcaDaguaX,
    marcaDaguaY,
    marcaDaguaWidth,
    marcaDaguaHeight,
    undefined,
    "SLOW",
  );

  // Adiciona o logo
  const logoPath = path.join(process.cwd(), "public", "logo.jpg");
  const logoBase64 = imageToBase64(logoPath);
  const logoWidth = 60;
  const logoHeight = 40;
  doc.addImage(logoBase64, "JPEG", margin, topMargin, logoWidth, logoHeight);

  // Adiciona o rodapé com a imagem de fundo
  const footerPath = path.join(process.cwd(), "public", "footer.jpg");
  const footerBase64 = imageToBase64(footerPath);
  const footerHeight = 40; // Ajuste conforme o tamanho da sua imagem de rodapé
  const footerY = doc.internal.pageSize.getHeight() - footerHeight;
  doc.addImage(footerBase64, "JPEG", 0, footerY, doc.internal.pageSize.getWidth(), footerHeight);

  // Configurações de estilo
  const headerFontSize = 14;
  const subHeaderFontSize = 13;
  const textFontSize = 11;
  const footerFontSize = 8.5;

  // Título
  doc.setFontSize(headerFontSize);
  doc.setTextColor(34, 139, 230); // Cor azul
  doc.text("NOTIFICAÇÃO DE DESCONTO DE MULTA", margin, topMargin + logoHeight); // Ajusta posição

  // Identificação do Infrator
  doc.setFontSize(subHeaderFontSize);
  doc.setTextColor(0, 0, 0); // Cor preta
  doc.text("1 - Identificação do Infrator", margin, topMargin + logoHeight + 5); // Ajusta posição

  doc.setFontSize(textFontSize);
  let y = topMargin + logoHeight + 10; // Ajusta posição inicial
  const identifLines = [
    `Nome: ${data.nome}`,
    `CPF: ${data.cpf}`,
    `CNH: ${data.cnh}`,
    `Categoria: ${data.categoria}`,
    `Validade: ${data.validade}`,
  ];
  identifLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5; // Espaço aumentado entre linhas
  });

  // Tipo de Desconto
  doc.setFontSize(subHeaderFontSize);
  doc.text("2 - Tipo de Desconto", margin, y);
  y += 5;

  doc.setFontSize(textFontSize);
  const tipoDescontoLines = [
    `Multa de trânsito: SIM [ ] NÃO [ ]`,
    `Auto de Infração Nº: ${data.numeroAutoInfracao}`,
    `Data: ${data.dataInfracao}`,
    `Hora: ${data.horaInfracao}`,
    `Local da infração: ${data.localInfracao}`,
    `Veículo Placa: ${data.placaVeiculo}`,
    `Marca/Modelo/Ano: ${data.marcaModeloAno}`,
    `TIPO: CARRETA [ ] CAVALO [ ]`,
  ];
  tipoDescontoLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5; // Espaço aumentado entre linhas
  });

  // Base Legal e Justificativa
  doc.setFontSize(subHeaderFontSize);
  doc.text("3 - Base Legal e Justificativa", margin, y);
  y += 5;

  doc.setFontSize(textFontSize);
  const baseLegalText =
    "Este desconto está sendo realizado com base no parágrafo nono do Contrato de Prestação de Serviço (Agregados), conforme estipulado no regulamento interno da empresa e acordado entre as partes.";
  doc.text(doc.splitTextToSize(baseLegalText, pageWidth), margin, y);
  y += 5;

  // Notificação
  doc.setFontSize(subHeaderFontSize);
  doc.text("4 – Notificação", margin, y);
  y += 5;

  doc.setFontSize(textFontSize);
  const notificacaoLines = [
    `Fica NOTIFICADO para os devidos fins o infrator acima identificado (Campo 1) que será descontado em sua remuneração/frete o valor equivalente a R$ ${data.valorMulta}.`,
    "Ao assinar esse documento o infrator identificado AUTORIZA o desconto integral da multa descriminado anteriormente.",
    `O infrator tem o prazo de ${data.prazoRecurso} dias para apresentar recurso contra esta notificação, conforme o procedimento estipulado pela empresa.`,
    "São José dos Campos  ___________ de ______________________ de 2024.",
    "Por ser verdade o presente será firmado em 02 (duas) vias.",
    "Assinatura do(a) infrator(a): ______________________",
    "Assinatura do(a) gestor(a) Operacional: ______________________",
  ];
  notificacaoLines.forEach((line) => {
    doc.text(doc.splitTextToSize(line, pageWidth), margin, y);
    y += 5; // Espaço aumentado entre linhas
  });

  // Adiciona o texto do rodapé sobre a imagem
  doc.setFontSize(footerFontSize);
  const rodapeContent =
    "Na hipótese de não apresentação do recurso referente à cobrança da multa por infração de trânsito, o valor da multa será acrescido de uma penalidade adicional. Esta penalidade será equivalente ao valor da multa, duplicado, em virtude da falta de identificação do condutor infrator.";
  const rodapeY = footerY - 15; // Ajusta a posição para ficar sobre a imagem do rodapé
  doc.text(doc.splitTextToSize(rodapeContent, pageWidth), margin, rodapeY);

  // Rodapé
  let footerYPos = footerY + 8; // Ajusta a posição inicial para o rodapé
  const footerLines = [
    new Date().toLocaleDateString(),
    "Telefone: (12) 3921 - 6302",
    "E-mail: comercial@jbblog.com.br",
    "Endereço: Av. Cassiano Ricardo, 319 - sala 1806 - Jardim Aquarius, São José dos Campos - SP",
  ];
  footerLines.forEach((line) => {
    doc.text(doc.splitTextToSize(line, pageWidth), margin, footerYPos);
    footerYPos += 2; // Espaço aumentado entre linhas
  });

  return Buffer.from(doc.output("arraybuffer"));
};
