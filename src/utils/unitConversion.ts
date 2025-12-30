// Unit conversion utilities
// All weights are stored in the unit they were entered in
// This utility helps convert for display when unit preference changes

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

/**
 * Convert weight from kg to lb
 */
export function kgToLb(kg: number): number {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

/**
 * Convert weight from lb to kg
 */
export function lbToKg(lb: number): number {
  return Math.round(lb * LB_TO_KG * 10) / 10;
}

/**
 * Convert weight to the target unit
 * @param weight - The weight value
 * @param fromUnit - The unit the weight is currently in
 * @param toUnit - The unit to convert to
 */
export function convertWeight(
  weight: number,
  fromUnit: 'kg' | 'lb',
  toUnit: 'kg' | 'lb'
): number {
  if (fromUnit === toUnit) {
    return weight;
  }

  if (fromUnit === 'kg' && toUnit === 'lb') {
    return kgToLb(weight);
  }

  if (fromUnit === 'lb' && toUnit === 'kg') {
    return lbToKg(weight);
  }

  return weight;
}

/**
 * Format weight with unit
 */
export function formatWeight(weight: number, unit: 'kg' | 'lb'): string {
  return `${weight} ${unit}`;
}

/**
 * Default unit for sets that don't have a stored unit (legacy data)
 */
export const DEFAULT_WEIGHT_UNIT: 'kg' | 'lb' = 'kg';

/**
 * Get the display weight, converting if necessary
 * Handles legacy sets that don't have a weightUnit stored
 * @param weight - The stored weight value
 * @param storedUnit - The unit the weight was stored in (may be undefined for legacy data)
 * @param displayUnit - The user's current unit preference
 */
export function getDisplayWeight(
  weight: number,
  storedUnit: 'kg' | 'lb' | undefined,
  displayUnit: 'kg' | 'lb'
): number {
  // If no stored unit, assume it was entered in kg (legacy data)
  const fromUnit = storedUnit || DEFAULT_WEIGHT_UNIT;
  return convertWeight(weight, fromUnit, displayUnit);
}

/**
 * Get the conversion factor from one unit to another
 */
export function getConversionFactor(fromUnit: 'kg' | 'lb', toUnit: 'kg' | 'lb'): number {
  if (fromUnit === toUnit) return 1;
  if (fromUnit === 'kg' && toUnit === 'lb') return KG_TO_LB;
  if (fromUnit === 'lb' && toUnit === 'kg') return LB_TO_KG;
  return 1;
}
