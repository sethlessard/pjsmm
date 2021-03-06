
/**
 * Cleanup a version string. (Removes '~' or '^')
 * @param version the version string.
 * @returns the cleaned string.
 */
export function cleanupVersion(version: string): string {
  return version
    .replace("^", "")
    .replace("~", "");
}
