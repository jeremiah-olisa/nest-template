import * as _ from 'lodash';
import { chunk } from 'lodash';

export const randomString = (len: number, an?: 'a' | 'n' | 'an') => {
  // an = an && an.toLowerCase();
  let str = '',
    i = 0,
    min = an == 'a' ? 10 : 0,
    max = an == 'n' ? 10 : 62;
  for (; i++ < len; ) {
    let r = (Math.random() * (max - min) + min) << 0;
    str += String.fromCharCode((r += r > 9 ? (r < 36 ? 55 : 61) : 48));
  }
  return str;
};

export const updateSetObject = (updateDto: {}, field: string) => {
  const updateKeys = Object.keys(updateDto);
  let updateObject = {};

  updateKeys.forEach((key) => {
    const object = {};
    object[`${field}.$.${key}`] = updateDto[key];
    updateObject = _.merge(updateObject, object);
  });

  return updateObject;
};

export const getEnumValues = (_enum: object) => Object.values(_enum);

export const swaggerEnumValues = (
  _enum: object,
  template: string = 'Values of',
) => `${template} ${getEnumValues(_enum).join(', ')}`;
