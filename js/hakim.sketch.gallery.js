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
 * Handles loading and rendering of thumbnails on the gallery page.
 * 
 * @author Hakim El Hattab | http://hakim.se
 */
var SketchGallery = (function() {
	
	// Holds all public functions
	var API = {};
	
	var ITEMS_PER_PAGE = 8;
	
	// The default canvas size
	var ORIGINAL_WIDTH = 960;
	var ORIGINAL_HEIGHT = 580;
	
	var THUMBNAIL_WIDTH = 240;
	var THUMBNAIL_HEIGHT = 145;
	
	var LOAD_MORE_LABEL = "Load More";
	
	var scaleX = THUMBNAIL_WIDTH / ORIGINAL_WIDTH + 0.05;
	var scaleY = THUMBNAIL_HEIGHT / ORIGINAL_HEIGHT;
	
	var LOAD_TYPE_FEATURED = "featured";
	var LOAD_TYPE_MOST_RECENT = "mostrecent";
	var LOAD_TYPE_MOST_VIEWED = "mostviewed";
	
	var featuredContainer = null;
	var mostViewedContainer = null;
	var mostRecentContainer = null;
	
	var featuredButton = null;
	var mostViewedButton = null;
	var mostRecentButton = null;
	
	var featuredSketches = [];
	var mostViewedSketches = [];
	var mostRecentSketches = [];
	
	var loadingFeaturedItems = false;
	var loadingMostViewedItems = false;
	var loadingMostRecentItems = false;
	
	var renderQueue = [];
	var renderQueueTimer = -1;
	
	API.initialize = function() {
		featuredContainer = document.getElementById( "featured-sketches" );
		mostViewedContainer = document.getElementById( "most-viewed-sketches" );
		mostRecentContainer = document.getElementById( "most-recent-sketches" );
		
		featuredButton = document.getElementById( "load-more-featured" );
		mostViewedButton = document.getElementById( "load-more-most-viewed" );
		mostRecentButton = document.getElementById( "load-more-most-recent" );
		
		featuredButton.addEventListener( "click", function( event ) {
			loadFeatured();
			
			event.preventDefault();
		}, false );
		
		mostViewedButton.addEventListener( "click", function( event ) {
			loadMostViewed();
			
			event.preventDefault();
		}, false );
		
		mostRecentButton.addEventListener( "click", function( event ) {
			loadMostRecent();
			
			event.preventDefault();
		}, false );
		
		loadFeatured();
		loadMostViewed();
		loadMostRecent();
	}
	
	function loadFeatured() {
		if (!loadingFeaturedItems) {
			loadingFeaturedItems = true;
			
			SketchIO.loadGalleryItems( LOAD_TYPE_FEATURED, featuredSketches.length, ITEMS_PER_PAGE, function( status, sketches, rows ) {
				
				if( status == "success" ) {
					addSketches( featuredSketches, sketches, featuredContainer );
				}
				
				featuredButton.innerHTML = LOAD_MORE_LABEL + " (" + featuredSketches.length + "/" + rows + ")";
				featuredButton.style.display = featuredSketches.length < rows ? "inline-block" : "none";
				
				loadingFeaturedItems = false;
				
			} );
		}
	}
	
	function loadMostViewed() {
		if (!loadingMostViewedItems) {
			loadingMostViewedItems = true;
			
			SketchIO.loadGalleryItems( LOAD_TYPE_MOST_VIEWED, mostViewedSketches.length, ITEMS_PER_PAGE, function( status, sketches, rows ) {
				
				if( status == "success" ) {
					addSketches( mostViewedSketches, sketches, mostViewedContainer );
				}
				
				mostViewedButton.innerHTML = LOAD_MORE_LABEL + " (" + mostViewedSketches.length + "/" + rows + ")";
				mostViewedButton.style.display = mostViewedSketches.length < rows ? "inline-block" : "none";
				
				loadingMostViewedItems = false;
				
			} );
		}
	}
	
	function loadMostRecent() {
		if (!loadingMostRecentItems) {
			loadingMostRecentItems = true;
			
			SketchIO.loadGalleryItems( LOAD_TYPE_MOST_RECENT, mostRecentSketches.length, ITEMS_PER_PAGE, function( status, sketches, rows ) {
				
				if( status == "success" ) {
					addSketches( mostRecentSketches, sketches, mostRecentContainer );
				}
				
				mostRecentButton.innerHTML = LOAD_MORE_LABEL + " (" + mostRecentSketches.length + "/" + rows + ")";
				mostRecentButton.style.display = mostRecentSketches.length < rows ? "inline-block" : "none";
				
				loadingMostRecentItems = false;
				
			} );
		}
	}
	
	function addSketches( stack, sketches, container ) {
		
		for( var i = 0; i < sketches.length; i++ ) {
			
			var sketch = sketches[i];
			
			var canvasID = container.getAttribute("id") + sketch.id;
			
			// Create the element which will represent this sketch
			var element = document.createElement( 'li' );
			
			// Define the markup which will be added to our element
			var markup = "";
			markup += 	"<a href='../#" + sketch.id + "' title='Open: " + sketch.id + "'>";
			markup += 		"<canvas id='" + canvasID + "'></canvas>";
			markup += 		"<div class='details'>";
			markup += 			"<p class=\"date\">" + sketch.date.substr( 0, 10 ) + "</p>";
			markup += 			"<span>/</span>";
			markup += 			"<p class=\"views\">" + sketch.views + ( sketch.views == 1 ? " view" : " views" ) + "</p>";
			markup += 		"</details>";
			markup += 	"</a>";
			
			// Write the markup inside of the element
			element.innerHTML = markup;
			
			// Now add element to our container
			container.appendChild( element );
			
			var definition = { canvasID: canvasID, sketch: sketch };
			
			renderQueue.push( definition );
			stack.push( definition );
			
		}
		
		startRenderQueue();
		
	}
	
	function startRenderQueue() {
		if( renderQueue.length && renderQueueTimer == -1 ) {
			renderQueueTimer = setInterval( updateRenderQueue, 5 );
		}
 	}
	function updateRenderQueue() {
		if (renderQueue.length) {
			var item = renderQueue.shift();
			
			render(item.canvasID, item.sketch)
		}
		else {
			stopRenderQueue();
		}
	}
	function stopRenderQueue() {
		clearInterval( renderQueueTimer );
		renderQueueTimer = -1;
	}
	
	function render( canvasID, sketch ) {
		
		var canvas = document.getElementById( canvasID );
		var context = canvas.getContext( '2d' );
		
		context.clearRect( 0, 0, canvas.width, canvas.height );
		
		context.save();
		context.scale( scaleX, scaleY );
		
		var lines = sketch.lines;
		var globalPerspective = sketch.perspective;
		var lineCount = lines.length;
		
		// Go through each line and draw a path between its points
		while ( lineCount-- ) {
			
			var thickness = lines[lineCount].thickness;
			var perspective = wrapNumber( ( globalPerspective - lines[lineCount].perspective ) * 2, 2 );
			var dashed = lines[lineCount].dashed;
			var points = lines[lineCount].points;
			
			var p1 = points[0];
			var p2 = points[1];
			
			// Only begind the path if we're drawing on solid line
			if ( !dashed ) {
				context.beginPath();
			}
			
			for (var i = 1, len = points.length; i < len; i++) {
				
				// If we're drawing a dashed line, we need to begin a new
				// path on every loop
				if ( dashed ) {
					context.beginPath();
				}
				
				var p1x = p1.normal.x;
				var p2x = p2.normal.x;
				
				// Adjust the position based on depth
				p1x += perspective * ( p1.normal.x - ( ORIGINAL_WIDTH * 0.5 ) ) * ( perspective < 0 ? 1 : -1 );
				p2x += perspective * ( p2.normal.x - ( ORIGINAL_WIDTH * 0.5 ) ) * ( perspective < 0 ? 1 : -1 );
				
				if( i == 1 || dashed ) {
					context.moveTo(p1x, p1.normal.y);
				}
				
				// Draw a smooth curve between p1 and p2
				context.quadraticCurveTo(p1x, p1.normal.y, p1x + (p2x - p1x) / 2, p1.normal.y + (p2.normal.y - p1.normal.y) / 2);
				
				p1 = points[i];
				p2 = points[i + 1];
				
				// If this is a dashed line, it needs to be drawn repeatedly
				// in this loop
				if( dashed ) {
					stroke( context, ( thickness * ( 1 ) ).toFixed(2) );
				}
			}
			
			// If we're drawing a solid line, close it now
			if( !dashed ) {
				stroke( context, thickness );
			}
			
		}
		
		context.restore();
		
	}
	
	function stroke( context, thickness ) {
		// Draw this line
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = thickness;
		context.strokeStyle = 'rgba(0,0,0,0.96)';
		context.stroke();
	}
	
	function wrapNumber( value, limit ) {
		if (value > limit) {
			return -limit + (value % limit);
		}
		
		if (value < -limit) {
			return limit + (value % limit);
		}
		
		return value;
	}
	
	function distanceBetween(p1, p2) {
		var dx = p1.x-p2.x;
		var dy = p1.y-p2.y;
		return Math.sqrt(dx*dx + dy*dy);
	}
	
	return API;
	
} )();


SketchGallery.initialize();
