import type { IBaseObject } from '~/data/types';

type Patch = Record<string, Omit<IBaseObject, 'id'>>;

export const sur5alPatch: Patch = {};

export const ozPatch: Patch = {};
