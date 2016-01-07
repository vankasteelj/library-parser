var debug, self, Filewalker = require('filewalker'), Promise = require('bluebird'), _ = require('lodash'), Path = require('path'), fs = require('fs'), assign = require('object-assign');

var LibraryParser = module.exports = function (opts, dbug) {
    if (!opts) throw new Error('Missing required args');

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
    debug('looking for %s', this.options.types.join('/'));
    return Promise.all(this.options.paths.map(walker))
        .then(_.flatten)
        .bind(this);
};

LibraryParser.prototype.update = function (orig) {
    debug('updating db');
    return Promise.all(this.options.paths.map(walker))
        .then(_.flatten)
        .filter(function (entry) {
            return unique(entry, orig);
        }).each(function (newEntry) {
            orig = orig.concat(newEntry);
        }).then(function () {
            return outdated(orig);
        }).bind(this);
};

var outdated= function (files) {
    return new Promise(function (resolve, reject) {
        Promise.all(files)
            .filter(function (f) {
                return exists(f);
            }).then(resolve);
    });
};

var exists = function (file) {
    return fs.existsSync(file.path);
};

var unique = function (entry, orig) {
    var dupe = _.find(orig, function (c) {
        return c.path === entry.path;
    })
    return !dupe;
};

var walker = function (path) {
    return new Promise(function (resolve, reject) {
        var files = [];
        Filewalker(path)
            .on('file', function (file, props) {
                debug('file parsed');
                var type = filetype(Path.extname(file), self.options.types);
                if (type) {
                    files.push({
                        file: file, 
                        size: props.size,
                        type: type
                    });
                }
            })
            .on('done', function () {
                debug('found %s items in %s dirs', this.files, this.dirs);
                resolve(files.map(function (f) {
                    return {
                        filename: Path.basename(f.file),
                        path: Path.join(path, f.file),
                        size: f.size,
                        type: f.type
                    };
                }));
            })
            .on('error', function (err) {
                // ignore EPERM and EBUSY
                if (err.errno == -4082 || err.errno == -4048) return;
                reject(err);
            })
            .walk();
    });
};

var filetype = function (ext, types) {
    var video = new RegExp(/3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|xvid/);
    var audio = new RegExp(/wav|mp3|wma|flac|ape|aac|m4a|ogg/);

    if (!ext) return false;
    if (ext.match(audio) && types.indexOf('audio') !== -1) return 'audio';
    if (ext.match(video) && types.indexOf('video') !== -1) return 'video';
    return false;
};