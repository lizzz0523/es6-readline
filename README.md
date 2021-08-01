# es6-readline

es6-readline package will return a line by line [async iteractor](https://github.com/tc39/proposal-async-iteration) of the given file path

## Installation
```shell
npm i es6-readline
```

## Usage
```javascript
const readline = require('es6-readline')

(async () => {
    // Read a file
    const file_lines = readline('path/to/file')

    for await (const line of file_lines) {
        console.log(line)
    }
    
    // Read a stream
    const stream_lines = readline(process.stdin)

    for await (const line of stream_lines) {
        console.log(line)
    }
})()
```
