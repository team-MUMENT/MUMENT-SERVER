import express, { Request, Response } from 'express';
const app = express();
import routes from './routes';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// router
app.use(routes);

// error handler
interface ErrorType {
    message: string;
    status: number;
}

app.use(function (err: ErrorType, req: Request, res: Response) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'production' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(process.env.PORT, () => {
    console.log(`
    ################################################
          🛡️  Server listening on port 🛡️
    ################################################
  `);
}).on('error', err => {
    console.error(err);
    process.exit(1);
});
