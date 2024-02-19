import {Router} from 'express'
import {dungeons, battlegrounds} from './controllers.js'
const router = Router()

router.get('/dungeons', dungeons)
router.get('/battlegrounds', battlegrounds)

export default router