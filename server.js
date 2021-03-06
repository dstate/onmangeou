const
    express = require('express'),
    https = require('https'),
    querystring = require('querystring'),
    path = require('path'),
    config = require('./config.js')
;

const app = express();
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.get('/search', (req, res) => {
    if (!req.query.location) {
        res.json({result: 'ko', reason: 'missing [location] parameter'})
        return;
    }

    let params = {
        location: req.query.location,
        radius: req.query.radius || 300,
        type: req.query.type || 'restaurant',
        opennow: true,
        key: config.api.key
    };
    if (req.query.next_page_token) {
        params.next_page_token = req.query.next_page_token;
    }

    const url = config.api.baseUrl + '?' + querystring.stringify(params);
    https.get(url, (httpsRes) => {
        if (httpsRes.statusCode !== 200) {
            httpsRes.json({result: 'ko', reason: 'bad status code received from api'})
            return;
        }

        let rawData = '';
        httpsRes.on('data', (chunk) => rawData += chunk);
        httpsRes.on('end', () => {
            const json = JSON.parse(rawData);
            res.json({result: 'ok', data: json});
        });
    });
});

app.listen(config.server.port, config.server.host, (err) => {
    if (err) {
        return console.error(err);
    }

    console.log('Listening at http://' + config.server.host + ':' + config.server.port);
});
