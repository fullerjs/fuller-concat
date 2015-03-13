"use strict";
let Coleccionista = require("coleccionista");

let isArray = Array.isArray;

let SrcFiles = function(fuller, options) {
	fuller.bind(this);

	this.dev = options.dev;
	this.src = options.src;
};

SrcFiles.prototype.build = function(stream, master) {
	if(isArray(stream) || typeof stream === "string") {
		let self = this;

		stream = new Coleccionista({
				files: stream,
				path: this.src
			}, function(err, files) {
				if(err) {
					self.error(err.toString().replace("Error:", ""));
				} else {
					self.addDependence(files, master);
				}
			})
			.on("error", function(err) {
				self.error(err.toString().replace("Error:", ""));
			});
	}

	return stream;
};


module.exports = SrcFiles;
