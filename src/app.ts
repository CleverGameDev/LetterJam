import * as bodyParser from "body-parser";
import * as express from "express";

// This applies a patch to the Express app to intercept routes and check if they
// return a promise. If they do, and that promise is rejected, it will call
// 'next' with the promise's error. This greatly simplifies the use of promises
// in routes and makes it practical to use async/await. Any errors thrown by the
// route, either explicitly or as unhandled exceptions, will reach Express's
// error handling route, which is the desired behavior. This will likely become
// an official feature of Express 5, but that has not yet been released.
function patchExpressForPromises(_app) {
  const app = _app;
  for (const route of ["get", "post", "options", "put", "patch", "delete"]) {
    const asyncWrap = function asyncWrap(f) {
      if (Array.isArray(f)) {
        return f.map(asyncWrap);
      }
      return [
        (req: express.Request, res: express.Response, next: express.NextFunction) => {
          const result = f(req, res, next);
          if (result && result.catch) {
            result.catch(err => err && next(err));
          }
        },
      ];
    };
    const appRoute = app[route].bind(app);
    app[route] = (...args) => {
      if (typeof args[0] !== "string") {
        return appRoute(...args);
      }
      return appRoute(...args.map((v, i) => (i === 0 ? v : asyncWrap(v))));
    };
  }
}

/**
 * Create a basic Express Application suitable for use in all environments
 */
export function createBasicApp(): express.Application {
  const app = express();
  patchExpressForPromises(app);

  app.use(bodyParser.json());

  return app;
}
