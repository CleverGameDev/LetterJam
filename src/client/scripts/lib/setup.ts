import { LetterDistribution } from "src/shared/constants";

export const getDeck = () => {
  const letters = [];
  for (const key of Object.keys(LetterDistribution)) {
    letters.push(...Array(LetterDistribution[key]).fill(key));
  }
  return letters;
};

export const shuffle = (arr) => {
  const arrCopy = [...arr];
  for (let i = 0; i < arrCopy.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arrCopy[i];
    arrCopy[i] = arrCopy[j];
    arrCopy[j] = temp;
  }
  return arrCopy;
};
