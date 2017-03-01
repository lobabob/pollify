# Pollify

Will produce 'data' events by polling a function at a given rate. This rate is the minimum rate, not the exact rate (similar to setTimeout). The provided function is only polled when the previous execution has completed. This has the effect of making async calls execute in series.

### Features

* Can poll promises, callback functions, and regular functions.
* Pollify is non-blocking. Will continuously poll a synchronous function in a non-blocking way.
* Handles whether to use setTimeout or setImmediate for you.

## Examples

Polls are automatically started for you when you create them.

```
'use strict';
const Pollify = require('pollify');

// Create a poll for function fn that returns a promise
let poll = Pollify({ rate: 1000, mode: 'promise' }, fn, arg1, arg2);

// Create a poll for function fn that returns a callback
poll = Pollify({ rate: 1000, mode: 'callback' }, fn, arg1, arg2);

// Create a poll for function fn that returns a regular value
poll = Pollify({ rate: 1000, mode: 'return' }, fn, arg1, arg2);

// Listen to the 'data' event that returns data from the function execution
poll.on('data', (data, timestamp) => console.log(data));

// Listen to the error event that returns any errors thrown during function execution
poll.on('error', console.error);

// Stop the poll
poll.stop()

// Start the poll again
poll.start()
```
