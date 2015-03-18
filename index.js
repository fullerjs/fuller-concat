"use strict";
let path = require("path");
let glob = require("glob-all");
let Transform = require("stream").Transform;
let Material = require("fuller-material-file");

let SrcFiles = function(fuller, options) {
	fuller.bind(this);

	this.src = options.src;
	this.dst = options.dst;
};

SrcFiles.prototype = {
	build: function(src, dst) {
		let self = this;

		let next = new Transform({
			objectMode: true,
			transform: function(mat, enc, cb) {
				cb(null, mat);
			}
		});

		glob(src, {cwd: this.src}, function(err, files) {
				// self.addDependencies(files, dst);
				err && self.error(err);
			})
			.on("match", function(f) {
				let file = path.join(self.src, f);
				let newMat = new Material({ id: dst, path: file })
					.dst(path.join(self.dst, f))
					.error(function(err) {
						self.error(err);
					});
				self.addDependencies(file, dst);
				next.write(newMat);
			})
			.on("end", function() {
				next.end();
			})
			.on("error", function(err) {
				self.error(err);
			});

		return next;
	}
};


module.exports = SrcFiles;
