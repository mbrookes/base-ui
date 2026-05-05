import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { ColorPickerRootState } from './ColorPickerRoot';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { ColorPickerRootDataAttributes } from './ColorPickerRootDataAttributes';

export const colorPickerStateAttributesMapping: StateAttributesMapping<ColorPickerRootState> = {
  value: () => null,
  format: () => null,
  open(value: boolean) {
    return value ? { [ColorPickerRootDataAttributes.open]: '' } : null;
  },
  dragging(value: boolean) {
    return value ? { [ColorPickerRootDataAttributes.dragging]: '' } : null;
  },
  disabled: () => null,
  readOnly: () => null,
  ...fieldValidityMapping,
};
