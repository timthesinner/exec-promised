# exec-promised
Handle program execution from the promise framework in a clean way.
- Stream sysout/err through notifications instead of waiting.
- Resolve or fail the promise using the program exit code.
- Command arguments are automatically quoted.

## Getting Started

```shell
npm install exec-promised --save
```

## Example streaming output from 'ls'
```js
var exec = require('exec-promised');
var progress = require('exec-promised').progress;

exec(['ls', '-al'], '~').progress(progress).fail(function (err) {
  throw err;
});
```

## Example spawn mongodb with process cleanup
```js
var path = require('path');
var spawn = require('exec-promised').spawn;
var progress = require('exec-promised').progress;

function cleanupMongo(data) {
  //Bit of handwaving here, on Windows usually need to hack to handle SIGINT gracefully.
  // Take a look at: http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js
  process.on('SIGINT', function() {
    data.close();
    process.stdout.write('');
  });
}

spawn([
  path.resolve(path.join('/', 'Program Files', 'MongoDB', 'Server', '3.0', 'bin', 'mongod.exe')),
  '--httpinterface',
], cleanupMongo).progress(progress).then(function (res) {
  console.log(res);
}).fail(function (err) {
  throw err;
});
```