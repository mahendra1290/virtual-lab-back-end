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
var firestore_1 = require("firebase-admin/firestore");
var http_status_codes_1 = require("http-status-codes");
var auth_1 = require("../middlewares/auth");
var fireabase_1 = require("../fireabase");
var notificationsRef = function (uid) { return fireabase_1.db.collection("notifications-" + uid); };
var expSessionsRef = fireabase_1.db.collection("lab-sessions");
var usersRef = fireabase_1.db.collection("users");
var labsRef = fireabase_1.db.collection("labs");
router.use(auth_1.isAuthenticated);
function sendNotifications(uids, notification) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        return __generator(this, function (_a) {
            promises = [];
            uids.forEach(function (uid) {
                var noteRef = notificationsRef(uid);
                promises.push(noteRef.add(notification));
            });
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
router.post("/lab-invite", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, emails, labJoinUrl, labName, data, uids, notification;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, emails = _a.emails, labJoinUrl = _a.labJoinUrl, labName = _a.labName;
                return [4 /*yield*/, usersRef.where('email', 'in', emails).get()];
            case 1:
                data = _b.sent();
                if (!!data.empty) return [3 /*break*/, 3];
                uids = data.docs.map(function (doc) { return doc.id; });
                if (uids.length == 0) {
                    res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
                    return [2 /*return*/];
                }
                notification = {
                    title: 'Lab Invite',
                    description: "You're invited to join " + labName + ".",
                    createdAt: firestore_1.Timestamp.now(),
                    actions: [
                        {
                            name: 'Join',
                            action: labJoinUrl
                        }
                    ]
                };
                return [4 /*yield*/, sendNotifications(uids, notification)];
            case 2:
                _b.sent();
                res.status(http_status_codes_1.StatusCodes.NO_CONTENT).json({ emails: emails, labJoinUrl: labJoinUrl });
                return [3 /*break*/, 4];
            case 3:
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'bad reqest' });
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/lab-session-start", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, sessionUrl, labId, docSnap, data, students, notification, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, sessionUrl = _a.sessionUrl, labId = _a.labId;
                if (!(!sessionUrl || !labId)) return [3 /*break*/, 1];
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'session id not provided' });
                return [3 /*break*/, 7];
            case 1:
                _b.trys.push([1, 6, , 7]);
                return [4 /*yield*/, labsRef.doc(labId).get()];
            case 2:
                docSnap = _b.sent();
                if (!docSnap.exists) return [3 /*break*/, 4];
                data = docSnap.data();
                students = data.studentUids || [];
                notification = {
                    title: 'Lab Session started',
                    description: 'Your teacher has started new lab session.',
                    createdAt: firestore_1.Timestamp.now(),
                    actions: [
                        {
                            name: 'Join',
                            action: sessionUrl
                        }
                    ]
                };
                return [4 /*yield*/, sendNotifications(students, notification)];
            case 3:
                _b.sent();
                res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
                return [3 /*break*/, 5];
            case 4:
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Lab session not found" });
                _b.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                err_1 = _b.sent();
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Something went wrong", message: err_1.message });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
