"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var lab_sessions_manager_1 = require("./lab-sessions-manager");
var codeStudentMap = new Map();
var sessionStudentMap = new Map();
var uidSocketIdMap = new Map();
var teacherStudentMap = new Map();
var module = (function () {
    var io = null;
    var setup = function (server) {
        io = new socket_io_1.Server(server, {
            cors: {
                origin: '*'
            }
        });
        io.on('connection', function (socket) {
            console.log('connected');
            socket.on('join-lab-session', function (data) {
                var _a;
                sessionStudentMap.set(((_a = data === null || data === void 0 ? void 0 : data.student) === null || _a === void 0 ? void 0 : _a.uid) || '', data === null || data === void 0 ? void 0 : data.labSessionId);
                lab_sessions_manager_1.joinLabSession(data === null || data === void 0 ? void 0 : data.student, data === null || data === void 0 ? void 0 : data.labSessionId);
            });
            uidSocketIdMap.set(socket.handshake.auth.uid, socket.id);
            socket.on('save-code', function (data) {
                var _a;
                var uid = socket.handshake.auth.uid;
                var lang = data.lang, code = data.code;
                codeStudentMap.set(uid, { lang: lang, code: code });
                if (teacherStudentMap.has(uid)) {
                    (_a = teacherStudentMap.get(uid)) === null || _a === void 0 ? void 0 : _a.emit("code-update-" + uid, { lang: lang, code: code });
                    // io?.in(teacherStudentMap.get(uid) || '').emit(`code-update-${uid}`, data)
                }
                console.log(uid, data);
            });
            socket.on('disconnect', function () {
                var uid = socket.handshake.auth.uid;
                uidSocketIdMap.delete(uid);
                var labSessionId = sessionStudentMap.get(uid);
                if (uid && labSessionId) {
                    lab_sessions_manager_1.leaveLabSession(uid, labSessionId);
                }
            });
            socket.on('view-student', function (studentUid) {
                teacherStudentMap.set(studentUid, socket);
                socket.emit("code-update-" + studentUid, codeStudentMap.get(studentUid));
            });
        });
    };
    return {
        setup: setup,
        io: io
    };
})();
exports.default = module;
