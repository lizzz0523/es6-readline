import test, * as ava from 'ava'
import {Readable} from 'stream'

import readline, {MAX_LINE_NUM} from '../src/readline'

// Helper function to produce a stream of lines
function stream(count: number, eol='\n'): Readable {
    return Readable.from(function*() {
        for (let i = 0; i < count; i++) {
            yield i+eol
        }
    }())
}

// Helper function to make sure we read a stream completely and in order
async function verifyReadsStream(t: ava.ExecutionContext, count: number, rl: AsyncIterable<string>) {
    let i = 0
    for await (const line of rl) {
        t.is(line, i.toString())
        i++
    }
    t.is(i, count)
}

for (const count of [MAX_LINE_NUM, MAX_LINE_NUM-1, MAX_LINE_NUM+1, MAX_LINE_NUM*2, MAX_LINE_NUM*2-1, MAX_LINE_NUM*2+1]) {
    // Test with various line counts around the batch boundary
    test(`reads ${count} lines`, async t => {
        await verifyReadsStream(t, count, readline(stream(count)))
    })
}

test(`reads a file with CRLF line endings`, async t => {
    await verifyReadsStream(t, 10, readline(stream(10, '\r\n')))
})

test(`reads a file after pausing`, async t => {
	const rl = readline(stream(10))
	// Pause briefly after constructing, to give timeouts a chance to fire
	// This catches the case where we forget to handle reading the buffer immediately after constructing,
	// by giving the readline a chance to drain its events into the void if we don't run `.on('line')`
	await new Promise(resolve => setTimeout(resolve, 1))
	// Make sure that everything is still there
	await verifyReadsStream(t, 10, rl)
})

// Helper to map `fn` over each number in 0..count
function eachRange<T>(count: number, fn: (i: number) => T) {
    const ret = []
    for (let i = 0; i < count; i++) {
        ret.push(fn(i))
    }
    return ret
}

// Helper to create an array from an async iterable
async function iterToArray<T>(iter: AsyncIterable<T>) {
    const ret: T[] = []
    for await (const item of iter) {
        ret.push(item)
    }
    return ret
}

test(`reads many lines in parallel`, async t => {
    const count = MAX_LINE_NUM*3+1
    const rl = readline(stream(count))
    const lines = await Promise.all(eachRange(count, () => rl.readline()))
    t.deepEqual(lines, eachRange(count, i => i.toString()))
})

test(`reads many lines in parallel, with separate batches`, async t => {
    const count = MAX_LINE_NUM+2
    const rl = readline(stream(count))
    // Discard first batch
    await Promise.all(eachRange(MAX_LINE_NUM, () => rl.readline()))
    // Trigger a read of the next batch
    const line1promise = rl.readline()
    // Try to get the line after that
    const line2promise = rl.readline()
    // Read the rest of the file
    const restLines = iterToArray(rl)
    // Make sure the lines came out in the right order
    t.is(await line1promise, (MAX_LINE_NUM+0).toString())
    t.is(await line2promise, (MAX_LINE_NUM+1).toString())
    t.deepEqual(await restLines, [])
})
