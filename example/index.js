const readline = require('../index')

(async () => {
    const lines = readline('./test')

    for await (const line of lines) {
        console.log(line)
    }
})()