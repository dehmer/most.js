import { Pipe } from './pipe.js'

// Flatten stream of arrays with depth = 1.

class Flat {
  constructor (stream) {
    this.stream = stream
  }

  run (sink, scheduler) {
    this.stream.run(new FlatSink(sink), scheduler)
  }
}

class FlatSink extends Pipe {
  event (time, xs) {
    if (!Array.isArray(xs)) this.sink.event(time, xs)
    else xs.forEach(x => this.sink.event(time, x))
  }
}

export const flat = stream => new Flat(stream)
export const flatN = n => Array(n).fill(flat).reduce((f, g) => R.compose(g, f))