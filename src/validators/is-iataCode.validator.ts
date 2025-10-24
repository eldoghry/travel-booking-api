import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsIataCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isIataCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && /^[A-Z]{3}$/.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'IATA code must be exactly 3 uppercase letters';
        },
      },
    });
  };
}
