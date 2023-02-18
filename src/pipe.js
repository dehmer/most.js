export const pipe = ops => stream => ops.reduce((acc, op) => op(acc), stream)

export class Pipe {
  constructor (sink) { this.sink = sink }
  event(time, event) { this.sink.event(time, event) }
  end (time) { this.sink.end(time) }
  error (time, err) { this.sink.end(time, err) }
}
