import express from 'express';
import cors from 'cors';
import dns from 'dns';

export class API {
    static start() {
        const app = express();
        const port = process.env.PORT || 80; // Specific to Heroku
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({ optionsSuccessStatus: 200 })); // Specific to freeCodeCamp projects

        app.get('/', (req, res) => {
            res.send('Hello world!');
        });

        let urls: string[] = [];

        app.post('/api/shorturl', (req, res) => {
            console.log('Request body:', req.body);
            const originalUrl = req.body.url as string;
            const domainMatches = /^(?:https?:\/\/)?([a-zA-Z0-9\-\.]+)\/?/g.exec(originalUrl);
            if (!domainMatches || !domainMatches.length) {
                res.json({
                    error: 'invalid url',
                });
                return;
            }
            const domain = domainMatches[1];
            dns.lookup(domain, (err) => {
                if (!err) {
                    urls.push(originalUrl);
                    res.json({
                        original_url: originalUrl,
                        short_url: urls.length - 1,
                    });
                    return;
                }
                res.json({
                    error: 'invalid url',
                });
                console.error(err);
            });
        });

        app.get('/api/shorturl/:short_url', (req, res) => {
            const shorturlParam = req.params.short_url;
            if (isNaN(parseInt(shorturlParam))) {
                res.send(`The short URL must be a number.`);
                return;
            }
            console.log(parseInt(shorturlParam), urls.length);
            if (parseInt(shorturlParam) >= urls.length) {
                res.send(`The short URL must be a registered Short URL.`);
                return;
            }
            const originalUrl = urls[parseInt(shorturlParam)];
            res.redirect(originalUrl);
        });

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    }
}
