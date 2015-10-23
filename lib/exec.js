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
    exec = require('child_process').exec;

function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}    
    
function Exec(cmd, cwd) {
  if (isArray(cmd)) {
    cmd = cmd.join(' ');
  }
  
  return Q.promise(function(resolve, reject, notify) {  
    var process = (cwd ? exec(cmd, {cwd:cwd}) : exec(cmd)),
        out = '',
        err = '';
    
    setTimeout(function() { notify({start:true, pid:process.pid}); }, 0);
    
    process.stdout.on('data', function(data) {
      notify({out:data, pid:process.pid});
      out += data;
    });
    
    process.stderr.on('data', function(data) {
      notify({err:data, pid:process.pid});
      err += data;
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
