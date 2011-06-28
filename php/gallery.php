<?php 
	
	include_once('config.php');
	
	$LOAD_TYPE_MOST_RECENT = "mostrecent";
	$LOAD_TYPE_MOST_VIEWED = "mostviewed";
	$LOAD_TYPE_FEATURED = "featured";
	
	$SET_FEATURE = "dofeature";
	$SET_DELETE = "dodelete";
	
	if( isset( $_GET[ $SET_FEATURE ] ) ) {
		
		$featureID = mysql_real_escape_string( $_GET[ $SET_FEATURE ] );
		
		mysql_query( "UPDATE sketch_saves SET `featured`=1 WHERE id='$featureID'" ) or die( 'error' );
		
	}
	if( isset( $_GET[ $SET_DELETE ] ) ) {
		
		$deleteID = mysql_real_escape_string( $_GET[ $SET_DELETE ] );
		
		mysql_query( "DELETE FROM sketch_saves WHERE id='$deleteID'" ) or die( 'error' );
		
	}
	if( isset( $_GET[ 'load' ] ) && isset( $_GET[ 'start' ] ) && isset( $_GET[ 'end' ] ) ) {
		$loadType = mysql_real_escape_string( $_GET[ 'load' ] );
		$loadStart = mysql_real_escape_string( $_GET[ 'start' ] );
		$loadEnd = mysql_real_escape_string( $_GET[ 'end' ] );
		
		// Make sure the parameters are valid
		if( ( $loadType == $LOAD_TYPE_MOST_RECENT || $loadType == $LOAD_TYPE_MOST_VIEWED || $loadType == $LOAD_TYPE_FEATURED ) 
				&& is_numeric( $loadStart ) && is_numeric( $loadEnd ) ) {
			
			$orderBy = $loadType == $LOAD_TYPE_MOST_RECENT ? "`index`" : "views";
			
			if( $loadType == $LOAD_TYPE_FEATURED ) {
				$data_query = mysql_query("SELECT * FROM sketch_saves WHERE `featured`=1 ORDER BY CAST(`index` AS SIGNED) DESC LIMIT $loadStart, $loadEnd");
				$row_query = mysql_query("SELECT COUNT(*) FROM sketch_saves WHERE `featured`=1");
			}
			else {
				$data_query = mysql_query("SELECT * FROM sketch_saves ORDER BY CAST($orderBy AS SIGNED) DESC LIMIT $loadStart, $loadEnd");
				$row_query = mysql_query("SELECT COUNT(*) FROM sketch_saves");
			}
			
			$numberOfTotalRows = array_shift( mysql_fetch_array($row_query) );
			
			$numberOfMatchingRows = mysql_numrows($data_query);
			
			echo "{";
			echo '"totalRows": '.$numberOfTotalRows.',';
			echo '"sketches": [';
			
			if ( $numberOfMatchingRows != 0 ) {
				while ( $row = mysql_fetch_array($data_query) ) {
					$value = str_replace( '\"', '"', $row['value'] );
					
					echo '{"id":"'.$row['id'].'", "date":"'.$row['date'].'", "views":'.$row['views'].', "value":'.$value.'}';
					
					if( --$numberOfMatchingRows != 0 ) {
						echo ',';
					}
				}
			}
			
			echo "]}";
			
		}
		else {
			echo 'error';
		}
		
	}
	
?>