import { useFileRejection as useSharedFileRejection } from '../useFileRejection';

export function useFileRejection() {
  return useSharedFileRejection();
}
