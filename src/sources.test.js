import assert from 'assert'
import { now } from '@most/core'
import { fromArray } from './sources.js'
import { flat } from './flat.js'
import { reduceArray } from './reduce.js'

describe('sources', function () {

  it ('fromArray :: [a] -> Stream a', async function () {
    const expected = [1, 2, 3, 4]
    const numbers$ = fromArray(expected)
    const actual = await reduceArray(numbers$)
    assert.deepStrictEqual(actual, expected)
  })

  // Alternative: flatten(now([a]))
  it ("fromArray' :: [a] -> Stream a", async function () {
    const expected = [1, 2, 3, 4]
    const numbers$ = flat(now(expected))
    const actual = await reduceArray(numbers$)
    assert.deepStrictEqual(actual, expected)
  })
})
