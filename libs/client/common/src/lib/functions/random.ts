export function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomAvatar() {
  return `https://i.pravatar.cc/40?img=${randomInt(1, 70)}`;
}
