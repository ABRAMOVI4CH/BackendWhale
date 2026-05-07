export type GradeKey = 'Junior' | 'Middle' | 'Senior';

export interface GradeConfigDto {
  label: GradeKey;
  next: GradeKey | null;
  min: number;
  max: number;
}

/** Aligns with the mobile client defaults in WhaleScale/App. */
export const GRADES: Record<GradeKey, GradeConfigDto> = {
  Junior: { label: 'Junior', next: 'Middle', min: 0, max: 500 },
  Middle: { label: 'Middle', next: 'Senior', min: 500, max: 2000 },
  Senior: { label: 'Senior', next: null, min: 2000, max: 4000 },
};

export function gradeForTotalXp(totalXp: number): GradeConfigDto {
  if (totalXp >= GRADES.Senior.min) return GRADES.Senior;
  if (totalXp >= GRADES.Middle.min) return GRADES.Middle;
  return GRADES.Junior;
}

export function progressWithinGrade(totalXp: number): number {
  const g = gradeForTotalXp(totalXp);
  const span = Math.max(1, g.max - g.min);
  let p = ((totalXp - g.min) / span) * 100;
  if (!Number.isFinite(p)) p = 0;
  return Math.max(0, Math.min(100, Math.round(p * 100) / 100));
}
