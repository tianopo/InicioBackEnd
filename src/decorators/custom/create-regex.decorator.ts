import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

type value = string | null | undefined;
export const CustomCreateRegex = (regex: RegExp, validationOptions?: ValidationOptions) => {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isRegexMatch",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: value, _: ValidationArguments) {
          if (!value) {
            return true;
          }
          return regex.test(value);
        },
      },
    });
  };
};
