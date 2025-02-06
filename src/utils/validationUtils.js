"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationUtils = void 0;
exports.validationUtils = {
    validateAmount(amount) {
        if (amount === 0) {
            throw new Error("O campo amount não pode ser zero.");
        }
    },
    validateDescription(description) {
        if (!description) {
            throw new Error("O campo description é obrigatório.");
        }
    },
};
