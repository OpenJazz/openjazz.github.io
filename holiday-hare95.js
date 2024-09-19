
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
      var PACKAGE_NAME = 'holiday-hare95.data';
      var REMOTE_PACKAGE_BASE = 'holiday-hare95.data';
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
          }          Module['removeRunDependency']('datafile_holiday-hare95.data');

      };
      Module['addRunDependency']('datafile_holiday-hare95.data');

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
    loadPackage({"files": [{"filename": "/data/BLOCKS.050", "start": 0, "end": 113568}, {"filename": "/data/BLOCKS.051", "start": 113568, "end": 239837}, {"filename": "/data/BONUS.0SC", "start": 239837, "end": 291669}, {"filename": "/data/CHEAT.0SC", "start": 291669, "end": 312238}, {"filename": "/data/CONTINUE.0SC", "start": 312238, "end": 369847}, {"filename": "/data/END.0SC", "start": 369847, "end": 373054}, {"filename": "/data/ENDEX.0SC", "start": 373054, "end": 457869}, {"filename": "/data/ENDING.000", "start": 457869, "end": 461869}, {"filename": "/data/ENDLEVEL.PSM", "start": 461869, "end": 520753}, {"filename": "/data/FONT2.0FN", "start": 520753, "end": 524572}, {"filename": "/data/FONTBIG.0FN", "start": 524572, "end": 531035}, {"filename": "/data/FONTINY.0FN", "start": 531035, "end": 534374}, {"filename": "/data/FONTMN1.0FN", "start": 534374, "end": 543356}, {"filename": "/data/FONTMN2.0FN", "start": 543356, "end": 550145}, {"filename": "/data/FONTS.000", "start": 550145, "end": 564687}, {"filename": "/data/INSTRUCT.0SC", "start": 564687, "end": 709754}, {"filename": "/data/LEVEL0.050", "start": 709754, "end": 753832}, {"filename": "/data/LEVEL0.051", "start": 753832, "end": 788218}, {"filename": "/data/LEVEL1.050", "start": 788218, "end": 820642}, {"filename": "/data/LEVEL1.051", "start": 820642, "end": 844301}, {"filename": "/data/LEVEL2.050", "start": 844301, "end": 867376}, {"filename": "/data/MAINCHAR.000", "start": 867376, "end": 890578}, {"filename": "/data/MENU.000", "start": 890578, "end": 1111087}, {"filename": "/data/MENUSNG.PSM", "start": 1111087, "end": 1190696}, {"filename": "/data/ORDER.0SC", "start": 1190696, "end": 1251356}, {"filename": "/data/PANEL.000", "start": 1251356, "end": 1264747}, {"filename": "/data/PLANET.050", "start": 1264747, "end": 1269047}, {"filename": "/data/PLANET.051", "start": 1269047, "end": 1273347}, {"filename": "/data/SOUNDS.000", "start": 1273347, "end": 1403950}, {"filename": "/data/SOUNDS.001", "start": 1403950, "end": 1404354}, {"filename": "/data/SOUNDS.006", "start": 1404354, "end": 1404758}, {"filename": "/data/SOUNDS.007", "start": 1404758, "end": 1405162}, {"filename": "/data/SOUNDS.008", "start": 1405162, "end": 1405566}, {"filename": "/data/SOUNDS.009", "start": 1405566, "end": 1405970}, {"filename": "/data/SPRITES.000", "start": 1405970, "end": 1439404}, {"filename": "/data/SPRITES.050", "start": 1439404, "end": 1633180}, {"filename": "/data/SPRITES.051", "start": 1633180, "end": 1846651}, {"filename": "/data/STARTUP.0SC", "start": 1846651, "end": 1939305}, {"filename": "/data/XM3.PSM", "start": 1939305, "end": 2025826}, {"filename": "/data/XMAS2.PSM", "start": 2025826, "end": 2162675}, {"filename": "/data/XMAS3.PSM", "start": 2162675, "end": 2344325}], "remote_package_size": 2344325});

  })();
