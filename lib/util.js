//Copyright (c) 2015 TimTheSinner All Rights Reserved.
'use strict';

/**
 * Copyright (c) 2015 TimTheSinner All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * @author TimTheSinner
 */
 var Q = require('q'),
    path = require('path');
    
function isString(arg) {
  return (typeof arg === 'string' || arg instanceof String);
}    
    
function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}    

function isFunction(arg) {
  return typeof arg === 'function';
}

//path doesnt handle ~ resolution, fallback to env variables, solution taken from https://github.com/nodejs/node-v0.x-archive/issues/2857
function tilda(cwd) {
  if (cwd.substring(0, 1) === '~') {
    cwd = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || process.cwd()) + cwd.substr(1);
  }
  return path.resolve(cwd);
}

function quote(path) {
  if (path[0] !== '"' && path[0] !== '\'') {
    path = '"' + path;
  }
  if (path[path.length - 1] !== '"' && path[path.length - 1] !== '\'') {
    path = path + '"';
  }
  return path;
}

module.exports.isArray = isArray;
module.exports.isString = isString;
module.exports.isFunction = isFunction;
module.exports.tilda = tilda;
module.exports.quote = quote;

function progress(msg) {
  var lines = msg.out || msg.err || [];
  for (var i in lines) {
    console.log(lines[i]);
  }
}    
module.exports.progress = progress;

function sleep(ms) {
  var term = new Date().getTime() + ms;
  while (new Date().getTime() <= term) { }
}

function streamProcess(child, started, resolve, reject, notify, cmd, cwd, args) {
  var out = '', err = '';
  
  setTimeout(function() { 
    notify({start:true, pid:child.pid, cmd:cmd, cwd:cwd}); 
    
    started({
      process: child,
      close: function() {
        if (child.exitCode === null || child.exitCode === undefined) {
          notify({out:['Closing: ' + child.pid], pid: child.pid});
          if (child) {
            child.stdin.pause();
            if (/^win/.test(process.platform)) {
              var cp = require('child_process');
              cp.exec('taskkill /PID ' + child.pid + ' /T /F', function(error, stdout, stderr) { });
              sleep(500);
            } else {
              process.kill(child.pid, 'SIGTERM');
            }
          }
        }
      }
    });
  }, 0);
  
  child.stdout.on('data', function(data) {
    if (! data.split) {
      data = data.toString('utf8');
    }
    notify({out:data.split('\n'), pid:child.pid});
    out += data;
  });
  
  child.stderr.on('data', function(data) {
    if (! data.split) {
      data = data.toString('utf8');
    }
    notify({err:data.split('\n'), pid:child.pid});
    err += data;
  });
  
  child.on('error', function(err) {
    notify({err: err, pid: child.pid});
  });
  
  child.on('close', function(code) {
    notify({close:code, pid:child.pid});
    if (code === 0) {
      resolve({'exit-code':code, out: out.split('\n'), err: err.split('\n'), pid: child.pid});
    } else {
      reject({'exit-code':code, out: out.split('\n'), err: err.split('\n'), pid: child.pid});
    }
  });
}
module.exports.stream = streamProcess;
