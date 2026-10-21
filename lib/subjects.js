// "General" first, then A–Z.
export function sortSubjects(list) {
  return [...list].sort((a, b) => {
    const ag = a.name.toLowerCase() === 'general';
    const bg = b.name.toLowerCase() === 'general';
    if (ag !== bg) return ag ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
