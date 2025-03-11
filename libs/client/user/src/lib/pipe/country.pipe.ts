import { Pipe, PipeTransform } from '@angular/core';
import { CountryPlace } from '@app/client/common';

@Pipe({ name: 'country' })
export class CountryPipe implements PipeTransform {
  transform(value: CountryPlace): string {
    if (!value) return '';
    const langKey = Object.keys(value.languages)[0];
    const lang = value.name.nativeName[langKey];
    if (lang) return lang.common;
    return value.name.common;
  }
}
