"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const globals_1 = require("@jest/globals");
(0, node_test_1.default)("Voorbeeldtest", () => {
    (0, globals_1.expect)(true).toBe(true);
});
