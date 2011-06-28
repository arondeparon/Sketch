/**
 * Copyright (C) 2011 Hakim El Hattab, http://hakim.se
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * 
 * Handles AJAX communication with the server side components to save and load
 * sketches.
 * 
 * @author Hakim El Hattab | http://hakim.se
 */
var SketchIO = (function() {
	
	// Web services for saving and loading sketches
	var SAVE_SERVICE = 'php/sketch.php';
	var LOAD_SERVICE = 'php/sketch.php';
	var GALLERY_SERVICE = '../php/gallery.php';
	
	var STRINGIFIED_POSITION_DELIMITER = 'x';
	
	function eo( a, b ) {
		if( a || a == 0 ) return a;		
		return b;
	}
	
	return {
		
		saveSketch: function() {
			var saveData = Sketch.linesToJSON();
			
			// POST our save data
			$.post( SAVE_SERVICE, "save="+saveData, function( data, status ) {
				
				// Did the service return an error code?
				if( data.match( /error/gi ) ) {
					
					alert( "Sorry dude, the server replied with a no-no :(" );
					
				}
				else {
					
					// Show the unique ID for this sketch in the hash
					document.location.hash = data;
					
					// Prompt the user with the selected URL
					prompt( "All done! Here's the URL:", document.location );
					
				}
				
			} );
		},
		
		loadSketch: function( id, callback ) {
			// GET the data for our ID
			$.get( LOAD_SERVICE, { load: id }, function( data, status ) {
				
				// Did the service return an error code?
				if( data.match( /error/gi ) ) {
					
					alert( "There was an error loading your sketch." );
					
				}
				else {
					
					var status = "success";
					
					try {
						
						var parsedData = SketchIO.parseSketch( $.parseJSON(data) );
						
					}
					catch( e ) {
						status = "error";
						
						alert( "Uh-oh, an error occured while trying to load this sketch." );
					}

					callback( status, parsedData );
					
				}
				
			} );
		},
		
		parseSketch: function( data ) {
			// Originally, long variables names were used. These were then
			// shortened for the sake of limiting data transfers so we need
			// to check for both alternatives.
			var dataPerspective = eo( data.p, data.perspective );
			var dataAmplitude = eo( data.a, data.amplitude );
			var dataLines = eo( data.l, data.lines );
			
			// The data retrieved from the server is compressed so we
			// need to go through and expand each point
			for (var i = 0; i < dataLines.length; i++) {
				dataLines[i].thickness = eo( dataLines[i].t, dataLines[i].thickness );
				dataLines[i].perspective = eo( dataLines[i].p, dataLines[i].perspective ); 
				dataLines[i].dashed = eo( dataLines[i].d, dataLines[i].dashed );
				dataLines[i].points = eo( eo( dataLines[i].l, dataLines[i].points ), [] );
				
				var points = dataLines[i].points;
				
				for (var j = 0; j < points.length; j++) {
					
					var p = {
						position: { x: 0, y: 0 },
						normal: { x: 0, y: 0 }
					};
					
					// Define the expanded point based on the compressed values
					if( typeof( points[j] ) == 'string' ) {
						p.position.x = parseFloat( points[j].slice( 0, points[j].indexOf( STRINGIFIED_POSITION_DELIMITER ) ) );
						p.position.y = parseFloat( points[j].slice( points[j].indexOf( STRINGIFIED_POSITION_DELIMITER ) + 1 ) );
						
						//p.position.x = parseFloat( points[j].slice( 0, 3 ) );
						//p.position.y = parseFloat( points[j].slice( 4, 7 ) );
					}
					else {
						p.position.x = points[j].x;
						p.position.y = points[j].y;
					}
					
					p.normal.x = p.position.x;
					p.normal.y = p.position.y;
					
					// Replace the compressed point with the expanded one
					points[j] = p;
					
				}
			}
			
			for (var i = 0; i < dataLines.length; i++) {
				var points = dataLines[i].points;
				
				if( points.length < 2 ) {
					dataLines.splice( i, 1 );
					i--;
				}
			}
			
			return {
				perspective: dataPerspective,
				amplitude: dataAmplitude,
				lines: dataLines
			};
		},
		
		loadGalleryItems: function( type, start, end, callback ) {
			$.get( GALLERY_SERVICE, { load: type, start: start, end: end }, function( data, status ) {
				
				// Did the service return an error code?
				if( data.match( /error/gi ) ) {
					
					alert( "There was an error loading the sketches." );
					
				}
				else {
					
					var status = "success";
					
					var rows = 1;
					var sketches = [];
					
					try {
						
						data = $.parseJSON(data);
						
						rows = data.totalRows;
						
						for( var i = 0; i < data.sketches.length; i++ ) {
							
							var sketch = SketchIO.parseSketch( data.sketches[i].value );
							sketch.id = data.sketches[i].id;
							sketch.date = data.sketches[i].date;
							sketch.views = data.sketches[i].views;
							
							sketches.push( sketch );
						}
						
					}
					catch( e ) {
						status = "error";
						
						alert( "Uh-oh, an error occured while trying to load the sketches." );
					}

					callback( status, sketches, rows );
					
				}
				
			} );
		}
	};
	
	
})();