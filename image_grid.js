var gm = require('gm');
var mkdirp = require('mkdirp');
var jade = require('jade');
var fs = require('fs');

var sizes = [400, 350, 300, 250, 200];
var qualities = [100, 80, 60, 40, 20];

var input_filename = process.argv[2];
var output_folder = 'resized_images';

mkdirp.sync(output_folder);

var file_sizes = {};
var pending_images = 0;

var resize_and_compress = function (input_filename, size, quality)
{
    var output_filename = output_folder + '/' + size + '_' + quality + '.jpg';
    gm(input_filename)
        .resize(size)
        .quality(quality)
        .compress('jpeg')
        .write(output_filename,
               function (err) {
                   if (!err) {
                       console.log('wrote: ' + output_filename);
                       stats = fs.statSync(output_filename);
                       file_size_kb = stats.size / 1000;
                       file_sizes[output_filename] = file_size_kb;
                       pending_images -= 1;
                       if (pending_images === 0) {generate_html();}
                   }
               });
    pending_images += 1;
}

var generate_html = function ()
{
    console.log(file_sizes);

    var jade_fn = jade.compileFile('index.jade')
    var html = jade_fn({sizes: sizes, qualities: qualities, file_sizes: file_sizes})

    var html_file = fs.openSync('index.html', 'w')
    fs.writeSync(html_file, html)
}

sizes.forEach( function (size) {
    qualities.forEach( function (quality) {
        resize_and_compress(input_filename, size, quality);
    });
});
