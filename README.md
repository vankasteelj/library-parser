# library-parser
Find your local media

### Getting started

- Install the module:

```
npm install library-parser
```

- Initialize it in node:

```js
var library; // that will come handy later

var LibraryParser = require('library-parser');
var parser = new LibraryParser({
    paths: ['D:/Music', 'D:/Videos'], // mandatory
    types: ['audio', 'video'] // default to both
});
```

- Scan your local directories:

```js
parser.scan().then(function (results) {
    console.log(results);
    library = results; // keep it somewhere safe to be able to use .update()
}).catch(function(e){console.error(e)});
```
*Note: you can add fields to `library` if you want, they will be kept when updating. Make sure you leave `item['path']` untouched though.*

- Update:

```js
parser.update(library).then(function (results) {
    console.log(results);
    library = results;
}).catch(function(e){console.error(e)});
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