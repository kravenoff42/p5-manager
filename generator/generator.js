var fs = require('fs');
var path = require('path');
var request = require('request');
var download = require('download');

var templates = {
	sketchjs: loadFile('templates/sketch.js'),
  stylescss: loadFile('templates/styles.css'),
	indexhtml: loadFile('templates/index.html'),
	indexhtmlb: loadFile('templates/index-bundle.html'),
  scratchPadmd: loadFile('templates/scratchPad.md'),
  outlinemd: loadFile('templates/outline.md'),
  readmemd: loadFile('templates/README.md')
}

var libraries = {
	p5js: loadFile('libraries/p5.js'),
	p5domjs: loadFile('libraries/p5.dom.js'),
	p5soundjs: loadFile('libraries/p5.sound.js'),
  bootstrapcss: loadFile('libraries/bootstrap.min.css'),
  bootstrapjs: loadFile('libraries/bootstrap.min.js'),
  jqueryjs: loadFile('libraries/jquery.min.js')
}

var generator = {
	collection: function(collection, opt) {
		var p5rc = {
			name: collection,
			projects: []
		};

		mkdir(collection, function() {
			write(collection + '/.p5rc', JSON.stringify(p5rc, null, 2));
      //puts dup json file in main DIR
      mkdir(collection + '/main', function(){
        write(collection + '/main/p5rc.json', JSON.stringify(p5rc, null, 2));
      });
		});

	},
	project: function(project, opt) {

		templates.indexhtml = templates.indexhtml.replace(/\{\{project\-title\}\}/gi, project);
		templates.indexhtmlb = templates.indexhtmlb.replace(/\{\{project\-title\}\}/gi, project);
    templates.outlinemd = templates.outlinemd.replace(/\{\{project\-title\}\}/gi, project);


		mkdir(project, function() {
			if(opt.bundle) {
				createLibraries(project)
				write(project + '/sketch.js', templates.sketchjs);
				write(project + '/index.html', templates.indexhtmlb);
        write(project + '/styles.css', templates.stylescss);
        write(project + '/scratchPad.md', templates.scratchPadmd);
        write(project + '/outline.md', templates.outlinemd);
        write(project + '/README.md', templates.readmemd);
        mkdir(project + '/classes');
			}
			else {
				var p5rc = JSON.parse(fs.readFileSync('.p5rc', 'utf-8'));
				p5rc.projects.push(project);
				write('.p5rc', JSON.stringify(p5rc, null, 2));
        //puts dup json file in main DIR
        write('main/p5rc.json', JSON.stringify(p5rc, null, 2));


				if (opt.es6) {
					write(project + '/sketch.es6', templates.sketchjs);
				}
				else {
					write(project + '/sketch.js', templates.sketchjs);
				}
				write(project + '/index.html', templates.indexhtml);
        write(project + '/styles.css', templates.stylescss);
        write(project + '/scratchPad.md', templates.scratchPadmd);
        write(project + '/outline.md', templates.outlinemd);
        write(project + '/README.md', templates.readmemd);
        mkdir(project + '/classes');
			}

		});
	},
  update: function() {
    var option = {
      url: 'https://api.github.com/repos/processing/p5.js/releases/latest',
      headers: {
        'User-Agent': 'chiunhau/p5-manager'
      }
    }

    request(option, function(error, res, body) {
      // get latest release tag
      var obj = JSON.parse(body);
      console.log('The latest p5.js release is version ' + obj.tag_name);

      download(libPath(obj.tag_name, 'p5.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.js');
      });
      download(libPath(obj.tag_name, 'p5.dom.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.dom.js');
      });
      download(libPath(obj.tag_name, 'p5.sound.js'), 'libraries').then(() => {
        console.log('   \033[36mupdated\033[0m : '  + 'p5.sound.js');
      });
    });
  }
}

function libPath(tag, filename) {
  var fullpath = 'https://github.com/processing/p5.js/releases/download/' + tag + '/' + filename;
  console.log('   \033[36mdownloading\033[0m : '  + filename + '...');

  return fullpath
}

function createLibraries(dirName) {
	mkdir(dirName + '/libraries', function() {
		write(dirName + '/libraries/p5.js', libraries.p5js);
		write(dirName + '/libraries/p5.sound.js', libraries.p5soundjs);
		write(dirName + '/libraries/p5.dom.js', libraries.p5domjs);
    write(dirName + '/libraries/bootstrap.min.css', libraries.bootstrapcss);
    write(dirName + '/libraries/bootstrap.min.js', libraries.bootstrapjs);
    write(dirName + '/libraries/jquery.min.js', libraries.jqueryjs);
	});
}

// the following code are taken from https://github.com/expressjs/generator

function loadFile(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf-8');
}

function write(path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || 0666 });
  console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

function mkdir(path, fn) {
  fs.mkdir(path, 0755, function(err){
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}

module.exports = generator;
