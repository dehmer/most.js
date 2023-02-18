import { newDefaultScheduler } from '@most/scheduler'
import { run } from '@most/core'
import { curry3 } from '@most/prelude'

/**
 * reduce :: Accumulator acc, Event a => (((acc, a) -> acc) -> acc -> Stream a) -> Promise acc
 * reduce :: Accumulator acc, Event a => (((acc, a) -> acc) -> acc) -> Stream a -> Promise acc
 * reduce :: Accumulator acc, Event a => ((acc, a) -> acc) -> acc -> Stream a -> Promise acc
 *
 * @param reducer :: (acc, a) -> acc
 * @param initial :: acc
 * @param stream :: Stream a
 * @returns Promise acc
 *
 * Reduce all events to final aggregate.
 * Type: Terminator.
 * Application: Useful for testing.
 */

const _reduce = (reducer, initial, stream) =>
  new Promise((resolve, reject) => {
    const sink = new ReduceSink(reducer, initial, resolve, reject)
    run(sink, newDefaultScheduler(), stream)
  })

class ReduceSink {
  constructor (reducer, initial, resolve, reject) {
    this.reducer = reducer
    this.acc = initial
    this.resolve = resolve
    this.reject = reject
  }

  event(time, event) { this.acc = this.reducer(this.acc, event) }
  error(time, err) { this.reject(err) }
  end(time) { this.resolve(this.acc) }
}

export const reduce = curry3(_reduce)
export const reduceArray = reduce((acc, x) => acc.concat(x), [])