import type { Route, RouteName, RouteParams } from '~/models/route.model.js';

import { MatcherInvalidPathError, ParsingMissingRequiredParamError } from '~/models/error.model.js';

const templateParamRegex = /\/:[^/]+/g;
const templateParamReplace = '/([^/]+)';

const templateParamRegexNumber = /\/:{number}:[^/]+/g;
const templateParamReplaceNumber = '/(\\d+)';

const templateParamRegexString = /\/:{string}:[^/]+/g;
const templateParamReplaceString = '/(\\w+)';

const optionalTemplateParamRegex = /\/:[^/]+:\?/g;
const optionalTemplateParamReplace = '/?([^/]+)?';

const optionalTemplateParamRegexNumber = /\/:{number}:[^/]+:\?/g;
const optionalTemplateParamReplaceNumber = '/?(\\d+)?';

const optionalTemplateParamRegexString = /\/:{string}:[^/]+:\?/g;
const optionalTemplateParamReplaceString = '/?(\\w+)?';

const relativePathRegex = /^\.+\//;
const hashPathRegex = /^\/?#/;

const templateParamRegexPrefix = /\/:{(number|string)}:/g;
const templateParamReplacePrefix = '/:';

const templateParamRegexSuffix = /:\?(\/|$)/g;
const templateParamReplaceSuffix = '/';

const templateWildcardRegex = /\/\*$/g;
const templateWildcardReplace = '/(.*)';

const templateWildcardSegment = /\/\*\//g;
const templateWildcardSegmentReplace = '/([^/]+)/';

const templateWildcardOrParamRegex = /\/((\*)|(:[^/]+))/g;
const templateWildcardOrParamPrefixRegex = /^\/:?/g;

export const replaceTemplateParams = (template: string, params: RouteParams = {}) =>
  template?.replace(templateParamRegexPrefix, templateParamReplacePrefix).replace(templateParamRegex, match => {
    let paramName = match.slice(2);
    const optional = paramName.endsWith(':?');
    if (optional) paramName = paramName.slice(0, -2);

    if (params[paramName] === undefined) {
      if (optional) return '';
      throw new ParsingMissingRequiredParamError({ template, missing: paramName, params });
    }

    return `/${params[paramName]}`;
  });

export const templateToRegex = (template: string) => {
  let _template = template?.trim();
  if (!_template?.length) throw new MatcherInvalidPathError(template);
  if (relativePathRegex.test(_template))
    throw new MatcherInvalidPathError(template, `Path should be absolute, but "${_template}" seems to be relative.`);
  if (!_template.startsWith('/')) _template = `/${_template}`;

  const strRegex = _template
    .replace(optionalTemplateParamRegexString, optionalTemplateParamReplaceString)
    .replace(optionalTemplateParamRegexNumber, optionalTemplateParamReplaceNumber)
    .replace(optionalTemplateParamRegex, optionalTemplateParamReplace)
    .replace(templateParamRegexString, templateParamReplaceString)
    .replace(templateParamRegexNumber, templateParamReplaceNumber)
    .replace(templateParamRegex, templateParamReplace)
    .replace(templateWildcardSegment, templateWildcardSegmentReplace)
    .replace(templateWildcardRegex, templateWildcardReplace);

  return {
    regex: new RegExp(`^${strRegex}`),
    strictRegex: new RegExp(`^${strRegex}$`),
  };
};

const templateToParams = (template: string) => {
  const _template = template?.trim();
  if (!_template?.length) throw new MatcherInvalidPathError(template);
  return (
    _template
      .replace(templateParamRegexPrefix, templateParamReplacePrefix)
      .replace(templateParamRegexSuffix, templateParamReplaceSuffix)
      .match(templateWildcardOrParamRegex)
      ?.map(r => r.replace(templateWildcardOrParamPrefixRegex, '')) ?? []
  );
};

export type PathParamsResult = { params: Record<string, string>; wildcards: Record<string, string> };
export class Matcher<Name extends RouteName = RouteName> {
  readonly #route: Route<Name>;

  readonly #regex: RegExp;
  readonly #strictRegex: RegExp;

  readonly #template: string;
  readonly #params: string[];

  constructor(route: Route<Name>) {
    this.#route = route;

    const { regex, strictRegex } = templateToRegex(route.path);
    this.#regex = regex;
    this.#strictRegex = strictRegex;

    this.#template = route.path;
    this.#params = templateToParams(route.path);
  }

  match(path: string, strict?: boolean): boolean {
    const _path = path?.trim()?.split('?')?.at(0)?.replace(hashPathRegex, '');
    if (!_path) return false;
    if (strict) return this.#strictRegex.test(_path);
    return this.#regex.test(_path);
  }

  extract(path: string): PathParamsResult {
    const _path = path?.trim()?.split('?')?.at(0)?.replace(hashPathRegex, '');
    const result: PathParamsResult = { params: {}, wildcards: {} };
    if (!_path) return result;
    this.#regex.exec(path)?.forEach((match, index) => {
      if (index === 0) return;
      if (index > this.#params.length) return;
      const paramName = this.#params[index - 1];
      if (paramName === '*') result.wildcards[index] = match;
      else result.params[paramName] = match;
    });
    return result;
  }
}