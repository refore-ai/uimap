export function truncate(
  str: string,
  {
    head = 0,
    tail = 0,
    omission = '...',
  }: {
    head?: number;
    tail?: number;
    omission?: string;
  },
) {
  if (str === null || str === undefined) {
    return '';
  }

  const strLen = str.length;

  if ((head === 0 && tail === 0) || head + tail >= strLen) {
    return str;
  } else if (tail === 0) {
    return str.slice(0, head) + omission;
  } else {
    return str.slice(0, head) + omission + str.slice(strLen - tail);
  }
}
