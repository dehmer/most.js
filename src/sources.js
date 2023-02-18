import { asap } from '@most/scheduler'

// Community contribution fromArray producer stream re-implemented:

// A Stream represents a view of events over time.
// Its run method arranges events to be propagated to
// the provided Sink in the future.

// Alternative: flatten(now(values))

class FromArray {
  constructor (values) {
    this.values = values
  }

  // run :: Sink -> Scheduler -> Disposable
  //
  // run connects a previously unknown Sink to this stream.
  // A pipeline of streams is thus constructed 'backwards':
  // S := (S(n), S(n-1), ..., S(1), P)
  //
  // A producer Stream must never produce an event in the same
  // call stack as its run method is called. It must begin producing
  // items asynchronously. In some cases, this comes for free,
  // such as DOM events. In other cases, it must be done explicitly
  // using the provided Scheduler to schedule asynchronous Tasks.

  run (sink, scheduler) {

    // Schedule single task for execution:
    const task = new ArrayTask(this.values, sink)

    // asap :: Task -> Scheduler -> ScheduledTask
    // Schedule a Task to execute as soon as possible, but still asynchronously.
    // Note: ScheduledTask is also Disposable.
    return asap(task, scheduler)
  }
}

// Task to be scheduled asap with scheduler.
class ArrayTask {
  constructor (values, sink) {
    this.values = values
    this.sink = sink
    this.active = true
  }

  run (time) {
    // I don't think this tight loop can be cancelled in-flight:
    for (let i = 0; i < this.values.length && this.active; i++) {
      // Note: Same time for all events:
      this.sink.event(time, this.values[i])
    }

    // End sink when still active:
    this.active && this.sink.end(time)
  }

  error (time, err) { this.sink.error(time, err) }
  dispose () { this.active = false }
}

export const fromArray = values => new FromArray(values)
