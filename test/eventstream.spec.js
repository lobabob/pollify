/* eslint-env mocha */
/* eslint prefer-arrow-callback: off */
'use strict';
const chai = require('chai');
const expect = chai.expect;

const EventStream = require('..');

describe('EventStream', function () {
  const rate = 20;

  it('starts polling automatically', function (done) {
    const times = [];
    const maxPolls = 2;
    const eventStream = EventStream({ rate, mode: 'return' }, () => '');

    eventStream.on('data', (data, time) => {
      times.push(time);

      if (times.length === maxPolls) {
        expect(times[1] - times[0]).to.be.at.least(rate);
        eventStream.stop();
        done();
      }
    });
  });
  it('can be provided a variable number of arguments for the poll function', function (done) {
    const randLength = Math.ceil(Math.random() * 10) + 5;
    const randomArray = [];
    for (let i = 0; i < randLength; ++i) {
      randomArray.push(i);
    }
    const eventStream = EventStream({ rate, mode: 'return' }, (...args) => args, ...randomArray);

    eventStream.on('data', data => {
      expect(data).to.eql(randomArray);
      eventStream.stop();
      done();
    });
  });
  it('can stop polling', function (done) {
    let numberOfPolls = 0;
    const maxPolls = 2;
    const eventStream = EventStream({ rate, mode: 'return' }, () => '');

    eventStream.on('data', () => {
      ++numberOfPolls;

      if (numberOfPolls === maxPolls) {
        eventStream.stop();
        setTimeout(() => {
          expect(numberOfPolls).to.equal(maxPolls);
          done();
        }, rate * 2);
      }
    });
  });
  it('can start polling again after stopping', function (done) {
    let numberOfPolls = 0;
    const maxPolls = 2;
    const eventStream = EventStream({ rate, mode: 'return' }, () => '');
    let timeoutFlag = false; // Used to indicate that eventStream has restarted after a timeout

    eventStream.on('data', () => {
      ++numberOfPolls;

      if (numberOfPolls === maxPolls) {
        eventStream.stop();

        setTimeout(() => {
          timeoutFlag = true;
          expect(numberOfPolls).to.equal(maxPolls);
          eventStream.start();
        }, rate * 2);
      }

      if (timeoutFlag) {
        expect(numberOfPolls).to.be.above(maxPolls);
        eventStream.stop();
        done();
      }
    });
  });
  it('does not have any effect when repeated start calls are made', function (done) {
    const times = [];
    const maxPolls = 10;
    const eventStream = EventStream({ rate, mode: 'return' }, () => '');
    eventStream.start();
    eventStream.start();
    eventStream.start();

    eventStream.on('data', (data, time) => {
      times.push(time);

      if (times.length === maxPolls) {
        // Repeated starts shouldn't start multiple polls. Therefore the diff between times should be at least rate
        for (let i = 1; i < times.length; ++i) {
          expect(times[i] - times[i - 1]).to.be.at.least(rate);
        }

        eventStream.stop();
        done();
      }
    });
  });
  it('does not have any effect when repeated stop calls are made', function (done) {
    let numberOfPolls = 0;
    const maxPolls = 2;
    const eventStream = EventStream({ rate, mode: 'return' }, () => '');
    let timeoutFlag = false; // Used to indicate that eventStream has restarted after a timeout

    eventStream.on('data', () => {
      ++numberOfPolls;

      if (numberOfPolls === maxPolls) {
        eventStream.stop();
        eventStream.stop();
        eventStream.stop();

        setTimeout(() => {
          timeoutFlag = true;
          expect(numberOfPolls).to.equal(maxPolls);
          eventStream.start();
        }, rate * 2);
      }

      if (timeoutFlag) {
        expect(numberOfPolls).to.be.above(maxPolls);
        eventStream.stop();
        done();
      }
    });
  });
  describe('Polling Function Types', function () {
    it('polls regular functions', function (done) {
      const eventStream = EventStream({ rate, mode: 'return' }, () => '');

      eventStream.on('data', () => {
        eventStream.stop();
        done();
      });
    });
    it('polls callback functions', function (done) {
      const eventStream = EventStream({ rate, mode: 'callback' }, cb => cb(null));

      eventStream.on('data', () => {
        eventStream.stop();
        done();
      });
    });
    it('polls promise functions', function (done) {
      const eventStream = EventStream({ rate, mode: 'promise' }, () => Promise.resolve());

      eventStream.on('data', () => {
        eventStream.stop();
        done();
      });
    });
    it('emits error events for regular function polling', function (done) {
      const e = new Error();
      const eventStream = EventStream({ rate, mode: 'return' }, () => {
        throw e;
      });

      eventStream.on('error', err => {
        expect(err).to.equal(e);
        eventStream.stop();
        done();
      });
    });
    it('emits error events for callback function polling', function (done) {
      const e = new Error();
      const eventStream = EventStream({ rate, mode: 'callback' }, cb => cb(e));

      eventStream.on('error', err => {
        expect(err).to.equal(e);
        eventStream.stop();
        done();
      });
    });
    it('emits error events for promise function polling', function (done) {
      const e = new Error();
      const eventStream = EventStream({ rate, mode: 'promise' }, () => Promise.reject(e));

      eventStream.on('error', err => {
        expect(err).to.equal(e);
        eventStream.stop();
        done();
      });
    });
  });
});
