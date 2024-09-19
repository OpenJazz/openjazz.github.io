
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
      var PACKAGE_NAME = 'holiday-hare.data';
      var REMOTE_PACKAGE_BASE = 'holiday-hare.data';
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
          }          Module['removeRunDependency']('datafile_holiday-hare.data');

      };
      Module['addRunDependency']('datafile_holiday-hare.data');

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
    loadPackage({"files": [{"filename": "/data/BLOCKS.050", "start": 0, "end": 96581}, {"filename": "/data/BLOCKS.051", "start": 96581, "end": 193161}, {"filename": "/data/BLOCKS.052", "start": 193161, "end": 289993}, {"filename": "/data/BONUS.000", "start": 289993, "end": 451015}, {"filename": "/data/BONUS.0SC", "start": 451015, "end": 502847}, {"filename": "/data/BONUS.PSM", "start": 502847, "end": 543607}, {"filename": "/data/BONUSMAP.027", "start": 543607, "end": 549252}, {"filename": "/data/BONUSMAP.028", "start": 549252, "end": 555069}, {"filename": "/data/BONUSMAP.029", "start": 555069, "end": 560593}, {"filename": "/data/CDBONUS1.000", "start": 560593, "end": 611397}, {"filename": "/data/CHEAT.0SC", "start": 611397, "end": 631966}, {"filename": "/data/CONTINUE.0SC", "start": 631966, "end": 689575}, {"filename": "/data/END.0SC", "start": 689575, "end": 692782}, {"filename": "/data/ENDEX.0SC", "start": 692782, "end": 914444}, {"filename": "/data/ENDING.000", "start": 914444, "end": 918444}, {"filename": "/data/ENDLEVEL.PSM", "start": 918444, "end": 977328}, {"filename": "/data/FONT2.0FN", "start": 977328, "end": 981147}, {"filename": "/data/FONTBIG.0FN", "start": 981147, "end": 987610}, {"filename": "/data/FONTINY.0FN", "start": 987610, "end": 990949}, {"filename": "/data/FONTMN1.0FN", "start": 990949, "end": 999931}, {"filename": "/data/FONTMN2.0FN", "start": 999931, "end": 1006720}, {"filename": "/data/FONTS.000", "start": 1006720, "end": 1021262}, {"filename": "/data/INSTRUCT.0SC", "start": 1021262, "end": 1166329}, {"filename": "/data/LEVEL0.050", "start": 1166329, "end": 1203547}, {"filename": "/data/LEVEL0.051", "start": 1203547, "end": 1240618}, {"filename": "/data/LEVEL0.052", "start": 1240618, "end": 1278217}, {"filename": "/data/LEVEL1.050", "start": 1278217, "end": 1314994}, {"filename": "/data/MAINCHAR.000", "start": 1314994, "end": 1471508}, {"filename": "/data/MENU.000", "start": 1471508, "end": 1692017}, {"filename": "/data/MENUSNG.PSM", "start": 1692017, "end": 1771626}, {"filename": "/data/ORDER.0SC", "start": 1771626, "end": 1975354}, {"filename": "/data/PANEL.000", "start": 1975354, "end": 1988745}, {"filename": "/data/PLANET.050", "start": 1988745, "end": 1993045}, {"filename": "/data/PLANET.051", "start": 1993045, "end": 1997345}, {"filename": "/data/PLANET.052", "start": 1997345, "end": 2001645}, {"filename": "/data/SETUP.INT", "start": 2001645, "end": 2004557}, {"filename": "/data/SOUNDS.000", "start": 2004557, "end": 2135160}, {"filename": "/data/SOUNDS.009", "start": 2135160, "end": 2135564}, {"filename": "/data/SPRITES.050", "start": 2135564, "end": 2203338}, {"filename": "/data/SPRITES.051", "start": 2203338, "end": 2219991}, {"filename": "/data/SPRITES.052", "start": 2219991, "end": 2234977}, {"filename": "/data/STARTUP.0SC", "start": 2234977, "end": 2358337}, {"filename": "/data/XM2.PSM", "start": 2358337, "end": 2498900}, {"filename": "/data/XM3.PSM", "start": 2498900, "end": 2585421}], "remote_package_size": 2585421});

  })();
