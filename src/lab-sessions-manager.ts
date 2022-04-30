import { nanoid } from 'nanoid';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from "./fireabase"

export interface Student {
  uid: string,
  email: string,
  name: string,
  active?: boolean
}

interface SessionStudentDoc {
  students: Student[],
  studentsUids: string[],
}

const sessionStudents = db.collection("session-students")

const studentWorkCollection = (uid: string) => db.collection(`student-work-${uid}`)

export async function joinLabSession(student: Student, labSessionId: string) {
  if (!student || !labSessionId) {
    return
  }
  const id = `session-${labSessionId}`

  const prevDoc = await sessionStudents.doc(id).get()

  if (prevDoc.exists) {
    const oldData = prevDoc.data() as SessionStudentDoc
    if (oldData.students.find((stud) => stud.uid == student.uid)) {
      const studCopy = [...oldData.students]
      studCopy.forEach(stud => {
        if (stud.uid === student.uid) {
          stud.active = true;
        }
      })
      return sessionStudents.doc(id).set({
        students: studCopy
      }, { merge: true })
    } else {
      return sessionStudents.doc(id).set({
        students: FieldValue.arrayUnion(
          { ...student, active: true }
        ),
        studentsUid: FieldValue.arrayUnion(
          student.uid
        )
      }, { merge: true })
    }
  } else {
    return sessionStudents.doc(id).set({
      students: FieldValue.arrayUnion(
        { ...student, active: true }
      ),
      studentsUid: FieldValue.arrayUnion(
        student.uid
      )
    }, { merge: true })
  }

}

export async function leaveLabSession(studentUid: string, labSessionId: string) {
  if (!studentUid || !labSessionId) {
    return
  }
  const id = `session-${labSessionId}`
  const prevDoc = await sessionStudents.doc(id).get()
  const studCopy = (prevDoc.data() as SessionStudentDoc).students
  studCopy.forEach(stud => {
    if (stud.uid === studentUid) {
      stud.active = false
    }
  })
  return sessionStudents.doc(id).set({
    students: studCopy,
    studentsUid: FieldValue.arrayRemove(studentUid)
  }, { merge: true })
}

export async function saveStudentSubmission(studentWork: StudentWork) {
  const colRef = studentWorkCollection(studentWork.uid)
  const docRef = colRef.doc()
  try {
    const res = await docRef.set({
      id: docRef.id,
      ...studentWork
    }, { merge: true })

  } catch (err: any) {
    console.log(err);

  }
}
