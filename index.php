<!DOCTYPE html> 
<html lang="en"> 
	<head>
		<meta charset="utf-8"> 
		 
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
		
		<meta name="description" content="Draw 3D sketches with animating strokes on HTML5 canvas." />
		<meta name="author" content="Hakim El Hattab" />
		
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="viewport" content="width = 980" />
		
		<title>Sketch in 3D With Animating Lines on HTML5 canvas</title>
		
		<link href="css/reset.css" rel="stylesheet" media="screen" />
		<link href="css/main.css" rel="stylesheet" media="screen" />
		
		<link href='http://fonts.googleapis.com/css?family=Yanone+Kaffeesatz:regular,bold' rel='stylesheet' type='text/css'>
		
		<script>
			var flattr_url = 'http://hakim.se/experiments/html5/sketch/';
			var flattr_btn='compact';
		</script>
	</head>
	
	<body>
	
		<header>
    		<h1>Sketch</h1>
    		<span class="header-instruction">Expand for instructions & sharing.</span>
    		
    		<!-- The extra content that can be expanded -->
    		<div class="extra">
	    		
    			<!-- About the experiment in general -->
    			<section id="about">
    				<h3>About</h3>
    				<p>
    					Remember the old cartoons where hand drawn lines appeared <br />
    					to vibrate because of differences between frames? <br /><br />
    					That's what this experiment simulates. It also adds a third <br />
    					to your drawings by allowing you to rotate the canvas. 
    				</p>
	    			<p class="credits">
	    				Created by <a href="http://hakim.se/experiments">Hakim El Hattab</a><br />
    				</p>
	    		</section>
	    		
	    		<!-- Instructions for the experiment -->
    			<section id="instructions">
    				<h3>Instructions</h3>
    				<p>
    					To rotate the canvas in 3D, you need to hold down <br />
						<strong>SPACE</strong> and then <strong>DRAG</strong> horizontally with your cursor. <br /><br />
						You can also use <strong>CTRL+Z</strong> to undo.
					</p>
	    		</section>
	    		
	    		<!-- Different methods for sharing the experiment -->
	    		<section id="share">
	    			<h3>Share</h3>
	    			
					<iframe id="facebook_button" src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fhakim.se%2Fexperiments%2Fhtml5%2Fsketch%2F&amp;layout=button_count&amp;show_faces=false&amp;width=90&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border: none; overflow: hidden; width: 90px; height: 21px;" allowtransparency="true" name="facebook_button"></iframe>
					
					<div id="retweet-button"> 
						<a href="http://twitter.com/share"
							class="twitter-share-button"
							data-url="http://hakim.se/experiments/html5/sketch/"
							data-text="Draw 3D sketches with animating strokes. An experiment from @hakimel."
							data-count="horizontal" data-related="hakimel">Tweet</a> 
						<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script> 
					</div> 
					
	    			<div id="flattr-button"><script src="http://api.flattr.com/button/load.js" type="text/javascript"></script></div> 
					
	    		</section>
	    		
    		</div>
    	</header>
		
		<div id="options">
			<a id="save-button" class="switch" title="Save &amp; Share" href="#" name="save-button">Save &amp; Share</a>
			<a id="reset-button" class="switch" title="Reset" href="#" name="reset-button">Reset</a>
			<a id="dash-toggle" class="switch" title="Dash" href="#" name="dash-toggle">Dash: <span>OFF</span></a>
			
			<div id="vibration-dropdown" class="dropdown">
				<div id="vibration-dropdown-title" class="dropdown-title"><span>Vibration:</span></div>
				<div id="vibration-dropdown-list" class="dropdown-list">
					<ul>
						<li><a href="#" data-value="0">0</a></li>
						<li><a href="#" data-value="1">1</a></li>
						<li><a href="#" data-value="2">2</a></li>
						<li><a href="#" data-value="3">3</a></li>
						<li><a href="#" data-value="5">5</a></li>
						<li><a href="#" data-value="10">10</a></li>
						<li><a href="#" data-value="20">20</a></li>
					</ul>
				</div>
			</div>
			
			<div id="size-dropdown" class="dropdown">
				<div id="size-dropdown-title" class="dropdown-title"><span>Size:</span></div>
				<div id="size-dropdown-list" class="dropdown-list">
					<ul>
						<li><a href="#" data-value="0.5">0.5 px</a></li>
						<li><a href="#" data-value="1">1 px</a></li>
						<li><a href="#" data-value="2">2 px</a></li>
						<li><a href="#" data-value="3">3 px</a></li>
						<li><a href="#" data-value="4">4 px</a></li>
						<li><a href="#" data-value="5">5 px</a></li>
						<li><a href="#" data-value="6">6 px</a></li>
						<li><a href="#" data-value="7">7 px</a></li>
						<li><a href="#" data-value="8">8 px</a></li>
						<li><a href="#" data-value="9">9 px</a></li>
					</ul>
				</div>
			</div>
			
			<a id="gallery-link" class="link" href="gallery" title="Opens Gallery In a New Window">Go to the Gallery</a>
		</div>
		
		<canvas id="world">
			<p class="noCanvas">You need a <a href="http://www.google.com/chrome">modern browser</a> to view this.</p>
		</canvas>
		
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
		<script>!window.jQuery && document.write(unescape('%3Cscript src="js/libs/jquery-1.4.4.min.js"%3E%3C/script%3E'))</script>
		
		<script src="http://platform.twitter.com/widgets.js"></script>
		<script src="js/hakim.dropdown.js"></script>
		<script src="js/hakim.sketch.io.js"></script>
		<script src="js/hakim.sketch.js"></script>
		
	</body>
</html>
