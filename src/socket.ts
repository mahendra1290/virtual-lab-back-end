import { Server, Socket } from "socket.io";
import { joinLabSession, leaveLabSession } from "./lab-sessions-manager";

const codeStudentMap = new Map<string, string>();

const sessionStudentMap = new Map<string, string>();

const uidSocketIdMap = new Map<string, string>();

const teacherStudentMap = new Map<string, Socket>();

const module = (function () {
  let io: Server | null = null;
  const setup = (server: any) => {
    io = new Server(server, {
      cors: {
        origin: '*'
      }
    })
    io.on('connection', (socket: Socket) => {
      console.log('connected');

      socket.on('join-lab-session', (data) => {
        sessionStudentMap.set(data?.student?.uid || '', data?.labSessionId)
        joinLabSession(data?.student, data?.labSessionId)
      })


      uidSocketIdMap.set(socket.handshake.auth.uid, socket.id)
      socket.on('save-code', (data) => {
        const uid = socket.handshake.auth.uid;
        codeStudentMap.set(uid, data)
        if (teacherStudentMap.has(uid)) {
          teacherStudentMap.get(uid)?.emit(`code-update-${uid}`, data)
          // io?.in(teacherStudentMap.get(uid) || '').emit(`code-update-${uid}`, data)
        }

        console.log(uid, data);

      })
      socket.on('disconnect', () => {
        const uid = socket.handshake.auth.uid
        uidSocketIdMap.delete(uid)
        const labSessionId = sessionStudentMap.get(uid)
        if (uid && labSessionId) {
          leaveLabSession(uid, labSessionId)
        }
      })
      socket.on('view-student', (studentUid) => {
        teacherStudentMap.set(studentUid, socket)
        socket.emit(`code-update-${studentUid}`, codeStudentMap.get(studentUid))
      })
    })
  }
  return {
    setup,
    io
  }
})()

export default module;
