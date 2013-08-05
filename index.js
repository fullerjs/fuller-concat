"use strict";
var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var Coleccionista = require('coleccionista');

var dependencies = [];
var verbose;
var fileTools;

var Concat = function(fuller, plan) {
	if(!verbose) {
		verbose = fuller.verbose;
	}

	if(!fileTools) {
		fileTools = fuller.getTool('files');
	}

	this.tasks = plan.tasks;
	this.dev = fuller.o.dev;

	this.src = fuller.pathes.src;
	this.dst = fuller.pathes.dst;

	this.tools = fuller.loadTools(plan.tools);
};

Concat.prototype.buildDependencies = function() {
	var i, j, files;

	for(i in this.tasks) {
		files = Array.isArray(this.tasks[i]) ? this.tasks[i] : this.tasks[i].src;

		for(j in files) {
			fileTools.addDependence(dependencies, files[j], i);
		}
	}
};

Concat.prototype.buildOne = function(srcPath, src, dst, cb) {
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

Concat.prototype.build = function(cb) {
	var floor;
	for(floor in this.tasks) {
		verbose.log("Building".green, path.join(this.dst, floor));
		this.buildOne(
			this.src,
			this.tasks[floor],
			path.join(this.dst, floor),
			cb
		);
	}
};

Concat.prototype.watch = function(cb) {
	var self =this;

	this.buildDependencies();

	fileTools.watchFiles( this.src, dependencies, function(filename){
		var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];

		verbose.log("Changed".red, filename);

		for(f in filesToBuild) {
			verbose.log("Building".green, filesToBuild[f]);
			self.buildOne(
				self.src,
				self.tasks[filesToBuild[f]],
				path.join(self.dst, filesToBuild[f])
			);
		}

		cb && cb(filename);

	});
};


module.exports = Concat;
