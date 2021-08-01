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
