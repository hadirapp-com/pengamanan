import { BARCODE_HPM_SUFFIX } from "./constant";

export function addSuffix(str: string, index: number) {
  const suffix = BARCODE_HPM_SUFFIX[index % BARCODE_HPM_SUFFIX.length];
  return (str + suffix).trim();
}
