"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
if (Symbol['asyncIterator'] === void 0) {
    (Symbol['asyncIterator']) = Symbol.for('asyncIterator');
}
class ReadLine {
    constructor(path, encoding = 'utf-8') {
        this.buffer_ = [];
        this.readIndex_ = 0;
        this.writeIndex_ = 0;
        this.readline_ = readline.createInterface({
            input: fs.createReadStream(path, { encoding })
        });
        this.readline_.on('line', line => {
            this.buffer_[this.writeIndex_++] = line;
            if (this.writeIndex_ > ReadLine.MAX_LINE_NUM) {
                this.readline_.pause();
                this.readline_.emit('readed');
            }
        });
        this.readline_.on('close', () => {
            this.buffer_[this.writeIndex_++] = null;
            this.readline_.emit('readed');
        });
    }
    isEmpty_() {
        return this.readIndex_ === this.writeIndex_;
    }
    read_() {
        return this.buffer_[this.readIndex_++];
    }
    next_() {
        return Promise.resolve(this.read_());
    }
    more_() {
        this.readIndex_ = 0;
        this.writeIndex_ = 0;
        return new Promise((resolve, reject) => {
            this.readline_.resume();
            this.readline_.on('readed', () => {
                resolve(this.read_());
            });
        });
    }
    readline() {
        if (this.isEmpty_()) {
            return this.more_();
        }
        else {
            return this.next_();
        }
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            while (true) {
                const line = yield __await(this.readline());
                if (line === null) {
                    break;
                }
                yield line;
            }
        });
    }
}
ReadLine.MAX_LINE_NUM = 1000;
exports.default = (path, encoding) => {
    return new ReadLine(path, encoding);
};
