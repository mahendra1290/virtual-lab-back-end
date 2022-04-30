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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var router = express_1.Router();
var nanoid_1 = require("nanoid");
var http_status_codes_1 = require("http-status-codes");
var auth_1 = require("../middlewares/auth");
var fireabase_1 = require("../fireabase");
var child_process_1 = require("child_process");
var dockerode_1 = __importDefault(require("dockerode"));
var promises_1 = require("fs/promises");
var lodash_1 = require("lodash");
var docker = new dockerode_1.default({ socketPath: '/var/run/docker.sock' });
router.use(auth_1.isAuthenticated);
var absPath = path.join(__dirname, '..', '..', 'codes');
var sourceCodePath = path.join(__dirname, '..', '..', 'source-codes');
var expInputsPath = path.join(__dirname, '..', '..', 'exp-inputs');
var codeRunScripts = path.join(__dirname, '..', '..', 'code-run-scripts');
var testCasesPath = path.join(__dirname, '..', '..', 'test-cases');
var testCasesDummyPath = path.join(testCasesPath, 'dummy');
var pythonSourceCodePath = path.join(sourceCodePath, 'python');
var cppSourceCodePath = path.join(sourceCodePath, 'cpp');
function gradeRunResponse(expId, output) {
    return __awaiter(this, void 0, void 0, function () {
        var testCasesRef, testCaseSnap, tData, outputs, match, score, result, verdict, verdictCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testCasesRef = fireabase_1.db.doc("test-cases/" + expId);
                    return [4 /*yield*/, testCasesRef.get()];
                case 1:
                    testCaseSnap = _a.sent();
                    if (!testCaseSnap.exists) {
                        return [2 /*return*/, null];
                    }
                    tData = testCaseSnap.data();
                    console.log(testCaseSnap.data(), output);
                    outputs = lodash_1.split(output, /output.*\n/).filter(function (val) { return val; });
                    console.log(outputs);
                    match = 0;
                    score = 0;
                    result = [];
                    tData.outputs.map(function (item, index) {
                        var expectedOut = outputs.at(index) || '';
                        var normalizeScore = typeof item.score === 'string' ? Number.parseInt(item.score) : item.score;
                        if (item.content === expectedOut) {
                            match += 1;
                            score += normalizeScore;
                            result.push({ testCase: index + 1, score: normalizeScore, correct: true });
                        }
                        else {
                            result.push({ testCase: index + 1, score: 0, correct: false });
                        }
                    });
                    verdict = '';
                    verdictCode = 0;
                    if (match === tData.outputs.length) {
                        verdict = 'Correct';
                        verdictCode = 2;
                    }
                    else if (match > 0 && match < output.length) {
                        verdict = 'Partial Correct';
                        verdictCode = 1;
                    }
                    else {
                        verdict = 'Incorrect';
                    }
                    return [2 /*return*/, { verdict: verdict, verdictCode: verdictCode, result: result, totalScore: score }];
            }
        });
    });
}
function loadTestCases(expId) {
    return __awaiter(this, void 0, void 0, function () {
        var testCasesRef, testCaseSnap, testCaseData, testCasePath, exist, inpPath_1, outPath_1, promises_2, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testCasesRef = fireabase_1.db.doc("test-cases/" + expId);
                    return [4 /*yield*/, testCasesRef.get()];
                case 1:
                    testCaseSnap = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 13, , 14]);
                    if (!testCaseSnap.exists) return [3 /*break*/, 11];
                    testCaseData = testCaseSnap.data();
                    testCasePath = path.join(testCasesPath, expId);
                    exist = fs.existsSync(testCasePath);
                    inpPath_1 = path.join(testCasePath, 'inputs');
                    outPath_1 = path.join(testCasePath, 'outputs');
                    if (!!exist) return [3 /*break*/, 5];
                    return [4 /*yield*/, promises_1.mkdir(inpPath_1, { recursive: true })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, promises_1.mkdir(outPath_1, { recursive: true })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, promises_1.rm(testCasePath, { recursive: true })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, promises_1.mkdir(inpPath_1, { recursive: true })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, promises_1.mkdir(outPath_1, { recursive: true })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    promises_2 = [];
                    testCaseData.inputs.forEach(function (inp) {
                        promises_2.push(promises_1.writeFile(path.join(inpPath_1, inp.name), inp.content, 'utf-8'));
                    });
                    testCaseData.outputs.forEach(function (out) {
                        promises_2.push(promises_1.writeFile(path.join(outPath_1, out.name), out.content, 'utf-8'));
                    });
                    return [4 /*yield*/, Promise.all(promises_2)];
                case 10:
                    _a.sent();
                    return [2 /*return*/, testCasePath];
                case 11: return [2 /*return*/, testCasesDummyPath];
                case 12: return [3 /*break*/, 14];
                case 13:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [2 /*return*/, testCasesDummyPath];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function runCppCode(userUid, code) {
    return __awaiter(this, void 0, void 0, function () {
        var workingDir, userSourceCodePath, dirName, filename, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workingDir = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    userSourceCodePath = path.join(cppSourceCodePath, userUid);
                    if (!!fs.existsSync(userSourceCodePath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, promises_1.mkdir(userSourceCodePath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    dirName = nanoid_1.nanoid(5);
                    return [4 /*yield*/, promises_1.mkdir(path.join(userSourceCodePath, dirName))];
                case 4:
                    _a.sent();
                    filename = 'main.cpp';
                    return [4 /*yield*/, promises_1.writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })];
                case 5:
                    _a.sent();
                    workingDir = path.join(userSourceCodePath, dirName);
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, workingDir];
            }
        });
    });
}
function runPythonCode(userUid, code) {
    return __awaiter(this, void 0, void 0, function () {
        var workingDir, userSourceCodePath, dirName, filename, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workingDir = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    userSourceCodePath = path.join(pythonSourceCodePath, userUid);
                    if (!!fs.existsSync(userSourceCodePath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, promises_1.mkdir(userSourceCodePath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    dirName = nanoid_1.nanoid(5);
                    return [4 /*yield*/, promises_1.mkdir(path.join(userSourceCodePath, dirName))];
                case 4:
                    _a.sent();
                    filename = 'main.py';
                    return [4 /*yield*/, promises_1.writeFile(path.join(userSourceCodePath, dirName, filename), code, { encoding: 'utf-8' })];
                case 5:
                    _a.sent();
                    workingDir = path.join(userSourceCodePath, dirName);
                    return [3 /*break*/, 7];
                case 6:
                    err_3 = _a.sent();
                    console.log(err_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, workingDir];
            }
        });
    });
}
function createCodeFile(userUid, code, extension) {
    return __awaiter(this, void 0, void 0, function () {
        var dirPath;
        return __generator(this, function (_a) {
            dirPath = path.join(absPath, "user-" + userUid);
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.mkdir(dirPath, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        var filename = nanoid_1.nanoid(5) + "." + extension;
                        var filepath = path.join(dirPath, filename);
                        fs.writeFile(filepath, code, { encoding: 'utf-8' }, function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve([filepath, filename]);
                            }
                        });
                    });
                })];
        });
    });
}
function runCppCodeInDocker(userUid, code, expId) {
    return __awaiter(this, void 0, void 0, function () {
        var testCasesPath, workingDir, outputFile, errorFile, outputStream, errorStream, script;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadTestCases(expId)];
                case 1:
                    testCasesPath = _a.sent();
                    return [4 /*yield*/, runCppCode(userUid, code)];
                case 2:
                    workingDir = _a.sent();
                    outputFile = path.join(workingDir, 'output.txt');
                    errorFile = path.join(workingDir, 'error.txt');
                    promises_1.writeFile(outputFile, '', { encoding: 'utf-8' });
                    promises_1.writeFile(errorFile, '', { encoding: 'utf-8' });
                    outputStream = fs.createWriteStream(outputFile, 'utf-8');
                    errorStream = fs.createWriteStream(errorFile, 'utf-8');
                    script = testCasesPath === testCasesDummyPath ? '/scripts/run-cpp.sh' : '/scripts/run-cpp-with-inputs.sh';
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            docker.run('frolvlad/alpine-gxx', [
                                '/bin/sh',
                                script
                            ], [outputStream, errorStream], {
                                Tty: false,
                                name: 'cpp' + userUid,
                                HostConfig: {
                                    Binds: [workingDir + ":/source", testCasesPath + ":/test-cases", codeRunScripts + ":/scripts"]
                                },
                            }, {}).then(function (data) {
                                var cont = data[1];
                                return cont.remove();
                            }).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                var outputPromise, errorPromise, _a, output, error, res;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            outputPromise = promises_1.readFile(outputFile, { encoding: 'utf-8' });
                                            errorPromise = promises_1.readFile(errorFile, { encoding: 'utf-8' });
                                            return [4 /*yield*/, Promise.all([outputPromise, errorPromise])];
                                        case 1:
                                            _a = _b.sent(), output = _a[0], error = _a[1];
                                            return [4 /*yield*/, gradeRunResponse(expId, output)];
                                        case 2:
                                            res = _b.sent();
                                            resolve({ output: output, error: error, graderResponse: res });
                                            return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (err) {
                                console.log("err", err);
                                reject(err);
                            });
                        })];
            }
        });
    });
}
function runPythonCodeInDocker(userUid, code, expId) {
    return __awaiter(this, void 0, void 0, function () {
        var testCasesPath, workingDir, outputFile, errorFile, outputStream, errorStream, script;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadTestCases(expId)];
                case 1:
                    testCasesPath = _a.sent();
                    return [4 /*yield*/, runPythonCode(userUid, code)];
                case 2:
                    workingDir = _a.sent();
                    outputFile = path.join(workingDir, 'output.txt');
                    errorFile = path.join(workingDir, 'error.txt');
                    promises_1.writeFile(outputFile, '', { encoding: 'utf-8' });
                    promises_1.writeFile(errorFile, '', { encoding: 'utf-8' });
                    outputStream = fs.createWriteStream(outputFile, 'utf-8');
                    errorStream = fs.createWriteStream(errorFile, 'utf-8');
                    script = testCasesPath === testCasesDummyPath ? '/scripts/run-python.sh' : '/scripts/run-python-with-inputs.sh';
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            docker.run('python:3.10-alpine', [
                                '/bin/sh',
                                script
                            ], [outputStream, errorStream], {
                                Tty: false,
                                name: userUid,
                                HostConfig: {
                                    Binds: [workingDir + ":/source", testCasesPath + ":/test-cases", codeRunScripts + ":/scripts"]
                                },
                            }, {}).then(function (data) {
                                var cont = data[1];
                                return cont.remove();
                            }).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                                var outputPromise, errorPromise, _a, output, error, res;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            outputPromise = promises_1.readFile(outputFile, { encoding: 'utf-8' });
                                            errorPromise = promises_1.readFile(errorFile, { encoding: 'utf-8' });
                                            return [4 /*yield*/, Promise.all([outputPromise, errorPromise])];
                                        case 1:
                                            _a = _b.sent(), output = _a[0], error = _a[1];
                                            return [4 /*yield*/, gradeRunResponse(expId, output)];
                                        case 2:
                                            res = _b.sent();
                                            resolve({ output: output, error: error, graderResponse: res });
                                            return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (err) {
                                console.log("err", err);
                                reject(err);
                            });
                        })];
            }
        });
    });
}
function runJsCode(userUid, code) {
    return __awaiter(this, void 0, void 0, function () {
        var filename, codePath, ouputPath, outStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createCodeFile(userUid, code, 'js')];
                case 1:
                    filename = _a.sent();
                    codePath = path.join(__dirname, '..', '..', 'codes');
                    ouputPath = path.join(codePath, 'output', userUid + ".txt");
                    fs.writeFileSync(ouputPath, '', { encoding: 'utf-8' });
                    outStream = fs.createWriteStream(ouputPath, 'utf-8');
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            docker.run('node:18-alpine3.14', [
                                'node',
                                "/codes/user-" + userUid + "/" + filename[1]
                            ], [outStream, outStream], {
                                Tty: false,
                                name: userUid,
                                HostConfig: {
                                    Binds: [codePath + ":/codes"]
                                },
                            }).then(function (data) {
                                var cont = data[1];
                                return cont.remove();
                            }).then(function (data) {
                                var output = '';
                                var error = '';
                                fs.readFile(ouputPath, { encoding: 'utf-8' }, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        output = data;
                                    }
                                });
                            }).catch(function (err) {
                                console.log("err", err);
                            });
                        })];
            }
        });
    });
}
router.post('/run', function (req, res) {
    var code = req.body.code;
    try {
        var filename = path.join(__dirname, '..', 'code-submissions', 'newfile.cpp');
        fs.writeFileSync(filename, code, { encoding: 'utf-8' });
        child_process_1.exec("g++ " + filename + " -o " + path.join(__dirname, '..', 'code-submissions', 'a.out'), function (error, stdout, stderr) {
            if (error) {
                console.log(stderr);
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ error: stderr });
            }
            else {
                child_process_1.exec(path.join(__dirname, '..', 'code-submissions', 'a.out'), function (error, stdout, stderr) {
                    if (error) {
                        res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ error: stderr });
                    }
                    else {
                        res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ out: stdout });
                    }
                });
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ 'error': 'Someting went wrong' });
    }
});
router.post('/run/js', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, uid, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                code = req.body.code;
                uid = (req.auth || { uid: '' }).uid;
                return [4 /*yield*/, runJsCode(uid, code)];
            case 1:
                result = _a.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json({ out: result });
                return [2 /*return*/];
        }
    });
}); });
router.post('/run/python', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, expId, uid, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, code = _a.code, expId = _a.expId;
                uid = (req.auth || { uid: '' }).uid;
                return [4 /*yield*/, runPythonCodeInDocker(uid, code, expId)];
            case 1:
                result = _b.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json(result || {});
                return [2 /*return*/];
        }
    });
}); });
router.post('/run/cpp', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, code, expId, uid, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, code = _a.code, expId = _a.expId;
                uid = (req.auth || { uid: '' }).uid;
                return [4 /*yield*/, runCppCodeInDocker(uid, code, expId)];
            case 1:
                result = _b.sent();
                res.status(http_status_codes_1.StatusCodes.ACCEPTED).json(result || {});
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
