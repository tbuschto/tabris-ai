export function resToString(resolution: {width: number, height: number}) {
  if (resolution) {
    return `${resolution.width}x${resolution.height}`;
  }
  return '';
}
