#!/usr/bin/perl

use strict;
use warnings;

my $test = "asdfasdfasdf";
my $usage = "Usage: $0 <viewport_width> <viewport_height> <canvas_width> <canvas_height> <js_file>";

sub Abort
{
	print "$usage\n";
	exit 1;
}

if ($#ARGV + 1 != 5) {
	Abort();
} else {
	for my $i (0 .. $#ARGV - 1) {
		Abort() unless (($ARGV[$i] !~ /\D/) && ($ARGV[$i] ne ""));
	}
}

my ($viewport_width, $viewport_height, $canvas_width, $canvas_height, $js_file) = @ARGV;

print "Warning: Missing \"ldb.js\"\n" unless (-e "ldb.js");
print "Warning: Missing \"$js_file\"\n" unless (-e $js_file);

my $html = qq(<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Game</title>
		<style>
		 body {
			 margin: 0;
			 padding: 0;
			 background-color: #000;
			 color: #FFF;
			 font-family: monospace;
		 }
		 #game-viewport-container {
			 width: ${canvas_width}px;
			 height: ${canvas_height}px;
			 margin: 96px auto 96px auto;
			 border: 2px solid #FFF;
		 }
		 #game-viewport {
			 position: absolute;
		 }
		 #loading {
			 position: absolute;
			 left: 0;
			 right: 0;
			 margin-top: 96px;
			 text-align: center;
		 }
		</style>
	</head>
	<body>
		<span id="loading">Loading...</span>
		<div id="game-viewport-container">
			<canvas id="game-viewport" tabindex="1" width="$canvas_width" height="$canvas_height">
			</canvas>
		</div>
		<center>
			Made with <a href="https://github.com/kpworld-xyz/ldb-js">ldb.js</a>
		</center>
		<script src="ldb.js"></script>
		<script src="$js_file"></script>
	</body>
</html>
);

open(FH, ">", "game.html") or die $!;
print FH $html;
close(FH);
