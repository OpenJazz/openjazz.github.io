
  var Module = typeof Module != 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = 'shareware.data';
      var REMOTE_PACKAGE_BASE = 'shareware.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus'](`Downloading data... (${loaded}/${total})`);
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "data", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_shareware.data');

      };
      Module['addRunDependency']('datafile_shareware.data');

      if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/data/BLOCKS.000", "start": 0, "end": 143876}, {"filename": "/data/BLOCKS.001", "start": 143876, "end": 240265}, {"filename": "/data/BLOCKS.002", "start": 240265, "end": 341572}, {"filename": "/data/BONUS.000", "start": 341572, "end": 502594}, {"filename": "/data/BONUS.0SC", "start": 502594, "end": 554426}, {"filename": "/data/BONUS.PSM", "start": 554426, "end": 652434}, {"filename": "/data/BONUSMAP.000", "start": 652434, "end": 658889}, {"filename": "/data/BONUSMAP.001", "start": 658889, "end": 667716}, {"filename": "/data/BONUSMAP.002", "start": 667716, "end": 674088}, {"filename": "/data/BONUSY.000", "start": 674088, "end": 743018}, {"filename": "/data/BOSS.PSM", "start": 743018, "end": 835492}, {"filename": "/data/CHEAT.0SC", "start": 835492, "end": 856061}, {"filename": "/data/CONTINUE.0SC", "start": 856061, "end": 913670}, {"filename": "/data/END.0SC", "start": 913670, "end": 930725}, {"filename": "/data/ENDE1.0SC", "start": 930725, "end": 983585}, {"filename": "/data/ENDING.000", "start": 983585, "end": 987585}, {"filename": "/data/ENDLEVEL.0SC", "start": 987585, "end": 1002416}, {"filename": "/data/ENDLEVEL.PSM", "start": 1002416, "end": 1061300}, {"filename": "/data/FONT2.0FN", "start": 1061300, "end": 1065119}, {"filename": "/data/FONTBIG.0FN", "start": 1065119, "end": 1071582}, {"filename": "/data/FONTINY.0FN", "start": 1071582, "end": 1074921}, {"filename": "/data/FONTMN1.0FN", "start": 1074921, "end": 1083903}, {"filename": "/data/FONTMN2.0FN", "start": 1083903, "end": 1090692}, {"filename": "/data/FONTS.000", "start": 1090692, "end": 1105234}, {"filename": "/data/INSTRUCT.0SC", "start": 1105234, "end": 1250301}, {"filename": "/data/LEVEL0.000", "start": 1250301, "end": 1270691}, {"filename": "/data/LEVEL0.001", "start": 1270691, "end": 1306925}, {"filename": "/data/LEVEL0.002", "start": 1306925, "end": 1327567}, {"filename": "/data/LEVEL0.018", "start": 1327567, "end": 1364511}, {"filename": "/data/LEVEL1.000", "start": 1364511, "end": 1392307}, {"filename": "/data/LEVEL1.001", "start": 1392307, "end": 1428640}, {"filename": "/data/LEVEL1.002", "start": 1428640, "end": 1451743}, {"filename": "/data/LEVEL2.000", "start": 1451743, "end": 1465140}, {"filename": "/data/MACRO.1", "start": 1465140, "end": 1466172}, {"filename": "/data/MACRO.2", "start": 1466172, "end": 1467204}, {"filename": "/data/MACRO.3", "start": 1467204, "end": 1468236}, {"filename": "/data/MACRO.4", "start": 1468236, "end": 1469268}, {"filename": "/data/MAINCHAR.000", "start": 1469268, "end": 1625549}, {"filename": "/data/MENU.000", "start": 1625549, "end": 1749855}, {"filename": "/data/MENUSNG.PSM", "start": 1749855, "end": 1829464}, {"filename": "/data/ORDER.0SC", "start": 1829464, "end": 2050942}, {"filename": "/data/PANEL.000", "start": 2050942, "end": 2064333}, {"filename": "/data/PLANET.000", "start": 2064333, "end": 2068633}, {"filename": "/data/PLANET.001", "start": 2068633, "end": 2072935}, {"filename": "/data/PLANET.002", "start": 2072935, "end": 2077232}, {"filename": "/data/PLANET.018", "start": 2077232, "end": 2081531}, {"filename": "/data/SONG0.PSM", "start": 2081531, "end": 2162411}, {"filename": "/data/SONG17.PSM", "start": 2162411, "end": 2282354}, {"filename": "/data/SONG3.PSM", "start": 2282354, "end": 2385697}, {"filename": "/data/SOUNDS.000", "start": 2385697, "end": 2516300}, {"filename": "/data/SPRITES.000", "start": 2516300, "end": 2549734}, {"filename": "/data/SPRITES.001", "start": 2549734, "end": 2560387}, {"filename": "/data/SPRITES.002", "start": 2560387, "end": 2576592}, {"filename": "/data/SPRITES.018", "start": 2576592, "end": 2607606}, {"filename": "/data/STARTUP.0SC", "start": 2607606, "end": 2730966}], "remote_package_size": 2730966});

  })();
