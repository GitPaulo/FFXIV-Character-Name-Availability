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

## Monitor

- https://console.firebase.google.com/u/2/project/ffxiv-cna/functions
- Billing: https://console.cloud.google.com/billing/016DB6-007595-856070?authuser=2&hl=en&project=ffxiv-cna

## Problems

1. This webscraping crap won't scale. We need more clever thinking.
  - Perhaps use the datacenter filter and search the list to parse out worlds? (means less requests) But pagination (may) become a problem here.
  - Multple functions on different ip addresses? Load balancing? LOL
2. Memory cache won't be great for functions since they will clear out after a while. Switching to distributed cache fixes that but the problem 1. still remains.
