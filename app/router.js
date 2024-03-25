import {Router} from 'express'
import {dungeons, battlegrounds, online} from './controllers.js'
const router = Router()

router.get('/dungeons', dungeons)
router.get('/battlegrounds', battlegrounds)
router.get('/online', online)

export default router