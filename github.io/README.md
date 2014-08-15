## How to Develop the Docs

1. Install `node.js` via package manager or from [npmjs.org](https://npmjs.org)

```sh
# On Ubuntu
sudo apt-get install node-js

# On Max OS X
brew install node
```

2. Install the `gulp` build tool

```sh
[sudo] npm install -g gulp

cd documentation/github.io
npm install
```

3. Run local server for development: `gulp dev`

4. Make a build for [astron.github.io](https://astron.github.io) with `gulp build`
