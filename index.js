'use strict'

const Filewalker = require('filewalker')
const _ = require('lodash')
const Path = require('path')
const fs = require('fs')

let video = {
    all: '3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|h265|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|x265|xvid',
    commons: 'avi|divx|dv|flv|m2ts|m4v|mkv|mov|mp4|mpeg|mpg|off|wmv|xvid'
}
let audio = {
    all: 'aa|aac|aax|act|aiff|ape|au|flac|dvf|gsm|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|tta|wav|wma|wv|webm',
    commons: 'aiff|ape|flac|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|wav|wma|webm'
}

module.exports = class LibraryParser {
    constructor(opts, debug) {
        if (!opts || !opts.paths) throw new Error('Missing at least one path')

        this.options = {
            paths: opts.paths || opts,
            types: opts.types || ['audio', 'video'],
            formats: opts.formats || 'commons',
            throttle: opts.throttle || -1,
            debug: opts.debug || debug
        }
    }

    debug() {
        this.options.debug && console.log.apply(console, Array.prototype.slice.call(arguments))
    }

    scan() {
        this.debug('looking for %s', this.options.types.join('/'))
        return Promise.all(this.options.paths.map(this.walker.bind(this))).then(_.flatten)
    }

    update(orig) {
        if (!orig) throw new Error('Nothing to update from')
        this.debug('updating db with %s entries', orig.length)

        return Promise.all(this.options.paths.map(this.walker.bind(this)))
            .then(_.flatten)
            .then(flattened => flattened.filter(entry => this.unique(entry, orig)))
            .then(undupe => undupe.map(newEntry => orig = orig.concat(newEntry)))
            .then(() => this.outdated(orig))
    }

    // only keep newly added entries
    unique(entry, orig) {
        let dupe = _.find(orig, c => c.path === entry.path)
        return !dupe
    }

    // removes inexistant files from db
    outdated(files) {
        return Promise.all(files).then(files => files.filter(f => fs.existsSync(f.path)))
    }

    // determine the file type
    filetype(ext, types) {
        if (ext && ext.match(new RegExp(audio['all']))) return 'audio'
        if (ext && ext.match(new RegExp(video['all']))) return 'video'
        return null
    }

    // regex for walker (texas ranger)
    accept(types) {
        let regxp = '\\.(?:'

        if (this.options.formats.match(/all|commons/)) {
            if (types.indexOf('audio') !== -1) regxp += audio[this.options.formats]
            if (types.indexOf('video') !== -1) regxp += (regxp.length === 5 ? '' : '|') + video[this.options.formats]
        } else {
            regxp += this.options.formats
        }

        return new RegExp(regxp += ')$', 'i')
    }

    // scanner
    walker(path) {
        return new Promise((resolve, reject) => {
            let walkeropts = {
                maxAttemps: 2,
                matchRegExp: this.accept(this.options.types),
                maxPending: this.options.throttle === true ? 10 : this.options.throttle
            }

            let files = []

            Filewalker(path, walkeropts).on('file', (file, props) => {
                if (props.size > 100000) {
                    this.debug('file parsed')
                    files.push({
                        file: file,
                        size: props.size,
                        type: this.filetype(Path.extname(file), this.options.types)
                    })
                }
            }).on('done', () => {
                this.debug('found %s item(s) in %s', files.length, path)
                resolve(files.map(f => ({
                    filename: Path.basename(f.file),
                    path: Path.join(path, f.file),
                    size: f.size,
                    type: f.type
                })))
            }).on('error', err => {
                if (err.errno) { // ignore EPERM, EBUSY, ENOENT
                    this.debug(err)
                    return
                }
                reject(err)
            }).walk()
        })
    }
}