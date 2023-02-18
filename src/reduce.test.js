import assert from 'assert'
import { reduce } from './reduce.js'
import { fromArray } from './sources.js'

describe ('reduce', function () {

  it ('reduce :: Accumulator acc, Event a => (((acc, a) -> acc) -> acc -> Stream a) -> Promise acc', async function () {
    const expected = [1, 2, 3, 4]
    const reducer = (acc, event) => acc.concat(event)
    const actual = await reduce(reducer, [], fromArray(expected))
    assert.deepStrictEqual(actual, expected)
  })

  it ('reduce :: Accumulator acc, Event a => (((acc, a) -> acc) -> acc) -> Stream a -> Promise acc', async function () {
    const expected = [1, 2, 3, 4]
    const reducer = (acc, event) => acc.concat(event)
    const actual = await reduce(reducer, [])(fromArray(expected))
    assert.deepStrictEqual(actual, expected)
  })

  it ('reduce :: Accumulator acc, Event a => ((acc, a) -> acc) -> acc -> Stream a -> Promise acc', async function () {
    const expected = [1, 2, 3, 4]
    const reducer = (acc, event) => acc.concat(event)
    const actual = await reduce(reducer)([])(fromArray(expected))
    assert.deepStrictEqual(actual, expected)
  })
})
