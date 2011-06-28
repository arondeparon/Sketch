<?php
	/**
	 * Determines if we are running on the live server (or locally)
	 * 
	 */
	function isLive() {
		if(preg_match('/experiments.dev|localhost/', $_SERVER['SERVER_NAME'])) {
			return false;
		} else {
			return true;
		}
	}
?>