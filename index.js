'use strict';
const path = require('path');
const glob = require('glob-all');
const Transform = require('stream').Transform;
const Material = require('fuller-material-file');

const SrcFiles = function(fuller, options) {
  fuller.bind(this);
  this.src = options.src;
  this.dst = options.dst;
};

SrcFiles.prototype = {
  build: function(src, dst) {
    const next = new Transform({
      objectMode: true,
      transform: (mat, enc, cb) => {
        cb(null, mat);
      }
    });

    if (Array.isArray(src)) {
      src = src.slice(0);
    }

    glob(src, { cwd: this.src }, err => err && this.error(err))
      .on('match', f => {
        const file = path.join(this.src, f);
        const newMat = new Material({ id: dst, path: file })
          .dst(path.join(this.dst, f))
          .error(err => this.error(err));

        this.addDependencies(file, dst);
        next.write(newMat);
      })
      .on('end', () => next.end())
      .on('error', err => this.error(err));
    return next;
  }
};


module.exports = SrcFiles;
