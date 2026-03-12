// src/od-school/config/od-packages.ts

export interface ODSchoolPackage {
  id: string;
  name: string;
  price: number;
  lessons: number;
}

/**
 * Central configuration for all driving school packages.
 * This prevents frontend tampering and ensures backend validation.
 */
export const OD_SCHOOL_PACKAGES: ODSchoolPackage[] = [
  {
    id: 'starter',
    name: 'Starter Package',
    price: 85000,
    lessons: 5,
  },
  {
    id: 'standard',
    name: 'Standard Package',
    price: 120000,
    lessons: 10,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    price: 180000,
    lessons: 15,
  },
];

/**
 * Returns a package if it exists.
 * Used for backend validation.
 */
export function getPackageById(id: string): ODSchoolPackage | undefined {
  return OD_SCHOOL_PACKAGES.find((pkg) => pkg.id === id);
}
