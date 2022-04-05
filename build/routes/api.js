"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var nanoid_1 = require("nanoid");
var http_status_codes_1 = require("http-status-codes");
var db = firestore_1.getFirestore();
var expSessionsRef = db.collection("lab-sessions");
var checkActiveLabSessionExists = function (labId, expId) { return __awaiter(void 0, void 0, void 0, function () {
    var query, docSnap, sessionDoc;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                query = expSessionsRef.where("expId", "==", expId).where("labId", "==", labId);
                return [4 /*yield*/, query.get()];
            case 1:
                docSnap = _b.sent();
                if (docSnap && docSnap.docs && !docSnap.empty) {
                    sessionDoc = (_a = docSnap.docs.at(0)) === null || _a === void 0 ? void 0 : _a.data();
                    if (sessionDoc === null || sessionDoc === void 0 ? void 0 : sessionDoc.active) {
                        return [2 /*return*/, true];
                    }
                }
                return [2 /*return*/, false];
        }
    });
}); };
router.post("/save-progress", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, expSessionId, studentUid, code, expRef, studentRef, studentDoc, doc;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, expSessionId = _a.expSessionId, studentUid = _a.studentUid, code = _a.code;
                expRef = expSessionsRef.doc(expSessionId);
                studentRef = expRef.collection("students").doc(studentUid);
                return [4 /*yield*/, studentRef.get()];
            case 1:
                studentDoc = _b.sent();
                if (!studentDoc.exists) return [3 /*break*/, 4];
                return [4 /*yield*/, studentRef.set({ code: code }, { merge: true })];
            case 2:
                _b.sent();
                return [4 /*yield*/, studentRef.get()];
            case 3:
                doc = _b.sent();
                res.send(doc.data());
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/attach-session", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, expSessionId, studentName, studentUid, docRef, doc, newDocRef, docData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, expSessionId = _a.expSessionId, studentName = _a.studentName, studentUid = _a.studentUid;
                console.log(req.body);
                docRef = expSessionsRef.doc(expSessionId);
                return [4 /*yield*/, docRef.get()];
            case 1:
                doc = _b.sent();
                if (!doc.exists) return [3 /*break*/, 4];
                newDocRef = docRef.collection("students").doc(studentUid);
                return [4 /*yield*/, newDocRef.set({ name: studentName, uid: studentUid })];
            case 2:
                _b.sent();
                return [4 /*yield*/, newDocRef.get()];
            case 3:
                docData = _b.sent();
                res.send(docData.data());
                return [3 /*break*/, 5];
            case 4:
                res.send("not foudn");
                _b.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/end-experiment-session", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, docRef, doc, writeRes, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                sessionId = req.body.sessionId;
                docRef = expSessionsRef.doc(sessionId);
                return [4 /*yield*/, docRef.get()];
            case 1:
                doc = _a.sent();
                if (!doc.exists) return [3 /*break*/, 3];
                return [4 /*yield*/, docRef.set({
                        active: false,
                        endedAt: firestore_1.Timestamp.fromDate(new Date()),
                    }, { merge: true })];
            case 2:
                writeRes = _a.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ response: true });
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                res.status(400).send("Something went wrong");
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/lab-sessions/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, docSnap, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                if (!id) return [3 /*break*/, 2];
                return [4 /*yield*/, expSessionsRef.doc(id).get()];
            case 1:
                docSnap = _a.sent();
                if (docSnap.exists) {
                    res.status(http_status_codes_1.StatusCodes.ACCEPTED).json(docSnap.data());
                }
                _a.label = 2;
            case 2:
                res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Lab session not found" });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.log(err_2);
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Something went wrong", message: err_2.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.put("lab-sessions/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, docSnap, writeRes, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                if (!id) return [3 /*break*/, 3];
                return [4 /*yield*/, expSessionsRef.doc(id).get()];
            case 1:
                docSnap = _a.sent();
                if (!docSnap.exists) return [3 /*break*/, 3];
                return [4 /*yield*/, expSessionsRef.doc(id).set(__assign(__assign({}, docSnap.data()), req.body), { merge: true })];
            case 2:
                writeRes = _a.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                err_3 = _a.sent();
                console.log(err_3);
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: err_3.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/lab-sessions", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, expId, labId, oldSessionActive, id, docRef, docSnap, err_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, expId = _a.expId, labId = _a.labId;
                if (!expId || !labId) {
                    res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                        error: "expId or labId not provided",
                        message: "ExperimentId or LabId not provided",
                    });
                }
                return [4 /*yield*/, checkActiveLabSessionExists(labId, expId)];
            case 1:
                oldSessionActive = _b.sent();
                if (oldSessionActive) {
                    res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send({
                        error: "active lab session exists for this lab",
                        message: "Active lab session already present",
                    });
                }
                id = nanoid_1.nanoid();
                if (!expSessionsRef.doc(id)) return [3 /*break*/, 4];
                return [4 /*yield*/, expSessionsRef.add({
                        id: id,
                        active: true,
                        experimentId: expId,
                        labId: labId,
                    })];
            case 2:
                docRef = _b.sent();
                return [4 /*yield*/, docRef.get()];
            case 3:
                docSnap = _b.sent();
                res.status(http_status_codes_1.StatusCodes.CREATED).send(docSnap.data());
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_4 = _b.sent();
                console.log(err_4);
                res.status(403).send("Something went wrong");
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
