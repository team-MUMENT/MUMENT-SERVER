import express, { Request, Response, NextFunction } from 'express';
const app = express();
import routes from './routes';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../src/config/serviceAccountKey.json';
import serviceAccountRelease from '../src/config/serviceAccountKeyRelease.json';

require('dotenv').config();

const serviceAccountEnv = process.env.NODE_ENV == 'production' ? serviceAccountRelease : serviceAccount;


// firebase setting
let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountEnv as ServiceAccount),
  });
} else {
  firebase = admin.app();
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// router
app.use(routes);

// error handler
interface ErrorType {
    message: string;
    status: number;
}

app.use(function (err: ErrorType, req: Request, res: Response, next: NextFunction) {
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

export default app;