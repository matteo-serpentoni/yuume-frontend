/**
 * Converts a hex color string to a GLSL-friendly Vec3 array [r, g, b] (0-1).
 * @param {string} hex - The hex color string (e.g., "#667eea").
 * @returns {number[]} Array of 3 floats representing RGB.
 */
export const hexToVec3 = (hex) => {
  if (!hex) return [0, 0, 0];
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  return [
    parseFloat((r / 255).toFixed(6)),
    parseFloat((g / 255).toFixed(6)),
    parseFloat((b / 255).toFixed(6)),
  ];
};
