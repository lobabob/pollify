# eventstream
Will generate a stream of events by polling a provided function at a specified rate. This rate is the minimum rate, not
the exact rate (similar to setTimeout). The provided function is only polled when the previous execution has completed.
This has the effect of making async calls execute in sequence.

## Usage

With regular functions:
```
const EventStream = require('eventstream');

function fn (arg1, arg2) {
  return arg1 + arg2;
}

const eventStream = EventStream({ rate: 1000, mode: 'return' }, fn, arg1, arg2);

eventStream.on('data', (data, timestamp) => {
  console.log(data);
});

eventStream.on('error', e => {
  console.error(e);
});
```

With functions that take a callback:

```
const EventStream = require('eventstream');

function fn (arg1, arg2, cb) {
  return cb(null, arg1 + arg2);
}

const eventStream = EventStream({ rate: 1000, mode: 'callback' }, fn, arg1, arg2);

eventStream.on('data', (data, timestamp) => {
  console.log(data);
});

eventStream.on('error', e => {
  console.error(e);
});
```

With promises:

```
const EventStream = require('eventstream');

function fn (arg1, arg2, cb) {
  return Promise.resolve(arg1 + arg2);
}

const eventStream = EventStream({ rate: 1000, mode: 'promise' }, fn, arg1, arg2);

eventStream.on('data', (data, timestamp) => {
  console.log(data);
});

eventStream.on('error', e => {
  console.error(e);
});
```
