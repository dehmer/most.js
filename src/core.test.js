import assert from 'assert'
import { runEffects } from '@most/core'
import { empty, never, now, at, periodic, take, throwError, startWith, continueWith } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { curry2 } from '@most/prelude'
import { reduce } from './reduce.js'
import { fromArray } from './sources.js'


// Activate an event Stream and consume all its events.
describe('runEffects :: Stream a -> Scheduler -> Promise void', function () {

  // newDefaultScheduler :: () -> Scheduler
  const scheduler = newDefaultScheduler()

  it ('runEffect :: Stream * -> Scheduler -> Promise void', function (done) {

    // Create a Stream containing no events and ends immediately.
    const promise = runEffects(empty(), scheduler)
    promise.then(done)
  })
})

describe ('tier 0 - construction', function () {

  const scheduler = newDefaultScheduler()

  // empty, throwError (and similar) are 'considered producer' streams or
  // 'sources', i.e. streams which is actually producing events by
  // scheduling asynchronous tasks with a scheduler.

  // interface Task {
  //   run :: Time -> void
  //   error :: (Time, Error) -> void
  //   dispose :: () -> void
  // }

  // Note: Task is also a Disposable.

  // type Disposable = {
  //   dispose :: () -> void
  // }

  // type Stream a = {
  //   run :: Sink a -> Scheduler -> Disposable
  // }

  // Create a Stream emitting no events and ending immediately.
  it ('empty :: () -> Stream *', function (done) {
    const promise = runEffects(empty(), scheduler)
    promise.then(done)
  })

  // Create a Stream containing no events and never ends.
  // Sort of keep-alive.
  it  ('never :: () -> Stream *', function () {
    // There is nothing much we can do here:
    assert(never())
  })

  // Create a Stream containing a single event at time 0.
  it ('now :: a -> Stream a', async function () {
    const expected = 'hey'
    const actual = await reduce((_, x) => x, null, now(expected))
    assert.strictEqual(actual, expected)
  })

  // Create a Stream containing a single event at a specific time.
  // Note: With default scheduler n denotes milliseconds.
  it ('at :: Time n => n -> a -> Stream a', async function () {
    const expected = 'hey'
    const actual = await reduce((_, x) => x, null, at(5, expected))
    assert.strictEqual(actual, expected)
  })

  // Create an infinite Stream containing events that occur at a specified Period.
  // The first event occurs at time 0, and the event values are undefined.
  // Note: With default scheduler n denotes milliseconds.
  it ('periodic :: periodic :: Period -> Stream undefined', async function () {
    const stream$ = take(5, periodic(1))
    const actual = await reduce(acc => acc + 1, 0, stream$)
    assert.strictEqual(actual, 5)
  })

  // Create a Stream that fails with the provided Error at time 0.
  // This can be useful for functions that need to return a Stream
  // and also need to propagate an error.
  it ('throwError :: Error -> Stream *', function (done) {
    const expected = new Error()
    const promise = runEffects(throwError(expected), scheduler)
    promise.catch(actual => {
      // Leads to test timeout when failing, assertion error is not propagated.
      assert(expected === actual)
      done()
    })
  })
})

describe ('tier 0 - extending', function () {

  // Prepend an event at time 0.
  // Note that startWith does not delay other events.
  // If stream already contains an event at time 0,
  // then startWith simply adds another event at time 0 —
  // the two will be simultaneous, but ordered.
  it ('startWith :: a -> Stream a -> Stream a', async function () {
    const stream$ = startWith(0, now(1))
    const reducer = (acc, x) => acc.concat(x)
    const actual = await reduce(reducer, [], stream$)
    const expected = [0, 1]
    assert.deepStrictEqual(actual, expected)
  })

  // Replace the end of a Stream with another Stream.
  it ('continueWith :: (() -> Stream b) -> Stream a -> Stream (a | b)', async function () {
    const stream$ = continueWith(() => fromArray([2, 3]), fromArray([0, 1]))
    const reducer = (acc, x) => acc.concat(x)
    const actual = await reduce(reducer, [], stream$)
    const expected = [0, 1, 2, 3]
    assert.deepStrictEqual(actual, expected)
  })
})

describe ('tier 1 - composing', function () {

  // compose `endWith` from `continueWith` and `now`.
  it ("endWith' :: b -> Stream a -> Stream (a | b)", async function () {

    const _endWith = (x, stream) => continueWith(() => now(x), stream)
    const endWith = curry2(_endWith)

    const stream$ = endWith(5, fromArray([0, 1]))
    const reducer = (acc, x) => acc.concat(x)
    const actual = await reduce(reducer, [], stream$)
    const expected = [0, 1, 5]
    assert.deepStrictEqual(actual, expected)
  })
})
