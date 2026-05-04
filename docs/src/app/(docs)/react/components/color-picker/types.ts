import { ColorPicker } from '@base-ui/react/color-picker';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, ColorPicker);

export const TypesColorPicker = types;
export const TypesColorPickerAdditional = AdditionalTypes;
