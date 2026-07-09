import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const PATH_OR_URL_PATTERN = /^(\/[^\s]*|https?:\/\/[^\s]+)$/;

/**
 * Accepts either a site-relative path ("/admissions") or an absolute
 * http(s) URL ("https://youtube.com/..."), and rejects everything else -
 * bare strings like "admissions" or "javascript:alert(1)" fail. Shared by
 * every homepage link field (Hero CTA hrefs, Quick Link hrefs) since they
 * all have the same "internal route or external URL" shape.
 */
export function IsPathOrUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPathOrUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          return typeof value === 'string' && PATH_OR_URL_PATTERN.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a relative path starting with "/" or an absolute http(s) URL`;
        },
      },
    });
  };
}
