// Format numbers so they looks pretty ✨✨
export function format(number, floor = false, round = true) {
  if (floor) {
    number = Math.floor(number);
  }
  if (round) {
    number = Math.round(number * 10) / 10;
  }

  if (number >= 1_000_000) {
    number = Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "long",
      minimumFractionDigits: 3,
    }).format(number);
  } else {
    number = Intl.NumberFormat("en", {}).format(number);
  }

  return number;
}
