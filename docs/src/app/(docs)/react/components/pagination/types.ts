import { Pagination } from '@base-ui/react/pagination';
import { createMultipleTypes } from 'docs/src/utils/createTypes';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, Pagination);

export const TypesPagination = types;
export const TypesPaginationAdditional = AdditionalTypes;
