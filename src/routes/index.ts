import { Router } from "express"
var router = Router()
import apiRouter from './lab-sessions'
import usersRouter from './users'

router.all('/api', apiRouter, usersRouter)

export default router
