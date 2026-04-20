export function getQuestionCountForDifficulty(
  difficulty: string
): 5 | 10 | 15 {
  switch (difficulty) {
    case "Junior":
      return 5;
    case "Mid":
      return 10;
    case "Senior":
      return 15;
    default:
      return 10;
  }
}
