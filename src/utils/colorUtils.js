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

/**
 * Converts a hex color to an RGB string "r, g, b" for CSS variables.
 * @param {string} hex
 * @returns {string} "r, g, b"
 */
export const hexToRgb = (hex) => {
  if (!hex) return "0, 0, 0";
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

/**
 * Converts a vec3 array [0..1] to an rgb() string.
 * @param {number[]} vec3 - [r, g, b]
 * @returns {string} "rgb(r, g, b)"
 */
export const vec3ToRgbString = (vec3) => {
  return `rgb(${vec3[0] * 255}, ${vec3[1] * 255}, ${vec3[2] * 255})`;
};
