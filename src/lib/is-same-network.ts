export const isSameNetwork = (ip1: string, ip2: string): boolean => {
  const [a1, b1, c1] = ip1.split(".").map(Number);
  const [a2, b2, c2] = ip2.split(".").map(Number);
  return a1 === a2 && b1 === b2 && c1 === c2;
};
