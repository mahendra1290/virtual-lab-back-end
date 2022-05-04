import { Router, Request, Response } from "express"
const router = Router()
import { ReasonPhrases, StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes"
import { isAuthenticated } from "../middlewares/auth"
import { db, auth } from "../fireabase"

const usersRef = db.collection('users')


router.use(isAuthenticated)

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(StatusCodes.BAD_REQUEST).json({ code: 'users/id-not-provided', message: 'user id not provided as url parameter' })
    return
  }
  const user = await usersRef.doc(id).get()
  if (user.exists) {
    res.status(StatusCodes.ACCEPTED).json(user.data())
  } else {
    res.status(StatusCodes.NOT_FOUND).json({})
  }
})

router.post('/:id', async (req: Request, res: Response) => {
  const { role, displayName } = req.body;
  if (!role) {
    res.status(StatusCodes.BAD_REQUEST).json({ code: 'user/role-not-provided' })
    return
  }
  if (!displayName) {
    res.status(StatusCodes.BAD_REQUEST).json({ code: 'user/display-name-not-provided' })
  }
  const { id } = req.params;
  if (req.auth?.uid === id) {
    const user = await auth.getUser(id)
    const { uid } = req.auth
    if (user) {
      const promises: any[] = []
      promises.push(auth.updateUser(uid, {
        displayName,
      }))
      const claim = { role }
      if (role !== 'teacher' && role !== 'student' && role !== 'admin') {
        claim.role = ''
      }
      promises.push(auth.setCustomUserClaims(uid, claim))

      promises.push(usersRef.doc(uid).set({
        uid: user.uid,
        email: user.email,
        role,
        name: displayName,
        photoURL: user.photoURL || ''
      }, { merge: true }))
      try {
        await Promise.all(promises)
        res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED)
      } catch (err: any) {
        res.status(StatusCodes.BAD_REQUEST).send({ message: err.message })
      }
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" })
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" })
  }
})

export default router
