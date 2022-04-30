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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
var firestore_1 = require("firebase-admin/firestore");
var nanoid_1 = require("nanoid");
var http_status_codes_1 = require("http-status-codes");
var auth_1 = require("../middlewares/auth");
var fireabase_1 = require("../fireabase");
var labErrors_1 = require("../errors/labErrors");
var _ = __importStar(require("lodash"));
var labCollectionRef = fireabase_1.db.collection("labs");
router.use(auth_1.isAuthenticated);
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var studentUid, pubLabsPromise, joinedLabsPromise, _a, pubLabs, joinedLabs, allLabs, allLabs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                studentUid = req.query.studentUid;
                if (!studentUid) return [3 /*break*/, 2];
                pubLabsPromise = labCollectionRef.where('visibility', '==', 'public').get();
                joinedLabsPromise = labCollectionRef.where('studentUids', 'array-contains', studentUid).get();
                return [4 /*yield*/, Promise.all([pubLabsPromise, joinedLabsPromise])];
            case 1:
                _a = _b.sent(), pubLabs = _a[0], joinedLabs = _a[1];
                allLabs = _.uniqBy(__spreadArray(__spreadArray([], pubLabs.docs), joinedLabs.docs), function (item) { return item.id; });
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ labs: allLabs.map(function (lab) { return (__assign({ id: lab.id }, lab.data())); }) });
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, labCollectionRef.get()];
            case 3:
                allLabs = (_b.sent()).docs.map(function (lab) { return lab.data(); });
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ labs: allLabs });
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/:labId/lab-joining-links", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var labId, lab, labLink;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                labId = req.params.labId;
                return [4 /*yield*/, fireabase_1.db.collection('labs').doc(labId).get()];
            case 1:
                lab = _b.sent();
                if (lab.exists) {
                    labLink = (_a = lab.data()) === null || _a === void 0 ? void 0 : _a.joiningLink;
                    res.status(http_status_codes_1.StatusCodes.ACCEPTED).json(labLink);
                }
                else {
                    res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(labErrors_1.LAB_NOT_FOUND);
                }
                return [2 /*return*/];
        }
    });
}); });
/**
 * Router for creating lab joining links
 */
router.post("/:labId/lab-joining-links", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var labId, expiryDate, labRef, lab, code, link, data, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                labId = req.params.labId;
                expiryDate = req.body.expiryDate;
                labRef = labCollectionRef.doc(labId);
                return [4 /*yield*/, labRef.get()];
            case 1:
                lab = _a.sent();
                code = nanoid_1.nanoid(10);
                link = "join-lab?code=" + code;
                if (!!lab.exists) return [3 /*break*/, 2];
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(labErrors_1.LAB_NOT_FOUND);
                return [3 /*break*/, 4];
            case 2:
                data = {
                    joiningLink: {
                        url: link,
                        code: code,
                        expiryTimestamp: expiryDate ? firestore_1.Timestamp.fromMillis(expiryDate.seconds * 1000) : null
                    }
                };
                return [4 /*yield*/, labRef.update(data)];
            case 3:
                _a.sent();
                res.status(http_status_codes_1.StatusCodes.CREATED).json(data);
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.log(err_1);
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ message: err_1.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * Route for joining lab
 */
router.post('/students', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, uid, name, email, code, query, queryRes, labRef, labData, linkExpiryDate, currentDate, labStudents, err_2;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = req.body, uid = _a.uid, name = _a.name, email = _a.email, code = _a.code;
                console.log(uid, name, email, code, 'bodu');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 8, , 9]);
                query = labCollectionRef.where('joiningLink.code', '==', code);
                return [4 /*yield*/, query.get()];
            case 2:
                queryRes = _e.sent();
                if (!!queryRes.empty) return [3 /*break*/, 6];
                labRef = (_b = queryRes.docs.at(0)) === null || _b === void 0 ? void 0 : _b.ref;
                labData = (_c = queryRes.docs.at(0)) === null || _c === void 0 ? void 0 : _c.data();
                linkExpiryDate = labData === null || labData === void 0 ? void 0 : labData.joiningLink.expiryTimestamp;
                currentDate = firestore_1.Timestamp.now();
                if (linkExpiryDate && currentDate > linkExpiryDate) {
                    res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(labErrors_1.LAB_JOIN_LINK_EXPIRED);
                    return [2 /*return*/];
                }
                labStudents = ((_d = labData === null || labData === void 0 ? void 0 : labData.students) === null || _d === void 0 ? void 0 : _d.filter(function (student) { return student.uid === uid; })) || [];
                if (!(labStudents.length == 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, (labRef === null || labRef === void 0 ? void 0 : labRef.update({
                        studentUids: firestore_1.FieldValue.arrayUnion(uid),
                        students: firestore_1.FieldValue.arrayUnion({
                            uid: uid,
                            email: email,
                            name: name,
                            joinedAt: firestore_1.Timestamp.now()
                        })
                    }))];
            case 3:
                _e.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ labId: labData === null || labData === void 0 ? void 0 : labData.id });
                return [3 /*break*/, 5];
            case 4:
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ labId: labData === null || labData === void 0 ? void 0 : labData.id });
                _e.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(labErrors_1.LAB_NOT_FOUND);
                _e.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                err_2 = _e.sent();
                console.log(err_2);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
