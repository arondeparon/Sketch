<?php 
	
	include_once('config.php');
	
	if( isset( $_GET[ 'load' ] ) ) {
		$loadID = mysql_real_escape_string( $_GET[ 'load' ] );
		
		$sqlstr = mysql_query( "SELECT value FROM sketch_saves WHERE id='$loadID'" ) or die( 'error' );
		
		if ( mysql_numrows($sqlstr) != 0 ) {
			while ( $row = mysql_fetch_array($sqlstr) ) {
				echo str_replace( '\"', '"', $row['value'] );
				
				mysql_query( "UPDATE sketch_saves SET views=views+1 WHERE id='$loadID'" ) or die( 'error' );
			}
		}
	}
	
	if( isset( $_POST[ 'save' ] ) ) {
		$saveData = mysql_real_escape_string( $_POST[ 'save' ] );
		
		$sqlstr = mysql_query( "SELECT COUNT(*) FROM sketch_saves" ) or die( 'error' );
		
		$numberOfRows = array_shift( mysql_fetch_array($sqlstr) );
		
		$uniqueID = $numberOfRows . unique_id( 8 - strlen( $numberOfRows ) );
		$date = date("d-m-Y G:i:s");
		
		mysql_query("INSERT INTO sketch_saves (id, value, date) VALUES ('$uniqueID', '$saveData', '$date')") or die( 'error' );
		
		echo $uniqueID;
	}
	
	function unique_id($l = 8){
		$better_token = md5(uniqid(rand(), true));
		$rem = strlen($better_token)-$l;
		$unique_code = substr($better_token, 0, -$rem);
		$uniqueid = $unique_code;
		return $uniqueid;
	}
	
?>