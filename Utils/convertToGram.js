exports.convertToGrams = (weight, unit) => {
  switch (unit) {
    case "g":
      return weight;
    case "dkg":
      return weight * 10;
    case "kg":
      return weight * 1000;
    case "ml":
      return weight;
    case "dl":
      return weight * 100;
    case "l":
      return weight * 1000;
    default:
      return weight;
  }
};
