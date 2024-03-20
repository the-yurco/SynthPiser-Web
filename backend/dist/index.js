"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
var PORT = 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
