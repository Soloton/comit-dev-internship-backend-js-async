exports.stringWithPossiblePlusToInteger = function (value) {
  if (/^[+]?(\d+)$/.test(value)) {
    let number = Number(value);
    if (value[0] === "+") {
      return number;
    }
    return -number;
  }
  return NaN;
};
