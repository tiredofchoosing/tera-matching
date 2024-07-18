import {Router} from 'express'
import {dungeons, battlegrounds, online} from './controllers.js'
const router = Router()

router.get('/dungeons', dungeons)
router.get('/battlegrounds', battlegrounds)
router.get('/online', online)
router.get('/', (_, res) => { res.set('location', '/dungeons'); res.status(301).send() })

export default router