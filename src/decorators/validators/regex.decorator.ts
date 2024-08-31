import { RegexExp } from "../../utils/regex-exp";
import { CustomCreateRegex } from "../custom/create-regex.decorator";

const createRegexDecorator = (regex: RegExp, message: string) =>
  CustomCreateRegex(regex, { message });

export const GetOneUppercase = () =>
  createRegexDecorator(RegexExp.uppercase, "Senha sem um caractere maiúsculo");
export const GetOneLowercase = () =>
  createRegexDecorator(RegexExp.lowercase, "Senha sem um caractere minúsculo");
export const GetOneSpecialCharacter = () =>
  createRegexDecorator(RegexExp.special_character, "Senha sem um caractere especial");
export const GetOneNumber = () => createRegexDecorator(RegexExp.number, "Senha sem um número");
export const EmailFormat = () => createRegexDecorator(RegexExp.email, "E-mail inválido");
export const DateFormat = () =>
  createRegexDecorator(RegexExp["DD/MM/YYYY"], "Formato de data inválido");
export const DateHourFormat = () =>
  createRegexDecorator(RegexExp.date_hour, "Formato de data inválido");
export const RGFormat = () => createRegexDecorator(RegexExp.rg_mask, "Formato de RG inválido");
export const PhoneFormat = () =>
  createRegexDecorator(RegexExp.phone_mask, "Formato de telefone inválido");
export const CellphoneFormat = () =>
  createRegexDecorator(RegexExp.cellphone_mask, "Formato de celular inválido");
export const CEPFormat = () => createRegexDecorator(RegexExp.cep_mask, "Formato de CEP inválido");
export const CNPJCPFFormat = () =>
  createRegexDecorator(RegexExp.cpfOrCnpjMask, "Formato de CPF/CNPJ inválido");
export const CPFFormat = () => createRegexDecorator(RegexExp.cpf_mask, "Formato de CPF inválido");
export const CNPJFormat = () =>
  createRegexDecorator(RegexExp.cnpj_mask, "Formato de CNPJ inválido");
