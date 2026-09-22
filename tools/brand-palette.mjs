// Semantic roles allow each user to choose a palette independently of hue names.
export function resolvePalette(colors) {
  if (colors == null) return null;
  if (typeof colors !== 'object' || Array.isArray(colors)) throw Error('brand.colors must be an object');
  const aliases = {primary: 'purple', accent: 'yellow', surface: 'cream', text: 'darkGreen'};
  const palette = {};
  for (const [role, legacy] of Object.entries(aliases)) {
    const value = colors[role] ?? colors[legacy];
    if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
      throw Error(`brand.colors.${role} must be a six-digit hexadecimal color`);
    }
    palette[role] = value;
  }
  return palette;
}
