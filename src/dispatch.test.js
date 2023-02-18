import assert from 'assert'
import * as R from 'ramda'
import { fromArray } from 'most-from-array'
import { loop, map, filter, join, merge, multicast } from '@most/core'
import { dispatch } from './dispatch/index.js'
import { reduce } from './reduce.js'
import { pipe } from './pipe.js'


describe ('dispatch', function () {
  const key = n => n % 2 === 0 ? 'EVEN' : 'ODD'
  const input$ = fromArray([1, 3, 2, 8, 1, 4, 7, 6, 4])
  const reducer = (acc, event) => acc.concat([event])

  it ('dispatch :: Event a -> [a, key(a) -> Stream a]', async function () {

    const pipeline = pipe([
      dispatch(key),
      loop(({ index, partitions }, [n, select]) => {
        // Stream for key already known?
        if (partitions[key(n)]) {
          return { seed: { partitions, index: index + 1}, value: null }
        } else {
          // Setup new stream:
          const pipeline = pipe([
            map(n => [n, key(n)])
          ])

          const stream = pipeline(select(key(n)))
          partitions[key(n)] = stream
          return { seed: { partitions, index: index + 1 }, value: stream }
        }
      }, { index: 0, partitions: {} }),
      filter(R.identity),

      // join :: Stream (Stream a) -> Stream a
      // flatten stream of steams
      join,
      reduce(reducer, [])
    ])

    const actual = await pipeline(input$)
    const expected = [
      [ 1, 'ODD' ],  [ 3, 'ODD' ],  [ 2, 'EVEN' ],
      [ 8, 'EVEN' ], [ 1, 'ODD' ],  [ 4, 'EVEN' ],
      [ 7, 'ODD' ],  [ 6, 'EVEN' ], [ 4, 'EVEN' ]
    ]

    assert.deepStrictEqual(actual, expected)
  })

  it ('dispatch.select :: Key k => Stream a', async function () {
    const key = n => n % 2 === 0 ? 'EVEN' : 'ODD'
    const input$ = fromArray([1, 3, 2, 8, 1, 4, 7, 6, 4])
    const dispatch$ = dispatch(key)(input$)
    const odd$ = map(n => ({ odd: n }), dispatch$.select('ODD'))
    const even$ = map(n => ({ even: n }), dispatch$.select('EVEN'))
    const merge$ = merge(odd$, even$)
    const actual = await reduce(reducer, [], merge$)

    const expected = [
      { odd: 1 },  { odd: 3 },  { even: 2 },
      { even: 8 }, { odd: 1 },  { even: 4 },
      { odd: 7 },  { even: 6 }, { even: 4 }
    ]

    assert.deepStrictEqual(actual, expected)
  })

  it ('multicast :: Stream a -> Stream a', async function () {
    const key = n => n % 2 === 0 ? 'EVEN' : 'ODD'
    const input$ = fromArray([1, 3, 2, 8, 1, 4, 7, 6, 4])
    const multicast$ = multicast(input$)
    const odd$ = map(n => ({ odd: n }), filter(n => key(n) === 'ODD', multicast$))
    const even$ = map(n => ({ even: n }), filter(n => key(n) === 'EVEN', multicast$))
    const merge$ = merge(odd$, even$)
    const actual = await reduce(reducer, [], merge$)

    const expected = [
      { odd: 1 },  { odd: 3 },  { even: 2 },
      { even: 8 }, { odd: 1 },  { even: 4 },
      { odd: 7 },  { even: 6 }, { even: 4 }
    ]

    assert.deepStrictEqual(actual, expected)
  })
})