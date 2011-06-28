<?php
	
	include_once 'util.php';
	
	/**
	 * Database settings, you'll need to fill these out if you
	 * want the saving/loading and gallery functionality to 
	 * work.
	 * 
	 * The MySQL database must be structured as follows:
	 * 
	 * ---------------------------------------------------
	 * | FIELD:    | TYPE:     | EXTRA:                  |
	 * ---------------------------------------------------
	 * | index     | int       | primary, auto increment |
	 * | id        | text      | -                       |
	 * | value     | text      | -                       |
	 * | data      | text      | -                       |
	 * | views     | int       | default '1'             |
	 * | featured  | int       | default '0'             |
	 * ---------------------------------------------------
	 */
	$host = "";
	$user = "";
	$pass = "";
	$db_name = "";
	
	/**
	 * Connect
	 */ 
	$link = mysql_connect($host, $user, $pass);
	mysql_select_db($db_name);
	
	/**
	 * Set encoding to utf-8
	 */
	mysql_query("SET NAMES utf8");
?>