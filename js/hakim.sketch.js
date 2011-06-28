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
 * Draw 3D sketches with animating strokes on canvas.
 * 
 * TODO:
 *   - Make line width scale depending on perspective
 * 
 * @author Hakim El Hattab | http://hakim.se
 * @version 1.0
 */

var Sketch = (function() {
	
	// Holds all public functions
	var API = {};
	
	// The minimum size the window should ever reach
	var MIN_WIDTH = 960;
	var MIN_HEIGHT = 700;
	
	// The collapsed height of the header
	var HEADER_HEIGHT = 35;
	
	// The default canvas size
	var DEFAULT_WIDTH = 960;
	var DEFAULT_HEIGHT = 580;
	
	// Defines how far the lines will jump while animating
	var DEFAULT_AMPLITUDE = 3;
	
	// Defines how quickly the lines will contract while animating
	// (0-1, higher values are faster)
	var DEFAULT_ELASTICITY = 0.7;
	
	// The size and perspective depth of the compass shown while
	// changing perspectives
	var COMPASS_RADIUS = 50;
	var COMPASS_DEPTH = 6;
	
	// The minimum number of distance between points, used to limit
	// the density of points to improve on performance
	var MINIMUM_POINT_DISTANCE = 2;
	
	// The number of miliseconds to wait between drawing points
	// during a replay
	var REPLAY_INTERVAL = 20;
	
	// The number of points to draw per intervarl while replaying
	var REPLAY_INTERVAL_SIZE = 2;
	
	// The number of times the game will be redrawn per second
	var FRAMERATE = 40;
	
	// The world dimensions, defaults to full screen for touch devices
	var world = { 
		x: 0, 
		y: 0, 
		width: DEFAULT_WIDTH, 
		height: DEFAULT_HEIGHT 
	};
	
	var windowSize = {
		width: 0,
		height: 0
	};
	
	var dust = [];
	var lines = [];
	var replayLines = [];
	
	// The total number of points that the user has manually drawn
	// since starting/loading this sketch
	var numberOfPointsDrawn = 0;
	
	// Flags if we are currently replaying
	var replaying = false;
	
	// Flags if the replay is complete, but in the process of finishing
	// its final perspective adjustment
	var replayIsFinishing = false;
	
	// While we replay, this value reflects the perspective of the line
	// currently being drawn, allowing us to rotate the replay
	var replayCurrentPerspective = 0;
	
	// When a replay is complete, this is the global perspective we'll
	// end up on
	var finalGlobalPerspective = 0;
	
	// Line animation settings
	var amplitude = DEFAULT_AMPLITUDE;
	var elasticity = DEFAULT_ELASTICITY; // 0-1
	
	// Drawing settings
	var globalThickness = 3;
	var globalPerspective = 0;
	
	// Velocity that is applied to the perspective on every update,
	// this value is accellerated by mouse drag
	var perspectiveVelocity = 0;
	
	var compassAlpha = 0;
	
	var headerToggleTimeOut = -1;
	
	// The canvas and its context (2d)
	var canvas;
	var context;
	
	// The current state of the mouse
	var mouse = {
		// Current position 
		x: 0, y: 0, 
		
		// Previous position
		prev: { x: 0, y: 0 },
		
		// Difference between current and previous position
		diff: { x: 0, y: 0 }, 
		
		// The position where the mouse was pressed
		press: { x: 0, y: 0 },
		
		// Flags if the mouse is currently pressed down
		down: false 
	};
	
	// The current state of the keyboard
	var key = { 
		spaceDown: false,
		leftDown: false,
		rightDown: false 
	};
	
	var dashMode = false;
	
	var ui = {
		ads: null,
		header: null,
		options: null,
		saveButton: null,
		resetButton: null,
		dashToggle: null,
		dashToggleState: null,
		vibrationDropdown: null,
		sizeDropdown: null
	};
	
	
	/**
	 * Initializes the game world and rendering.
	 */
	API.initialize = function(){
		
		// Collect references to all DOM elements being used
		canvas = document.getElementById('world');
		
		ui.ads = document.getElementById('adSense');
		ui.header = document.getElementsByTagName('header')[0];
		ui.options = document.getElementById('options');
		ui.saveButton = document.getElementById('save-button');
		ui.resetButton = document.getElementById('reset-button');
		ui.dashToggle = document.getElementById('dash-toggle');
		ui.dashToggleState = ui.dashToggle.getElementsByTagName( 'span' )[0];
		
		// Configure the dropdown used to select brush sizes
		sizeDropdown = new DropDown( "size-dropdown", "size-dropdown-title", "size-dropdown-list" );
		sizeDropdown.setValue( globalThickness );
		
		// Configure the dropdown used to select vibration level
		vibrationDropdown = new DropDown( "vibration-dropdown", "vibration-dropdown-title", "vibration-dropdown-list" );
		vibrationDropdown.setValue( 1 );
		vibrationDropdown.setSelectionCallback( function( value ) {
			amplitude = DEFAULT_AMPLITUDE * value;
		} );
		
		// Make sure that the Canvas element is available before continuing
		if (canvas && canvas.getContext) {
			context = canvas.getContext('2d');
			
			// Register event listeners
			document.addEventListener('mousemove', documentMouseMoveHandler, false);
			canvas.addEventListener('mousedown', documentMouseDownHandler, false);
			document.addEventListener('mouseup', documentMouseUpHandler, false);
			canvas.addEventListener('touchstart', documentTouchStartHandler, false);
			document.addEventListener('touchmove', documentTouchMoveHandler, false);
			document.addEventListener('touchend', documentTouchEndHandler, false);
			document.addEventListener('keydown', documentKeyDownHandler, false);
			document.addEventListener('keyup', documentKeyUpHandler, false);
			
			ui.saveButton.addEventListener('click', saveButtonClickedHandler, false);
			ui.resetButton.addEventListener('click', resetButtonClickedHandler, false);
			ui.dashToggle.addEventListener('click', dashToggleClickedHandler, false);
			
			ui.header.addEventListener('mouseover', headerMouseOverHandler, false);
			ui.header.addEventListener('mouseout', headerMouseOutHandler, false);
			
			window.addEventListener('resize', windowResizeHandler, false);
			window.addEventListener( "beforeunload", windowBeforeUnload, false );
			
			// Force an initial resize to make sure the UI is sized correctly
			windowResizeHandler();
			
			ui.options.style.display = 'block';
			
			// If we are running on mobile, certain elements need to be configured differently
			if( !!navigator.userAgent.toLowerCase().match( /ipod|ipad|iphone|android/gi ) ) {
				ui.header.style.display = 'none';
			}
			
			// Initiate the main render loop of the game
			loop();
			
			// Grab the sketch ID in the hash, if there is one
			var id = document.location.hash.slice(1);
			
			if (id.length > 6) {
				loadSketch( id );
			}
			
		}
	};
	
	API.linesToJSON = function() {
		for( var i = 0; i < lines.length; i++ ) {
			if( !lines[i] || !lines[i].points || lines[i].points.length == 0 ) {
				lines.splice(i, 1);
				i--;
			}
		}
		
		var o = '{';
		
		o += '"p":' + globalPerspective.toFixed(6) + ',';
		o += '"a":' + amplitude.toFixed(6) + ',';
		o += '"l":[';
		
		for( var i = 0; i < lines.length; i++ ) {
			var points = lines[i].points;
			
			o += '{';
			
			o += '"t":' + lines[i].thickness + ',';
			o += '"p":' + ( lines[i].perspective == 0 ? 0.0001 : lines[i].perspective.toFixed(6) ) + ',';
			o += '"d":' + lines[i].dashed + ',';
			o += '"points":[';
			
			for (var j = 0; j < points.length; j++) {
				var p = points[j];
				
				var x = Math.round(p.normal.x);
				var y = Math.round(p.normal.y);
				
				//o += '{"x":' + x + ',"y":' + y + '}';
				o +=  '"' + x + 'x' + y + '"';
				o += (j < points.length - 1 ? ',' : '');
			}
			
			o += ']}';
			o += (i < lines.length - 1 ? ',' : '');
		}
		
		o += ']}';
		
		return o;
	}
	
	API.saveSketch = function() {
		if (lines.length > 0) {
			SketchIO.saveSketch();
			
			numberOfPointsDrawn = 0;
		}
		else {
			alert( "You need to draw something to save." );
		}
	}
	
	function loadSketch( id ) {
		SketchIO.loadSketch( id, function( status, data ) {
			
			if (status == "success") {
				if (data.perspective) {
					// Set both the current and final gloal perspectives
					globalPerspective = data.perspective;
					finalGlobalPerspective = data.perspective;
				}
				
				if (data.amplitude) {
					amplitude = data.amplitude;
					
					// Make sure the ui reflects the new vibration level
					vibrationDropdown.setValue(Math.round(data.amplitude / DEFAULT_AMPLITUDE));
				}
				
				replayLines = data.lines;
				
				replaying = true;
				
				replaySketch();
			}
			else {
				lines = [];
			}
			
		} );
	}
	
	function replaySketch( finishImmediately ) {
		
		var count = 0;
		
		// The data retrieved from the server is compressed so we
		// need to go through and expand each point
		mainLoop: for (var i = 0; i < replayLines.length; i++) {
			
			// If this line is not yet defined, do so now
			lines[i] = lines[i] || { 
				thickness: replayLines[i].thickness, 
				perspective: replayLines[i].perspective, 
				dashed: replayLines[i].dashed, 
				points: [] 
			};
			
			replayCurrentPerspective = lines[i].perspective;
			
			// Grab the replay points for the current line
			var points = replayLines[i].points;
			
			while ( points.length ) {
				
				p = points.shift();
				
				// Push this point to the 
				lines[i].points.push( p );
				
				// Emit a limited amount of dust during replay. Never emit
				// any dust if we are finishing immediately since it might,
				// depending on the number of remaining points, result in
				// heavy lag.
				if ( !finishImmediately && i % 2) {
					emitDust(p.position.x, p.position.y, 2, lines[i].perspective );
				}
				
				// If we're beyond the interval size, abort and continue on
				// the next interval
				if( !finishImmediately && count++ > REPLAY_INTERVAL_SIZE ) {
					break mainLoop;
				}
				
			}
		}
		
		var lastLine = replayLines[ replayLines.length - 1 ];
		
		// Set another time out as long as the last replay line
		// still has some points (length is not zero)
		if ( lastLine && lastLine.points.length && !finishImmediately ) {
			// Make sure the replaying flag is set
			replaying = true;
			
			setTimeout( function() {
				replaySketch();
			}, REPLAY_INTERVAL );
		}
		else {
			if (finishImmediately) {
				// Flag that we are no longer replying
				replaying = false;
				
				// Since we are finishing immediately make sure we end up
				// on the final global perspective
				globalPerspective = finalGlobalPerspective;
				replayCurrentPerspective = finalGlobalPerspective;
			}
			else {
				// Flag that we're now wrapping up the replay
				replayIsFinishing = true;
				
				// All lines are drawn, all that remains is shifting perspective
				// back to the final global perspective
				replayCurrentPerspective = finalGlobalPerspective;
			}
		}
		
	}
	
	function stopReplay() {
		replaySketch( true );
	}
	
	function saveButtonClickedHandler( event ) {
		event.preventDefault();
		
		API.saveSketch();
	}
	
	function resetButtonClickedHandler( event ) {
		replayLines = [];
		lines = [];
		dust = [];
		
		document.location.hash = "";
		
		numberOfPointsDrawn = 0;
		
		event.preventDefault();
	}
	
	function dashToggleClickedHandler( event ) {
		dashMode = ui.dashToggle.getAttribute( "class" ) == 'switch';
		
		ui.dashToggle.setAttribute( "class", dashMode ? "switch on" : "switch" );
		ui.dashToggleState.innerHTML = dashMode ? "ON" : "OFF";
		
		event.preventDefault();
	}
	
	function documentKeyDownHandler(event) {
		switch( event.keyCode ) {
			case 32: // space
				key.spaceDown = true;
				event.preventDefault();
				break;
			case 37: // left arrow
				key.leftDown = true;
				event.preventDefault();
				break;
			case 39: // right arrow
				key.rightDown = true;
				event.preventDefault();
				break;
			case 90: // z
				// CTRL for Win and CMD for Mac
				if( event.ctrlKey || event.metaKey ) {
					lines.pop();
				}
				break;
		}
		
		if( replaying ) {
			stopReplay();
		}
	}
	
	function documentKeyUpHandler(event) {
		switch( event.keyCode ) {
			case 32:
				key.spaceDown = false;
				event.preventDefault();
				break;
			case 37: // left arrow
				key.leftDown = false;
				event.preventDefault();
				break;
			case 39: // right arrow
				key.rightDown = false;
				event.preventDefault();
				break;
		}
	}
	
	/**
	 * Event handler for document.onmousemove.
	 */
	function documentMouseMoveHandler(event){
		mouse.prev.x = mouse.x;
		mouse.prev.y = mouse.y;
		
		mouse.x = event.clientX - (windowSize.width - world.width) * 0.5 + scrollPosition().x;
		mouse.y = event.clientY - (windowSize.height - world.height) * 0.5 + scrollPosition().y;
		
		mouse.diff.x = mouse.x - mouse.prev.x;
		mouse.diff.y = mouse.y - mouse.prev.y;
	}
	
	/**
	 * Event handler for document.onmousedown.
	 */
	function documentMouseDownHandler(event){
		mouse.down = true;
		
		mouse.x = event.clientX - (windowSize.width - world.width) * 0.5 + scrollPosition().x;
		mouse.y = event.clientY - (windowSize.height - world.height) * 0.5 + scrollPosition().y;
		
		handlePointerPress( event );
	}
	
	/**
	 * Event handler for document.onmouseup.
	 */
	function documentMouseUpHandler(event) {
		mouse.down = false;
		
		mouse.x = event.clientX - (windowSize.width - world.width) * 0.5 + scrollPosition().x;
		mouse.y = event.clientY - (windowSize.height - world.height) * 0.5 + scrollPosition().y;
	}
	
	function scrollPosition() {
		return {
			x: document.body.scrollLeft || window.pageXOffset,
			y: ( document.body.scrollTop || window.pageYOffset ) - HEADER_HEIGHT + 2
		};
	}
	
	/**
	 * Event handler for document.ontouchstart.
	 */
	function documentTouchStartHandler(event) {
		if(event.touches.length == 1) {
			mouse.down = true;
			
			mouse.x = event.touches[0].pageX - (window.innerWidth - world.width) * 0.5;
			mouse.y = event.touches[0].pageY - (window.innerHeight - world.height) * 0.5;
			
			handlePointerPress( event );
			
			event.preventDefault();
		}
	}
	
	/**
	 * Event handler for document.ontouchmove.
	 */
	function documentTouchMoveHandler(event) {
		if(event.touches.length == 1) {
			event.preventDefault();

			mouse.prev.x = mouse.x;
			mouse.prev.y = mouse.y;
			
			mouse.x = event.touches[0].pageX - (window.innerWidth - world.width) * 0.5;
			mouse.y = event.touches[0].pageY - (window.innerHeight - world.height) * 0.5;
			
			mouse.diff.x = mouse.x - mouse.prev.x;
			mouse.diff.y = mouse.y - mouse.prev.y;
		}
	}
	
	/**
	 * Event handler for document.ontouchend.
	 */
	function documentTouchEndHandler(event) {
		mouse.down = false;
	}
	
	function handlePointerPress( event ) {
		mouse.press.x = mouse.x;
		mouse.press.y = mouse.y;
		
		if (event.target == canvas) {
			
			if( replaying ) {
				stopReplay( true );
			}
			
			// Make sure the thickness reflects the dropdown selection
			globalThickness = sizeDropdown.getValue() || 3;
			
			// Start a new line
			lines.push( { 
				thickness: globalThickness, 
				perspective: globalPerspective,
				dashed: dashMode,
				points: [] 
			} );
			
			event.preventDefault();
		}
	}
	
	function windowBeforeUnload( event ) {
		if( !event ) {
			event = window.event;
		}
		
		if ( numberOfPointsDrawn > 4 ) {
			var message = 'Your current drawing will be lost.';
			
			event.cancelBubble = true;
			event.returnValue = message;
			
			if (event.stopPropagation) {
				event.stopPropagation();
				event.preventDefault();
			}
			
			return message;
		}
	}
	
	function headerMouseOverHandler() {
		if (!mouse.down) {
			// Make sure no previous call to toggle the header are
			// queued up
			clearTimeout( headerToggleTimeOut );
			
			// Avoid accidentally opening the header by setting
			// a short time out
			headerToggleTimeOut = setTimeout( function() {
				ui.header.setAttribute( 'class', 'open' )
			}, 100 );
		}
	}
	function headerMouseOutHandler() {
		// Make sure no previous call to toggle the header are
		// queued up
		clearTimeout( headerToggleTimeOut );
		
		// Avoid accidentally closing the header by setting
		// a short time out
		headerToggleTimeOut = setTimeout( function() {
			ui.header.setAttribute( 'class', '' )
		}, 100 );
	}
	
	/**
	 * Event handler for window.onresize.
	 */
	function windowResizeHandler() {
		
		windowSize.width = Math.max( window.innerWidth, MIN_WIDTH );
		windowSize.height = Math.max( window.innerHeight, MIN_HEIGHT );
		
		// Update the game size
		world.width = DEFAULT_WIDTH;
		world.height = DEFAULT_HEIGHT;
		
		// Resize the canvas
		canvas.width = world.width;
		canvas.height = world.height;
		
		// Determine the centered x/y position of the canvas
		var cvx = Math.round( (windowSize.width - world.width) * 0.5 );
		var cvy = Math.round( (windowSize.height - world.height) * 0.5 ) - HEADER_HEIGHT;
		
		// Move the canvas
		canvas.style.position = 'relative';
		canvas.style.left = cvx + 'px';
		canvas.style.top = cvy + 'px';
		
		// Move the options container into place and stretch it
		// to match the width of the canvas
		ui.options.style.position = 'relative';
		ui.options.style.width = world.width + 'px';
		ui.options.style.left = cvx + 'px';
		ui.options.style.top = cvy - 25 + 'px';
		
		if (ui.ads) {
			ui.ads.style.position = 'absolute';
			ui.ads.style.left = ((windowSize.width * 0.5) - 364) + 'px';
			ui.ads.style.top = (windowSize.height - 30) + 'px';
		}
	}
	
	/**
	 * Emits dust particles that simulate lead crumbling.
	 * 
	 * @param x {Number} the horizontal coord to emit from
	 * @param y {Number} the vertical coord to emit from 
	 * @param quantity {Number} The maximum number of particles
	 * that should be emitted (this is scaled by a random factor)
	 * @param perspective {Number} The perspective that this
	 * dust particles exists in
	 */
	function emitDust( x, y, quantity, perspective ) {
		
		var i = Math.round( Math.random() * quantity );
		
		while( i-- ) {
			dust.push( {
				position: { 
					x: x, 
					y: y 
				},
				velocity: { 
					x: 0.5 * Math.random() - 0.25, 
					y: 3 * Math.random() 
				},
				alpha: 0.98,
				perspective: perspective
			} );
		}
		
	}
	
	/**
	 * Called on every frame to update and render the world.
	 */
	function loop() {
		
		context.clearRect( 0, 0, canvas.width, canvas.height );
		
		update();
		
		render();
		
		requestAnimFrame( loop );
		
	}
	
	function update() {
		// Assume that we are at a great distance (in case no points exist)
		var distanceFromLastPoint = 999;
		
		var lastLine = lines[lines.length - 1];
		
		if (lastLine) {
			var lastPoint = lastLine.points[lastLine.points.length - 1];
			
			if (lastPoint) {
				distanceFromLastPoint = distanceBetween(mouse, lastPoint.position);
			}
		}
		
		// If we are replaying, we need to adjust the perspective to
		// match what is being drawn 
		if (replaying) {
			
			// Ease the global perspective towards the current replay
			// perspective
			globalPerspective += (replayCurrentPerspective - globalPerspective) * 0.08;
			
			// If the current replay perspective matches the final global
			// perspective AND we are within very short rang of that value,
			// complete the replay
			if( finalGlobalPerspective == replayCurrentPerspective &&  Math.abs( globalPerspective - replayCurrentPerspective ) < 0.003 && replayIsFinishing ) {
				
				// Make sure we end up on the final perspective
				globalPerspective = finalGlobalPerspective;
				
				stopReplay();
			}
		}
		
		// Adjust perspective based on current velocity and make sure
		// the number wraps at -1/1
		globalPerspective = wrapNumber(globalPerspective + perspectiveVelocity, 1);
		
		// Apply friction to the perspective velocity
		perspectiveVelocity *= 0.8;
		
		// As soon as space is pressed, we want to show the perspective compass
		if( key.spaceDown || key.leftDown || key.rightDown ) {
			compassAlpha = 1;
		}
		
		// Is mouse and space both currently pressed?
		if( mouse.down && key.spaceDown ) {
			// Add velocity to the perspective change, based on how
			// fast the mouse is moving
			perspectiveVelocity += mouse.diff.x / world.width;
		}
		// Is the left arrow pressed but the right arrow isn't?
		else if( key.leftDown && !key.rightDown ) {
			perspectiveVelocity -= 0.005;
		}
		// Is the right arrow pressed but the left arrow isn't?
		else if( key.rightDown && !key.leftDown ) {
			perspectiveVelocity += 0.005;
		}
		
		// Only add a point if:
		//   - The mouse cursor is pressed down
		//   - The distance from the last point is greater than x
		//	 - Space is not down (else)
		else if ( mouse.down && Math.abs(distanceFromLastPoint) > MINIMUM_POINT_DISTANCE ) {
			
			// Inline function for creating a new point at the current
			// mouse position
			function addPoint() {
				lastLine.points.push({
					position: {
						x: mouse.x,
						y: mouse.y
					},
					normal: {
						x: mouse.x,
						y: mouse.y
					}
				});
			}
			
			// We're adding one point for sure..
			addPoint();
			
			// .. but if this is the first point, we immediately add
			// a second point as well (so that a dot is drawn)
			if( lastLine.points.length < 2 ) {
				addPoint();
			}
			
			// Increment the total number of drawn points
			numberOfPointsDrawn ++;
			
			// Emit some dust to simulate the lead crumbling
			emitDust( mouse.x, mouse.y, 5, globalPerspective );
			
		}
		
		mouse.diff.x = 0;
		mouse.diff.y = 0;
		
	}
	
	/**
	 * Updates the world by stepping forward one frame.
	 */
	function render() {
		
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
				
				// If the point's position is within x distance of its normal,
				// we give it another impulse based on the current amplitude
				if (distanceBetween(p1.position, p1.normal) < 1) {
					p1.position.x += (Math.random() - 0.5) * amplitude;
					p1.position.y += (Math.random() - 0.5) * amplitude;
				}
				
				// Ease position towards the normal at a speed based on elasticity
				p1.position.x += (p1.normal.x - p1.position.x) * elasticity;
				p1.position.y += (p1.normal.y - p1.position.y) * elasticity;
				
				var p1x = p1.position.x;
				var p2x = p2.position.x;
				
				// Adjust the position based on depth
				p1x += perspective * ( p1.position.x - ( world.width * 0.5 ) ) * ( perspective < 0 ? 1 : -1 );
				p2x += perspective * ( p2.position.x - ( world.width * 0.5 ) ) * ( perspective < 0 ? 1 : -1 );
				
				if( i == 1 || dashed ) {
					context.moveTo(p1x, p1.position.y);
				}
				
				// Draw a smooth curve between p1 and p2
				context.quadraticCurveTo(p1x, p1.position.y, p1x + (p2x - p1x) / 2, p1.position.y + (p2.position.y - p1.position.y) / 2);
				
				p1 = points[i];
				p2 = points[i + 1];
				
				// If this is a dashed line, it needs to be drawn repeatedly
				// in this loop
				if( dashed ) {
					stroke( ( thickness * ( 1 ) ).toFixed(2) );
				}
			}
			
			// If we're drawing a solid line, close it now
			if( !dashed ) {
				stroke( thickness );
			}
			
		}
		
		for (var i = 0; i < dust.length; i++) {
			
			var d1 = dust[i];
			
			var perspective = wrapNumber( ( globalPerspective - d1.perspective ) * 2, 2 );
			
			d1.position.x += d1.velocity.x;
			d1.position.y += d1.velocity.y;
			
			var d1x = d1.position.x;
			
			// Adjust the position based on perspective
			d1x += perspective * ( d1.position.x - ( world.width * 0.5 ) ) * ( perspective < 0 ? 1 : -1 );
			
			d1.alpha *= 0.94;
			
			context.fillStyle = "rgba(0,0,0," + d1.alpha + ")";
			context.fillRect(d1x, d1.position.y, 1, 1);
			
			if (d1.alpha < 0.05) {
				dust.splice(i, 1);
				i--;
			}
			
		}
		
		if( compassAlpha > 0 ) {
			
			context.save();
			context.globalAlpha = Math.max( compassAlpha, 0 );
			
			context.beginPath();
			context.scale( 1, 0.5 );
			
			var a = globalPerspective * Math.PI - ( Math.PI / 2 );
			
			for( var i = 0; i < 2; i++ ) {
				var distance = i == 0 ? COMPASS_DEPTH : 0;
				
				context.moveTo( world.width / 2, ( world.height * 1.7) + 2 );
				context.arc( world.width / 2, ( world.height * 1.7) + distance, COMPASS_RADIUS, a - 0.2, a + 0.2, true );
				context.closePath();
				
				context.lineWidth = 4;
				context.strokeStyle = 'rgb(165,106,70)';
				context.stroke();
				
				context.fillStyle = 'rgba(240,150,105,0.85)';
				context.fill();
				
				context.beginPath();
			}
			
			context.restore();
			
			compassAlpha -= 0.05;
			
		}
		
	}
	
	function stroke( thickness ) {
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
	
})();

// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

Sketch.initialize();


