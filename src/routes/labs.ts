import { Router, Request, Response } from "express"
const router = Router()
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore"
import { nanoid } from "nanoid"
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db } from "../fireabase"
import { LAB_JOIN_LINK_EXPIRED, LAB_NOT_FOUND } from "../errors/labErrors"

const labCollectionRef = db.collection("labs")

router.use(isAuthenticated)

router.get("/", async (req: Request, res: Response) => {
  const { studentUid } = req.query
  if (studentUid) {
    const pubLabsPromise = labCollectionRef.where('visibility', '==', 'public').get()
    const joinedLabsPromise = labCollectionRef.where('studentUids', 'array-contains', studentUid).get()
    const [pubLabs, joinedLabs] = await Promise.all([pubLabsPromise, joinedLabsPromise])
    const allLabs = [...pubLabs.docs, ...joinedLabs.docs]
    res.status(StatusCodes.ACCEPTED).json({ labs: allLabs.map(lab => ({ id: lab.id, ...lab.data() })) })
  } else {
    const allLabs = (await labCollectionRef.get()).docs.map(lab => lab.data())
    res.status(StatusCodes.ACCEPTED).json({ labs: allLabs })
  }
})

router.get("/:labId/lab-joining-links", async (req: Request, res: Response) => {
  const { labId } = req.params;
  const lab = await db.collection('labs').doc(labId).get()
  if (lab.exists) {
    const labLink = lab.data()?.joiningLink
    res.status(StatusCodes.ACCEPTED).json(labLink)
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(LAB_NOT_FOUND)
  }
})

/**
 * Router for creating lab joining links
 */
router.post("/:labId/lab-joining-links", async (req: Request, res: Response) => {
  try {
    const { labId } = req.params
    const { expiryDate } = req.body
    const labRef = labCollectionRef.doc(labId)
    const lab = await labRef.get()
    const code = nanoid(10)
    const link = `join-lab?code=${code}`

    if (!lab.exists) {
      res.status(StatusCodes.BAD_REQUEST).json(LAB_NOT_FOUND)
    } else {
      const data = {
        joiningLink: {
          url: link,
          code,
          expiryTimestamp: expiryDate ? Timestamp.fromMillis(expiryDate.seconds * 1000) : null
        }
      }
      await labRef.update(data)
      res.status(StatusCodes.CREATED).json(data)
    }
  } catch (err: any) {
    console.log(err);
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
})

/**
 * Route for joining lab
 */
router.post('/students', async (req: Request, res: Response) => {
  const { uid, name, email, code } = req.body;
  console.log(uid, name, email, code, 'bodu');
  try {
    const query = labCollectionRef.where('joiningLink.code', '==', code)
    const queryRes = await query.get()

    if (!queryRes.empty) {
      const labRef = queryRes.docs.at(0)?.ref
      const labData = queryRes.docs.at(0)?.data()
      const linkExpiryDate = labData?.joiningLink.expiryTimestamp
      const currentDate = Timestamp.now();
      console.log(linkExpiryDate, currentDate);

      if (currentDate > linkExpiryDate) {
        res.status(StatusCodes.BAD_REQUEST).json(LAB_JOIN_LINK_EXPIRED)
        return
      }
      const labStudents = labData?.students?.filter((student: any) => student.uid === uid) || []
      if (labStudents.length == 0) {
        await labRef?.update({
          studentUids: FieldValue.arrayUnion(uid),
          students: FieldValue.arrayUnion({
            uid, email, name, joinedAt: Timestamp.now()
          })
        })
        res.status(StatusCodes.ACCEPTED).json({ labId: labData?.id })
      } else {
        res.status(StatusCodes.ACCEPTED).json({ labId: labData?.id })
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(LAB_NOT_FOUND)
    }
  } catch (err) {
    console.log(err);

  }
})

export default router
