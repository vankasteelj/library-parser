var Utils = module.exports = {
    filetype: function (ext, types) {
        var video = new RegExp(/3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|xvid/);
        var audio = new RegExp(/wav|mp3|wma|flac|ape|aac|m4a|ogg/);

        if (ext.match(audio) && types.indexOf('audio') !== -1) return 'audio';
        if (ext.match(video) && types.indexOf('video') !== -1) return 'video';
        return false;
    }
};