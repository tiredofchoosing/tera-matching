import path from 'node:path';
import express from 'express';
import cookieParser  from 'cookie-parser';
import config from 'config';
import apicache from 'apicache';
import router from './router.js';

const cache = apicache.options({
    appendKey: (req, res) => req.cookies.lang
}).middleware;

const __dirname = path.resolve(),
    port = config.get('port'),
    host = config.get('host'),
    app = express();

app.set('view engine', 'ejs');
app.locals.rmWhitespace = true;
app.use('/static', express.static(__dirname + '/static', { maxAge: 24*60*60*1000 }));
app.use(cookieParser());
app.use(cache('2 seconds'));
app.use(router);

app.listen(port, host, () => {
    console.log(`WebServer listening on ${host}:${port}`);
});