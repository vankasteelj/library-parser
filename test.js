var LibraryParser = require('./index');
var lp = new LibraryParser({
    paths: ['D:\\Musique\\TEST'],
    types: ['audio', 'video']
}, true);

lp.scan().then(function (results) {
    console.log(results);
});