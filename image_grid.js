var gm = require('gm');
var mkdirp = require('mkdirp');
var jade = require('jade');
var fs = require('fs');

// Image output size in pixel and JPEG quality
var sizes = [400, 350, 300, 250, 200];
var qualities = [100, 80, 60, 40, 20];

// command line implementation at third argument
var input_filename = process.argv[2];
var output_folder = 'resized_images';

// Create output folder (ignore if already exists)
mkdirp.sync(output_folder);

var file_sizes = {};
var pending_images = 0;

// Implement graphics magick to resize and compress image. Then write out the
// file. If there are no errors, calculate file size of each and count down
// until no more background processes are pending. Then invoke generate HTML

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

// Generate View with Jade Templating Engine
var generate_html = function ()
{
    console.log(file_sizes);

    var jade_fn = jade.compileFile('index.jade')
    var html = jade_fn({sizes: sizes, qualities: qualities, file_sizes: file_sizes})

    var html_file = fs.openSync('index.html', 'w')
    fs.writeSync(html_file, html)
}
// Invoke resize_and_compress for each pair of size and quality nesting for loops
sizes.forEach( function (size) {
    qualities.forEach( function (quality) {
        resize_and_compress(input_filename, size, quality);
    });
});
