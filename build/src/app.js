"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importStar(require("express"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var morgan_1 = __importDefault(require("morgan"));
var cors_1 = __importDefault(require("cors"));
require("dotenv/config");
require("./fireabase");
var lab_sessions_1 = __importDefault(require("./routes/lab-sessions"));
var users_1 = __importDefault(require("./routes/users"));
var labs_1 = __importDefault(require("./routes/labs"));
var code_1 = __importDefault(require("./routes/code"));
var notifications_1 = __importDefault(require("./routes/notifications"));
var app = express_1.default();
var corsOptions = {
    origin: "http://localhost:3000",
};
app.use(cors_1.default(corsOptions));
app.use(morgan_1.default("dev"));
app.use(express_1.json());
app.use(express_1.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use("/api/users", users_1.default);
app.use("/api/lab-sessions", lab_sessions_1.default);
app.use("/api/labs", labs_1.default);
app.use("/api/code", code_1.default);
app.use("/api/notifications", notifications_1.default);
exports.default = app;
