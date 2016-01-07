var debug, self,
    Filewalker = require('filewalker'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    Path = require('path'),
    fs = require('fs'),

    video = '3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|xvid',
    audio = 'wav|mp3|wma|flac|ape|aac|m4a|ogg';

/*
 * Init
 */
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
                debug('file parsed');
                var type = filetype(Path.extname(file), self.options.types);
                files.push({
                    file: file,
                    size: props.size,
                    type: type
                });
            })
            .on('done', function () {
                debug('found %s item(s)', files.length);
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

// determine the file type
var filetype = function (ext, types) {
    var v = new RegExp(video);
    var a = new RegExp(audio);

    if (ext && ext.match(a)) return 'audio';
    if (ext && ext.match(v)) return 'video';
    return null;
};

// regex for walker
var accept = function (types) {
    var regxp = '\\.(?:';
    if (types.indexOf('audio') !== -1) regxp += audio;
    if (types.indexOf('video') !== -1) regxp += (regxp.length === 5 ? '' : '|') + video;
    console.log(regxp)
    return new RegExp(regxp += ')$', 'i');
};