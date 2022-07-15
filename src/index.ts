<<<<<<< HEAD
import express, { Request, Response, NextFunction } from 'express';
=======
import express, { Request, Response } from 'express';
>>>>>>> b43c189e33e450ccd9a3b476732e6a601e917ff0
const app = express();
import connectDB from './loaders/db';
import routes from './routes';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes); //라우터
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
  })
  .on('error', err => {
    console.error(err);
    process.exit(1);
  });
