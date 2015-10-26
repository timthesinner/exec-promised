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
    spawn = require('child_process').spawn,
    util = require('./util');
    
var isFunction = util.isFunction,
    isArray = util.isArray,
    quote = util.quote,
    tilda = util.tilda,
    stream = util.stream;

function Spawn(cmd, options, processCb) {
  var args;
  if (isArray(cmd)) {
    args = cmd;
    cmd = args.shift();
  } else {
    args = [];
  }
  
  if (options) {
    if (isFunction(options)) {
      processCb = options;
      options = null;
    } else {
      if (options.cwd) {
        options.cwd = tilda(options.cwd);
      }
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
      var process = (options ? spawn(cmd, args, options) : spawn(cmd, args));
      stream(process, started, resolve, reject, notify, cmd, (options ? options.cwd : null), args);
    } catch(err) {
      reject(err);
    }
  });
  
  return promise;
}
    
module.exports = Spawn;