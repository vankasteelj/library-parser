var LibraryParser = require('./index');
var lp = new LibraryParser({
    paths: ['D:\\Musique\\TEST'],
    types: ['audio', 'video']
}, true);

lp.scan().then(function (results) {
    console.log(results);
}).catch(function(e){console.error(e)});

/*var library;
var LibraryParser = require('C:/GIT/library-parser/index');
var lp = new LibraryParser({
    paths: ['D:'],
    types: ['audio', 'video']
}, true);

function start() { 
    lp.scan().then(function (results) {
        console.log(results);
        library = results;
    }).catch(function(e){console.error(e)});
}

function update() {
    lp.update(library).then(function (results) {
        console.log(results);
        library = results;
    }).catch(function(e){console.error(e)});
}*/