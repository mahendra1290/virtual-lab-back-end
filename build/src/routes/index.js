"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
var lab_sessions_1 = __importDefault(require("./lab-sessions"));
var users_1 = __importDefault(require("./users"));
router.all('/api', lab_sessions_1.default, users_1.default);
exports.default = router;
