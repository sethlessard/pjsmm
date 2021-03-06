
/**
 * Compare two npm versions.
 * @param v1 the first version to compare.
 * @param v2 the second version to compare.
 * @returns "v1" if the first version is greater
 * @returns "v2" if the second version is greater.
 * @returns "eq" if the versions are equal
 */
export function compareVersions(v1: string, v2: string): "v1" | "eq" | "v2" {
  if (v1 === "*" && v2 === "*") {
    return "eq";
  }
  if (v1 === "*" && v2 !== "*") {
    return "v1";
  }
  if (v1 !== "*" && v2 === "*") {
    return "v2";
  }
  const v1Split = v1.split(".").map(vt => parseInt(vt, 10));
  const v2Split = v2.split(".").map(vt => parseInt(vt, 10));

  // assuming the supplied versions are correct npm versions
  for (let i = 0; i < v1Split.length; i++) {
    if (v1Split[i] > v2Split[i]) {
      return "v1";
    } else if (v2Split[i] > v1Split[i]) {
      return "v2";
    }
  }
  return "eq";
}
