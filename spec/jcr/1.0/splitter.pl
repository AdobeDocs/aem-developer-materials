#!/usr/bin/perl
#
# Split jcr-spec.txt by section. Overwrite old section file only if changed.
# Remove old section file that no longer exists in new spec.
#
$infile = "jsr170-jcr10-full.html";
$outdir = "jcr-spec-segments";

open(INFILE, $infile);
@lines = <INFILE>;
close(INFILE);

$tmpfile = "";
$txtfile = "";
$grabnext = "";

%txtfiles = {};
%titles = {};

open(NAVFILE, ">$outdir/nav.js");									# Open new tmp file
print NAVFILE "document.write('<div class=\"nav\">');\n";		
print NAVFILE "document.write('<h1>JCR v1.0: TOC</h1>');\n";		

foreach $line (@lines) {
	if ($grabnext ne "") {
		$title = getTitleFromLine($line);
		$txtfile = getFilenameFromLine($line);
		@splits = split(/\ /, $title);
		$key="$splits[0].";
		print "$key -> $title, $txtfile\n";
		$titles{$key} = $title;
		$txtfiles{$key} = $txtfile;
		print NAVFILE "document.write('<a href=\"$txtfile\">$title</a><br>');\n";		
		$grabnext = "";
	}  
	if ($line =~ /<h[1-4]>/) { 									# If line is a heading like "<h[1-5]"
		$grabnext = "$line";
	}

}
print NAVFILE "document.write('</div>');\n";		
close (NAVFILE);


foreach $line (@lines) {
	if ($grabnext ne "") {
		$title = getTitleFromLine($line);
		$txtfile = getFilenameFromLine($line);
		print "$title -> $txtfile\n";
		$fn = $line;
		print TMPFILE "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n";
		print TMPFILE "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\" xml:lang=\"en\">\n";
		print TMPFILE "<head><title>JCR 1.0: $title (Content Repository for Java Technology API)</title>";
		print TMPFILE "<meta http-equiv=\"CONTENT-TYPE\" content=\"text/html; charset=utf-8\"></meta>";
		print TMPFILE "<link rel=\"stylesheet\" type=\"text/css\" href=\"main.css\"></link>";
		print TMPFILE "</head><body>";
		print TMPFILE "<script type=\"text/javascript\" src=\"header.js\"></script>";
		print TMPFILE "<script type=\"text/javascript\" src=\"nav.js\"></script>";
		print TMPFILE "$grabnext";
		$grabnext = "";

	}  
	if ($line =~ /<h[1-4]>/) { 									# If line is a heading like "<h[1-5]"
		if ($tmpfile ne "") {											# If this is not the first tmp file
			print TMPFILE "<script type=\"text/javascript\" src=\"footer.js\"></script>";
			print TMPFILE "</body></html>";
			close(TMPFILE);												# Close the previous tmp file
			addOrUpdate();												# Add or update previous txt from previous tmp
		}
		$grabnext = "$line";
		$tmpfile = "$outdir\/mytemp.tmp";
		open(TMPFILE, ">$tmpfile");									# Open new tmp file
	} else {
		$line=replaceHashesWithLinks($line);
		print TMPFILE "$line";										# Write line to current tmp
		
	}
	

}
close(TMPFILE);												# Last line done, close last tmp file.
addOrUpdate();												# Add of update last txt from last tmp

sub replaceHashesWithLinks {
	my @splits = split(/\ href=\"\#section_/,$_[0]);
	my $res=$splits[0];
	
	my $count=1;
	while ($splits[$count]) {
		my $seg=$splits[$count];
		my @hrefsplits=split(/\"/, $seg);
		my $key=$hrefsplits[0];
		$res="$res href=\"$txtfiles{$key}\"$hrefsplits[1]";
		$count = $count+1;
	}
	return $res;
	
}
sub getFilenameFromLine {
	my $fn = getTitleFromLine($_[0]);
	$fn =~ s/[\ \:\\\/\*\?\"\<\>\|\^\%\#\(\)\t\$\!\+\{\}\&\[\]]/_/g;	# Replace bad chars in fn
	my $txtfile = "$fn.html";								# New txt file name
	return $txtfile;
}

sub getTitleFromLine {
	my $fn = $_[0];
	my @splits = split (/\<\/a\>/, $fn);
	$fn=$splits[1]; 
	chomp ($fn = $fn);										# Strip trailing newlines
	$fn =~ s/^\ *//g;										# left trim
	my $title = $fn;
	return $title;
}

# Add or update txt from tmp
sub addOrUpdate {
		`mv $tmpfile $outdir\/$txtfile`;			# move to txt from tmp
		print "Moved: $txtfile\n";
}
