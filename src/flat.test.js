import * as R from 'ramda'
import assert from 'assert'
import { now, map } from '@most/core'
import { flat } from './flat.js'
import { reduce } from './reduce.js'

describe ('flat', function () {
  it ('flat :: Stream [a] -> Stream a', async function () {
    const numbers$ = now([1, 3, 2, 6])
    const reducer = ({ count, xs }, x) => ({ count: count + 1, xs: xs.concat(x) })
    const actual = await reduce(reducer, { count: 0, xs: [] }, flat(numbers$))
    const expected = { count: 4, xs: [ 1, 3, 2, 6 ] }
    assert.deepStrictEqual(actual, expected)
  })

  it ('flat :: Stream a -> Stream a', async function () {
    const numbers$ = now(3)
    const reducer = ({ count, xs }, x) => ({ count: count + 1, xs: xs.concat(x) })
    const actual = await reduce(reducer, { count: 0, xs: [] }, flat(numbers$))
    const expected = { count: 1, xs: [ 3 ] }
    assert.deepStrictEqual(actual, expected)
  })

  it ('flatN :: n -> Stream a | [a] -> Stream a', async function () {
    const numbers$ = now([[1, 3, [2, 6]], 8, 2, [3, 8]]) // maximum depth: 3
    const reducer = ({ count, xs }, x) => ({ count: count + 1, xs: xs.concat(x) })

    const flatN = n => Array(n).fill(flat).reduce((f, g) => R.compose(g, f))
    const flat3 = flatN(3)
    const actual = await reduce(reducer, { count: 0, xs: [] }, flat3(numbers$))

    const expected = { count: 8, xs: [1, 3, 2, 6, 8, 2, 3, 8] }
    assert.deepStrictEqual(actual, expected)
  })
})
