export const generateCaseId = (existingCases: { caseId: string }[]): string => {
  const currentYear = new Date().getFullYear();
  
  // Finde die höchste Nummer für das aktuelle Jahr
  const yearCases = existingCases
    .filter(c => c.caseId.startsWith(`CASE-${currentYear}-`))
    .map(c => {
      const match = c.caseId.match(/CASE-\d{4}-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
  
  const maxNumber = yearCases.length > 0 ? Math.max(...yearCases) : 0;
  const nextNumber = maxNumber + 1;
  
  return `CASE-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
};

export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
