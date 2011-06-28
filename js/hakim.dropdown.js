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
 * Small dropdown utility used to control the settings on the Sketch page.
 * 
 * @author Hakim El Hattab | http://hakim.se
 */
function DropDown( wrapperID, titleID, listID ) {
	
	var TITLE_CLASS = 'dropdown-title';
	var LIST_CLASS = 'dropdown-list';
	
	var wrapperElement = document.getElementById( wrapperID );
	var titleElement = document.getElementById( titleID );
	var titleElementInner = titleElement.getElementsByTagName( 'span' )[0];
	var listElement = document.getElementById( listID );
	var listElements = listElement.getElementsByTagName('a');
	
	var titlePrefix = titleElementInner.innerHTML;
	var titleValue = null;
	
	var selectionCallback = null;
	
	titleElement.addEventListener( "click", function( event ) {
		var titleClass = titleElement.getAttribute( "class" );
		
		if ( titleClass && titleClass.match( /open/gi ) ) {
			closeList();
		}
		else {
			openList();
		}
		
	}, false );
	
	
	titleElement.addEventListener( "mousedown", function( event ) {
		event.preventDefault();
	}, false );
	
	for( var i = 0; i < listElements.length; i++ ) {
		var el = listElements[ i ];
		
		el.addEventListener( "click", function( event ) {
			
			titleValue = event.target.getAttribute( "data-value" );
			
			updateTitle();
			closeList();
			
			triggerSelectionCallback();
			
			event.preventDefault();
			
		}, false );
	}
	
	function documentMouseDownHandler( event ) {
		var parent = event.target;
		
		var close = true;
		
		while( parent && parent.getAttribute ) {
			var id = parent.getAttribute("id");
			
			if( id && id == wrapperID ) {
				close = false;
				break;
			}
			
			parent = parent.parentNode
		}
		
		// If the parent is not defined at this point, the click
		// target is not a child of this dropdown
		if( close ) {
			closeList();
		}
	}
	
	function openList() {
		titleElement.setAttribute( "class", TITLE_CLASS + " open" );
		listElement.setAttribute( "class", LIST_CLASS + " open" );
		
		document.addEventListener( "mousedown", documentMouseDownHandler, false );
	}
	
	function closeList() {
		titleElement.setAttribute( "class", TITLE_CLASS );
		listElement.setAttribute( "class", LIST_CLASS );
		
		document.removeEventListener( "mousedown", documentMouseDownHandler, false );
	}
	
	function updateTitle() {
		titleElementInner.innerHTML = titlePrefix + titleValue;
	}
	
	function triggerSelectionCallback() {
		if (selectionCallback) {
			selectionCallback( titleValue );
		}
	}
	
	this.setSelectionCallback = function( value ) {
		selectionCallback = value;
	}
	
	this.setValue = function( value ) {
		titleValue = value;
		
		updateTitle();
	}
	
	this.getValue = function( value ) {
		return titleValue;
	}
	
}