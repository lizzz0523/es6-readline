# es6-readline - read a file line by line in es6 async iterator

es6-readline package will return a line by line [async iteractor](https://github.com/tc39/proposal-async-iteration) of the given file path

## Installation
```shell
npm i es6-readline
```

## Usage
```javascript
const readline = require('es6-readline')

(async () => {
    const lines = readline('path/to/file')

    for await (const line of lines) {
        console.log(line)
    }
})()
```
