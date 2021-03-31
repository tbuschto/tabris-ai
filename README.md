# Tabris Ai

This Tabris app classifies the image the camera currently sees using the [TensorFlow.js](https://www.tensorflow.org/js) model [mobilenet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet). No network connection or native Tabris/cordova plug-in is needed, the code runs in the local JS engine.

The delay between camera view and classification is about 4 seconds on my OnePlus 7 Pro phone.

## Run

If you haven't done so already, install the [Tabris CLI](https://www.npmjs.com/package/tabris-cli) on your machine:

```
npm i tabris-cli -g
```

Then in the project directory, type:

```
npm install
npm start
```

This will start a Tabris.js code server at a free port and print its URL to the console. The app code can then be [side-loaded](https://docs.tabris.com/3.7/developer-app.html#run-your-app) in the [developer app](https://docs.tabris.com/3.7/developer-app.html) by entering that URL.
