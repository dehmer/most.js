import assert from 'assert'
import * as M from '@most/core'
import { reduce } from './reduce.js'
import { pipe } from './pipe.js'


it.only ('batch :: ...', async function () {

  const events = [
    { type: 'put', key: 'A', value: 10 },
    { type: 'put', key: 'A', value: 20 },
    { type: 'put', key: 'A', value: 30 },
    { type: 'put', key: 'B', value: 20 },
    { type: 'put', key: 'B', value: 30 },
    { type: 'del', key: 'A' },
    { type: 'put', key: 'B', value: 40 },
    { type: 'put', key: 'B', value: 50 },
    { type: 'put', key: 'A', value: 30 },
    { type: 'put', key: 'A', value: 20 },
    { type: 'put', key: 'A', value: 30 },
    { type: 'put', key: 'C', value: 10 }
  ]

  let eventIndex = 0
  const event = () => events[eventIndex++]

  const events$ = pipe([
    M.take(12),
    M.map(() => event())
  ])((M.periodic(1)))

  const batchClock$ = pipe([
    M.take(4),
    M.constant('TICK')
  ])(M.periodic(5))

  const merged$ = pipe([
    M.loop((acc, event) => {
      if (event === 'TICK') return { seed: [], value: acc.length ? acc : null }
      else return { seed: acc.concat(event), value: null }
    }, []),
    M.filter(event => event !== null)
  ])(M.merge(batchClock$, events$))

  // const actual = await reduce((acc, event) => acc.concat(event), [], events$)
  const actual = await reduce((acc, event) => acc.concat([event]), [], merged$)
  console.log('actual', actual)
  // console.log('actual', JSON.stringify(actual, null, 2))
})
