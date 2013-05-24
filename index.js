"use strict";
var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var Coleccionista = require('coleccionista');

var dependencies = [];
var verbose;
var fileTools;

var JS = function(fuller, plan) {
	if(!verbose) {
		verbose = fuller.verbose;
	}

	if(!fileTools) {
		fileTools = fuller.getTool('files');
	}

	this.tree = plan.files;
	this.dev = fuller.o.dev;

	this.src = path.join(fuller.home, fuller.o.src, 'js');
	this.dst = path.join(fuller.home, fuller.o.dst);

	this.tools = fuller.loadTools(plan.tools);
};

JS.prototype.buildDependencies = function() {
	var i, j, files;

	for(i in this.tree) {
		files = Array.isArray(this.tree[i]) ? this.tree[i] : this.tree[i].src;

		for(j in files) {
			fileTools.addDependence(dependencies, files[j], i);
		}
	}
};

JS.prototype.buildOne = function(srcPath, src, dst, cb) {
	var self = this, bricks, p, a;

	fileTools.mkdirp(path.dirname(dst), function(err, path){
		if(err) {
			cb(err);
		} else {
			var stream = new Coleccionista(fileTools.treeToArray(srcPath, src)),
				end = new fs.createWriteStream(dst);

			end.on('close', function() {
				cb && cb(null, dst);
			});

			for (var t in self.tools) {
				stream = stream.pipe(self.tools[t].getStream());
			}

			stream.pipe(end);
		}
	});
};

JS.prototype.build = function(cb) {
	var floor;
	for(floor in this.tree) {
		verbose.log("Building".green, path.join(this.dst, floor));
		this.buildOne(
			this.src,
			this.tree[floor],
			path.join(this.dst, floor),
			cb
		);
	}
};

JS.prototype.watch = function(cb) {
	var self =this;

	this.buildDependencies();

	fileTools.watchFiles( this.src, dependencies, function(event, filename){
		var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];

		verbose.log("Changed".red, filename);

		for(f in filesToBuild) {
			verbose.log("Building".green, filesToBuild[f]);
			self.buildOne(
				self.src,
				self.tree[filesToBuild[f]],
				path.join(self.dst, filesToBuild[f])
			);
		}

		cb && cb(event, filename);

	});
};


module.exports = JS;
