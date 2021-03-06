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
    util = require('./util');
    
var isString = util.isString,
    isArray = util.isArray,
    quote = util.quote,
    tilda = util.tilda,
    stream = util.stream;

function Exec(cmd, cwd, processCb) {
  if (isArray(cmd)) {
    for (var i in cmd) {
      cmd[i] = quote(cmd[i]);
    }
    cmd = cmd.join(' ');
  } else {
    cmd = quote(cmd);
  }
  
  if (cwd) {
    if (isString(cwd)) {
      cwd = tilda(cwd);
    } else {
      processCb = cwd;
      cwd = null;
    }
  }
  
  var promise;
  function started(data) {
    promise.PID = function() {
      return data.process.pid;
    }
    promise.PROCESS = function() {
      return data.process;
    }
    if (processCb) {
      processCb(data);
    }
  }
  
  promise = Q.promise(function(resolve, reject, notify) {  
    try {
      var process = (cwd ? exec(cmd, {cwd:cwd}) : exec(cmd));
      stream(process, started, resolve, reject, notify, cmd, cwd);
    } catch (err) {
      reject(err);
    }
  });
  
  return promise;
}
    
module.exports = Exec;
