# Letter Jam

An implementation of the [Letter Jam board game](https://boardgamegeek.com/boardgame/275467/letter-jam), made in Phaser.

## Development

To learn more about this repo's structure, review the README of the template project it is based on: https://github.com/yandeu/phaser-project-template/

### Running Locally

```
# Install dependencies
$ npm install

# Start the local development server
$ npm run startDev

# Ready for production?
# Build the production ready code to the /dist folder
$ npm run build

# Play your production ready game in the browser
$ npm run startProd
```

### Running the React Client

The react client lives in `src/client2`. To run it,

```
cd src/client2
npm start
```

To access the react client, navigate to http://localhost:3000/v2

The react client is not yet avaiable via the Heroku deployed app, because it is not yet set up as part of the `build` step in `package.json`.
We'll likely want to pull it into our existing Webpack build process.
More info here: https://devcenter.heroku.com/articles/nodejs-support#customizing-the-build-process
