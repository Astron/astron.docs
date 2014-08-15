## Editing the Docs

The docs live in `public/docs/<language>/<version>` as markdown files.  
They can be edited through Git, or using GitHub's on-site editing tool.  
Please fork the repository; make your changes; then submit a pull request when you're done.

## Developing astron.github.io

Install `node.js` via package manager or from [npmjs.org](https://npmjs.org)

```sh
# On Ubuntu
sudo apt-get install node-js

# On Max OS X
brew install node
```

Install the `gulp` build tool

```sh
[sudo] npm install -g gulp

cd documentation/github.io
npm install
```

Run local server for development: `gulp dev`

Make a build for [astron.github.io](https://astron.github.io) with `gulp build`
