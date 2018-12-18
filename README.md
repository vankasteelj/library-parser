# library-parser
Find your local media

### Getting started

- Install the module:

```
npm install library-parser
```

- Initialize it in node:

```js
let library = null; // that will come handy later

const LibraryParser = require('library-parser');
const parser = new LibraryParser({
    paths: ['D:/Music', 'D:/Videos'], // mandatory
    types: ['audio', 'video'] // optionnal, default to both
    formats: 'all' // optionnal, defaults to 'commons'
    throttle: true // optionnal, defaults to false
});
```

- Scan your local directories:

```js
parser.scan().then((results) => {
    console.log(results);
    library = results; // keep it somewhere safe to be able to use .update()
}).catch(console.error);
```
*Note: you can add fields to `library` if you want, they will be kept when updating. Make sure you leave `item['path']` untouched though.*

- Update:

```js
parser.update(library).then((results) => {
    console.log(results);
    library = results;
}).catch(console.error);
```

---

### Output
The output of `.scan()` and `.update(db)` will be an object.

```js
Object {
    0: Object {
        filename: "- Timbaland ft Keri Hilson & D.O.E. - The Way I Are.mp3"
        path: "D:\Music\TEST\- Timbaland ft Keri Hilson & D.O.E. - The Way I Are.mp3"
        size: 4782080
        type: "audio"
    },
    1: Object {
        filename: "02 the holy econnomic war.wma"
        path: "D:\Music\TEST\02 the holy econnomic war.wma"
        size: 4941926
        type: "audio"
    }
}
```

*Note: handy tip if you refuse to use a real db to store and explore the output, it's to use underscore or lodash: `_.filter(library, {type: 'audio'})`*

---

### Formats: 
The module can look for a whole bunch of filetypes, that you might not want.
Here are the options for the `format` argument:

1. video 'all':
> '3g2|3gp|3gp2|3gpp|60d|ajp|asf|asx|avchd|avi|bik|bix|box|cam|dat|divx|dmf|dv|dvr-ms|evo|flc|fli|flic|flv|flx|gvi|gvp|h264|h265|m1v|m2p|m2ts|m2v|m4e|m4v|mjp|mjpeg|mjpg|mkv|moov|mov|movhd|movie|movx|mp4|mpe|mpeg|mpg|mpv|mpv2|mxf|nsv|nut|ogg|ogm|omf|ps|qt|ram|rm|rmvb|swf|ts|vfw|vid|video|viv|vivo|vob|vro|wm|wmv|wmx|wrap|wvx|wx|x264|x265|xvid'

2. video 'commons' (default): 
> 'avi|divx|dv|flv|m2ts|m4v|mkv|mov|mp4|mpeg|mpg|off|wmv|xvid'

3. audio 'all':
> 'aa|aac|aax|act|aiff|ape|au|flac|dvf|gsm|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|tta|wav|wma|wv|webm'

4. audio 'commons' (default): 
>'aiff|ape|flac|m4a|m4b|m4p|mp3|mpc|ogg|oga|opus|wav|wma|webm'

You can also specify your own regex-like string.

---

### Throttle:
This argument is useful to throttle the number of simultaneous disk-operations, if you use an UI and don't want to kill it while the parser goes. It defaults to `false`, which means that the UI will probably freez on parsing.

`throttle: true` will result in a maximum of 10 asynchronous jobs at the same time and should be a good compromise between speed and no negative effect on the UX.

Possible values are: true (== 10), false, or an integer (usually 1 to 50).

---

### License GPL-3.0

    Copyright (C) 2016  Jean van Kasteel

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/