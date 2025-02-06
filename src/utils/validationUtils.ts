export const validationUtils = {
  validateAmount(amount: number): void {
    if (amount === 0) {
      throw new Error("O campo amount não pode ser zero.");
    }
  },

  validateDescription(description: string): void {
    if (!description) {
      throw new Error("O campo description é obrigatório.");
    }
  },
};
