import path from 'node:path'
import express from 'express'
import config from 'config'
import router from './router.js'

const __dirname = path.resolve(),
    port = config.get('port'),
    host = config.get('host'),
    app = express()

app.set('view engine', 'ejs')
app.use('/static', express.static(__dirname + '/static', { maxAge: 24*60*60*1000 }))
app.use(router)

app.listen(port, host, () => {
    console.log(`WebServer listening on ${host}:${port}`)
})