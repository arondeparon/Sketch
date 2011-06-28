# Sketch

Sketch is a drawing tool with a twist; it allows you to draw in pseudo 3D. Sketches can be saved by users and viewed in a gallery.

The front end is built using the HTML5 canvas element and plenty of JavaScript. Sketches are saved in a MySQL database and PHP is used as a mediator between front end and database.

Curious about how this looks in action? [Check out the live demo](http://hakim.se/experiments/html5/sketch).

## Server Configuration

If you want saving and loading of Sketches to work, you'll need to set up a MySQL database. Instructions can be found in the [php/config.php](https://github.com/hakimel/Sketch/blob/master/php/config.php) file.

There are also a few pointer variables in [js/hakim.sketch.io.js](https://github.com/hakimel/Sketch/blob/master/js/hakim.sketch.io.js) that you'll need to update if you rename/relocate any of the PHP files.

## License

MIT licensed

Copyright (C) 2011 Hakim El Hattab, http://hakim.se
