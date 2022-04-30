"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
var http_status_codes_1 = require("http-status-codes");
var auth_1 = require("../middlewares/auth");
var fireabase_1 = require("../fireabase");
var usersRef = fireabase_1.db.collection('users');
router.use(auth_1.isAuthenticated);
router.get('/', function (req, res) {
    res.send("hello");
});
router.post('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, role, displayName, id, user, uid, promises, claim, err_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, role = _a.role, displayName = _a.displayName;
                id = req.params.id;
                if (!(((_b = req.auth) === null || _b === void 0 ? void 0 : _b.uid) === id)) return [3 /*break*/, 8];
                return [4 /*yield*/, fireabase_1.auth.getUser(id)];
            case 1:
                user = _c.sent();
                uid = req.auth.uid;
                if (!user) return [3 /*break*/, 6];
                promises = [];
                promises.push(fireabase_1.auth.updateUser(uid, {
                    displayName: displayName,
                }));
                claim = { role: role };
                if (role !== 'teacher' && role !== 'student' && role !== 'admin') {
                    claim.role = '';
                }
                promises.push(fireabase_1.auth.setCustomUserClaims(uid, claim));
                promises.push(usersRef.doc(uid).set({
                    uid: user.uid,
                    email: user.email,
                    role: role,
                    name: displayName,
                    photoURL: user.photoURL || ''
                }, { merge: true }));
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, Promise.all(promises)];
            case 3:
                _c.sent();
                res.status(http_status_codes_1.StatusCodes.CREATED).send(http_status_codes_1.ReasonPhrases.CREATED);
                return [3 /*break*/, 5];
            case 4:
                err_1 = _c.sent();
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({ message: err_1.message });
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6:
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User not found" });
                _c.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
                _c.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
