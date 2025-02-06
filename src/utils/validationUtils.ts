export const validationUtils = {
  validateAmount(amount: number): void {
    if (amount === 0) {
      throw new Error("The amount field cannot be zero.");
    }
  },

  validateDescription(description: string): void {
    if (!description) {
      throw new Error("The description field is required.");
    }
  },
};
