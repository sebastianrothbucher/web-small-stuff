// create a jittery backend that is sometimes fast and sometimes slow
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({origin: 'http://localhost:8080'}));

app.get('/test', async (req, res) => {
    const wait = Math.round(3000 * Math.random());
    console.log('Got request - need ' + wait + 'ms');
    await new Promise(resolve => setTimeout(resolve, wait));
    res.json({content: 'Some content ' + req.query.action});
    console.log('OK - done after ' + wait + 'ms');
});

const port = process.env.PORT || 8090;
console.log('Listening on ' + port);
app.listen(port);
