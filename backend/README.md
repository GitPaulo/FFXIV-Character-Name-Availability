# Express.js Backend

Express.js backend for FFXIV Character Availability Checker.

## Run

Inteded to be used as a firebase function,

```sh
  firebase emulators:start
```

Visit the logs panel: http://127.0.0.1:4000/logs app http://127.0.0.1:5001/ffxiv-cna/us-central1/app

## Deploy

To deploy the function to firebase, run:

```sh
  firebase deploy --only functions
```
