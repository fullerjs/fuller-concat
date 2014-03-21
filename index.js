"use strict";
var fs = require('fs');
var path = require('path');
var isArray = Array.isArray;

var Concat = function(fuller, options) {
	fuller.bind(this);

	this.Stream = fuller.streams.Collector;
	this.dev = options.dev;
	this.src = options.src;
	this.dst = options.dst;
};

Concat.prototype.treeToArray = function (srcPath, files) {
    return files.map(function(filePath){
        return path.join(srcPath, filePath);
    });
};

Concat.prototype.build = function(stream, master) {
	if(isArray(stream)) {
		var files = this.treeToArray(this.src, stream);
		this.addDependence(files, master);
		stream = new this.Stream(files);
	}

	return stream;
};


module.exports = Concat;
