import {Router} from 'express'
import {dungeons, battlegrounds, online, lfg} from './controllers.js'
const router = Router()

router.get('/dungeons', (req, res) => dungeons(req, res))
router.get('/battlegrounds', (req, res) => battlegrounds(req, res))
router.get('/online', (req, res) => online(req, res))
router.get('/lfg', lfg)
router.get('/', (_, res) => { res.set('location', '/dungeons'); res.status(301).send() })

// Add partial update routes
router.get('/partial/dungeons', (req, res) => dungeons(req, res, true))
router.get('/partial/battlegrounds', (req, res) => battlegrounds(req, res, true))
router.get('/partial/online', (req, res) => online(req, res, true))

export default router