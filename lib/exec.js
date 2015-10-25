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
    exec = require('child_process').exec,
    path = require('path');

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}    

//path doesnt handl ~ resolution, fallback to env variables, solution taken from https://github.com/nodejs/node-v0.x-archive/issues/2857
function tilda(cwd) {
  if (cwd.substr(0, 1) === '~') {
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
    
function Exec(cmd, cwd) {
  if (isArray(cmd)) {
    for (var i in cmd) {
      cmd[i] = quote(cmd[i]);
    }
    cmd = cmd.join(' ');
  } else {
    cmd = quote(cmd);
  }
  
  if (cwd) {
    cwd = tilda(cwd);
  }
  
  return Q.promise(function(resolve, reject, notify) {  
    
    var process = (cwd ? exec(cmd, {cwd:cwd}) : exec(cmd)),
        out = '',
        err = '';
        
    setTimeout(function() { notify({start:true, pid:process.pid, cmd:cmd, cwd:cwd}); }, 0);
    
    process.stdout.on('data', function(data) {
      notify({out:data.split('\n'), pid:process.pid});
      out += data;
    });
    
    process.stderr.on('data', function(data) {
      notify({err:data.split('\n'), pid:process.pid});
      err += data;
    });
    
    process.on('error', function(err) {
      notify({err: err, pid: process.pid});
    });
    
    process.on('close', function(code) {
      notify({close:code, pid:process.pid});
      if (code === 0) {
        resolve({'exit-code':code, out: out.split('\n'), err: err.split('\n'), pid: process.pid});
      } else {
        reject({'exit-code':code, out: out.split('\n'), err: err.split('\n'), pid: process.pid});
      }
    });
  });
}

module.exports = Exec;
