import { Router, Request, Response } from "express"
const router = Router()
import { getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"


const expSessionsRef = db.collection("lab-sessions")

const checkActiveLabSessionExists = async (labId: string, expId: string) => {
  const query = expSessionsRef.where("expId", "==", expId).where("labId", "==", labId)
  const docSnap = await query.get()
  if (docSnap && docSnap.docs && !docSnap.empty) {
    const sessionDoc = docSnap.docs.at(0)?.data()
    if (sessionDoc?.active) {
      return true
    }
  }
  return false
}

router.use(isAuthenticated)

router.post("/save-progress", async (req, res) => {
  const { expSessionId, studentUid, code } = req.body
  const expRef = expSessionsRef.doc(expSessionId)
  const studentRef = expRef.collection("students").doc(studentUid)
  const studentDoc = await studentRef.get()
  if (studentDoc.exists) {
    await studentRef.set({ code }, { merge: true })
    const doc = await studentRef.get()
    res.send(doc.data())
  }
})

router.post("/attach-session", async (req, res) => {
  const { expSessionId, studentName, studentUid } = req.body
  console.log(req.body)
  const docRef = expSessionsRef.doc(expSessionId)
  const doc = await docRef.get()
  if (doc.exists) {
    const newDocRef = docRef.collection("students").doc(studentUid)
    await newDocRef.set({ name: studentName, uid: studentUid })
    const docData = await newDocRef.get()
    res.send(docData.data())
  } else {
    res.send("not foudn")
  }
})

router.post("/end-experiment-session", async (req, res) => {
  try {
    const { sessionId } = req.body
    const docRef = expSessionsRef.doc(sessionId)
    const doc = await docRef.get()
    if (doc.exists) {
      const writeRes = await docRef.set(
        {
          active: false,
          endedAt: Timestamp.fromDate(new Date()),
        },
        { merge: true },
      )
      res.status(StatusCodes.ACCEPTED).json({ response: true })
    }
  } catch (err) {
    res.status(400).send("Something went wrong")
  }
})

router.get("/lab-sessions/:id", async (req, res) => {
  try {
    const { id } = req.params
    if (id) {
      const docSnap = await expSessionsRef.doc(id).get()
      if (docSnap.exists) {
        res.status(StatusCodes.ACCEPTED).json(docSnap.data())
      }
    }
    res.status(StatusCodes.NOT_FOUND).json({ error: "Lab session not found" })
  } catch (err: any) {
    console.log(err)
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Something went wrong", message: err.message })
  }
})

router.put("/lab-sessions/:id", async (req, res) => {
  try {
    const { id } = req.params
    console.log(id);

    if (id) {
      const docSnap = await expSessionsRef.doc(id).get()
      if (docSnap.exists) {
        req.body
        const writeRes = await expSessionsRef.doc(id).set({ ...docSnap.data(), ...req.body }, { merge: true })
        res.status(StatusCodes.ACCEPTED).json()
      }
    }
  } catch (err: any) {
    console.log(err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
})

router.get("/lab-sessions", async (req: Request, res: Response) => {
  const { expId, active, labId } = req.query
  let query = expSessionsRef.where('uid', '==', req.auth?.uid);
  if (active) {
    query = query.where('active', '==', true)
  }
  if (expId) {
    query = query.where('expId', '==', expId)
  }
  if (labId) {
    query = query.where('labId', '==', labId)
  }
  const labSessions = await query.get()
  if (!labSessions.empty) {
    res.status(StatusCodes.ACCEPTED).json(labSessions.docs.map(docSnap => docSnap.data()))
  } else {
    res.status(StatusCodes.ACCEPTED).json([])
  }
})

router.post("/lab-sessions", async (req, res, next) => {
  try {

    const { expId, labId } = req.body
    if (!expId || !labId) {
      res.status(StatusCodes.BAD_REQUEST).send({
        error: "expId or labId not provided",
        message: "ExperimentId or LabId not provided",
      })
    }
    const oldSessionActive = await checkActiveLabSessionExists(labId, expId)
    if (oldSessionActive) {
      res.status(StatusCodes.BAD_REQUEST).send({
        error: "active lab session exists for this lab",
        message: "Active lab session already present",
      })
      return
    }
    if (!oldSessionActive) {

      const id = nanoid()
      if (expSessionsRef.doc(id)) {
        const docRef = await expSessionsRef.doc(id).set({
          id: id,
          active: true,
          expId: expId,
          labId: labId,
          uid: req.auth?.uid,
          startedAt: Timestamp.fromDate(new Date())
        })
        const docSnap = await expSessionsRef.doc(id).get()
        res.status(StatusCodes.CREATED).send(docSnap.data())
      }
    }
  } catch (err) {
    console.log(err)
    res.status(403).send("Something went wrong")
  }
})


export default router
