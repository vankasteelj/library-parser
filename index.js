var debug, self, Filewalker = require('filewalker'), Promise = require('bluebird'), _ = require('lodash'), Path = require('path'), Utils = require('./lib/utils');

var LibraryParser = module.exports = function (opts, dbug) {
    if (!opts) {
        throw new Error('Missing require args');
    }

    this.options = {
        paths: opts.paths || opts,
        types: opts.types || ['audio', 'video']
    };

    debug = function () {
        if (dbug) {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }
    };

    self = this;
};

LibraryParser.prototype.scan = function () {
    debug('starting scan');
    return Promise.all(this.options.paths.map(walker))
        .then(_.flatten)
        .bind(this);
};

var walker = function (path) {
    return new Promise(function (resolve, reject) {
        var files = [];
        Filewalker(path)
            .on('file', function (file, props) {
                var type = Utils.filetype(Path.extname(file), self.options.types);
                if (type) {
                    files.push({
                        file: file, 
                        size: props.size,
                        type: type
                    });
                }
            })
            .on('done', function () {
                resolve(files.map(function (f) {
                    return {
                        name: Path.basename(f.file),
                        path: Path.join(path, f.file),
                        size: f.size,
                        type: f.type
                    };
                }));
            })
            .on('error', function (err) {
                reject(err);
            })
            .walk();
    });
};