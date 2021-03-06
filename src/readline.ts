import * as fs from 'fs'
import * as readline from 'readline'

if (Symbol['asyncIterator'] === void 0) {
    ((Symbol as any)['asyncIterator']) = Symbol.for('asyncIterator')
}

type Line = string | null

class ReadLine {
    static readonly MAX_LINE_NUM = 1000

    private buffer_: Line[]
    private readIndex_: number
    private writeIndex_: number
    private readline_: readline.ReadLine

    constructor(path: string, encoding: string = 'utf-8') {
        this.buffer_ = []
        this.readIndex_ = 0
        this.writeIndex_ = 0

        this.readline_ = readline.createInterface({
            input: fs.createReadStream(path, { encoding })
        })

        this.readline_.on('line', line => {
            this.buffer_[this.writeIndex_++] = line

            if (this.writeIndex_ > ReadLine.MAX_LINE_NUM) {
                this.readline_.pause()
                this.readline_.emit('readed')
            }
        })

        this.readline_.on('close', () => {
            this.buffer_[this.writeIndex_++] = null
            this.readline_.emit('readed')
        })
    }

    isEmpty_(): boolean {
        return this.readIndex_ === this.writeIndex_
    }

    read_(): Line {
        return this.buffer_[this.readIndex_++]
    }

    next_(): Promise<Line> {
        return Promise.resolve(this.read_())
    }

    more_(): Promise<Line> {
        this.readIndex_ = 0
        this.writeIndex_ = 0

        return new Promise<Line>((resolve, reject) => {
            this.readline_.resume()
            this.readline_.on('readed', () => {
                resolve(this.read_())
            })
        })
    }

    readline(): Promise<Line> {
        if (this.isEmpty_()) {
            return this.more_()
        } else {
            return this.next_()
        }
    }

    async *[Symbol.asyncIterator]() {
        while (true) {
            const line = await this.readline()

            if (line === null) {
                break
            }

            yield line
        }
    }
}

export default (path: string, encoding: string) => {
    return new ReadLine(path, encoding)
}