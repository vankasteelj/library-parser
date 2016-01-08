var debug, self,
    Filewalker = require('filewalker'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    Path = require('path'),
    fs = require('fs'),

    video = {
        all: '3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|h265|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|x265|xvid',
        commons: 'avi|divx|dv|flv|m2ts|m4v|mkv|mov|mp4|mpeg|mpg|off|wmv|xvid'
    },
    audio = {
        all: 'aa|aac|aax|act|aiff|ape|au|flac|dvf|gsm|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|tta|wav|wma|wv|webm',
        commons: 'aiff|ape|flac|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|wav|wma|webm'
    };

/*
 * Init
 */
var LibraryParser = module.exports = function (opts, dbug) {
    if (!opts) throw new Error('Missing required args');

    this.options = {
        paths: opts.paths || opts,
        types: opts.types || ['audio', 'video'],
        formats: opts.formats || 'commons'
    };

    debug = function () {
        if (dbug) {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }
    };

    self = this;
};

/*
 * Scan
 */
LibraryParser.prototype.scan = function () {
    debug('looking for %s', this.options.types.join('/'));
    return Promise.all(this.options.paths.map(walker))
        .then(_.flatten)
        .bind(this);
};

/*
 * Update
 */
LibraryParser.prototype.update = function (orig) {
    debug('updating db with %s entries', orig.length);
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

// removes inexistant files from db
var outdated = function (files) {
    return Promise.all(files)
        .then(function (files) {
            return files.filter(function (f) {
                return fs.existsSync(f.path);
            })
        });
};

// only keep newly added entries
var unique = function (entry, orig) {
    var dupe = _.find(orig, function (c) {
        return c.path === entry.path;
    })
    return !dupe;
};

/*
 * Scanner
 */
var walker = function (path) {
    return new Promise(function (resolve, reject) {
        var files = [];
        var walkeropts = {
            maxAttemps: 2,
            matchRegExp: accept(self.options.types)
        };

        Filewalker(path, walkeropts)
            .on('file', function (file, props) {
                if (props.size > 100000) {
                    debug('file parsed');
                    files.push({
                        file: file,
                        size: props.size,
                        type: filetype(Path.extname(file), self.options.types)
                    });
                }
            })
            .on('done', function () {
                debug('found %s item(s) in %s', files.length, path);
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
                // ignore EPERM, EBUSY, ENOENT
                if (err.errno) {
                    debug(err);
                    return;
                }
                reject(err);
            })
            .walk();
    });
};

// determine the file type
var filetype = function (ext, types) {
    var v = new RegExp(video['all']);
    var a = new RegExp(audio['all']);

    if (ext && ext.match(a)) return 'audio';
    if (ext && ext.match(v)) return 'video';
    return null;
};

// regex for walker
var accept = function (types) {
    var regxp = '\\.(?:';
    if (self.options.formats.match(/all|commons/)) {
        if (types.indexOf('audio') !== -1) regxp += audio[self.options.formats];
        if (types.indexOf('video') !== -1) regxp += (regxp.length === 5 ? '' : '|') + video[self.options.formats];
    } else {
        regxp += self.options.formats;
    }

    return new RegExp(regxp += ')$', 'i');
};