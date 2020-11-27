//---------path variables-----//

let project_folder = require("path").basename(__dirname);
let source_folder = "src";
let fs = require('fs');

let path = {
    build: { //build folder
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",


    },
    src: { //source folder
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{png,PNG,gif,GIF,JPG,jpg,svg,SVG,ico,ICO,webp,WEBP,jpeg,JPEG}",
        fonts: source_folder + "/fonts/*.ttf",
        icons: source_folder + "/fonts/icons/*.svg",
    },
    watch: { //watch folder
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{png,PNG,gif,GIF,jpg,JPG,svg,SVG,ico,ICO,webp,WEBP,jpeg,JPEG}",
    },
    clean: "./" + project_folder + "/" //build folder for cleaning befor new build
}

//--------required modules-------------//

const { series, parallel, src, dest } = require("gulp"), //binding gulp module
    gulp = require("gulp"), //binding main gulp variable
    browsersync = require('browser-sync').create(), //browser synchronization and reload
    fileinclude = require("gulp-file-include"),//joining module
    del = require("del"), //remove 'dist' folder
    scss = require("gulp-sass"),  //binding sass->scc converter module
    autoPrefixer = require("gulp-autoprefixer"), // adding vendor's prefixes
    group_media = require("gulp-group-css-media-queries"), //group media queries
    clean_css = require("gulp-clean-css"),// clean css files
    rename = require("gulp-rename"), // rename files
    uglify = require("gulp-uglify-es").default, // clean js
    imagemin = require("gulp-imagemin"), //images optimization
    webp = require("gulp-webp"), //transform images to webP
    webpHtml = require("gulp-webp-html"),// adding webP images to html
    webpCss = require("gulp-webpcss"), //adding webP images to css
    svgsprite = require("gulp-svg-sprite"), //adding svg sprites
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter"),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css');



//------browser synchronization and reload----//
function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/" //base folder
        },
        port: 3000,
        notify: false
    })
}

//----build html files---//
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
         .pipe(webpHtml())    //turn on if there no media-size picture on the page. The rest of pictures will be wrapped with sourc "webp" version automaticly
        .pipe(gulp.dest(path.build.html))
        .pipe(browsersync.stream())
}

//----images optimization---//
function images() {
    return src(path.src.img)
        .pipe(webp({
            quality: 85
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(gulp.dest(path.build.img))
        .pipe(browsersync.stream())
}


//----build js files---//
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest(path.build.js))
        .pipe(browsersync.stream())
}


//---converting sass -> css-----//
function sassConverter() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: "expanded"
        }))
        .pipe(group_media())
        .pipe(autoPrefixer({
            overrideBrowserslist: ["last 15 versions"],
            cascade: true
        }))
        .pipe(webpCss())
        .pipe(gulp.dest(path.build.css))
        .pipe(clean_css())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(browsersync.stream())
}
//------removing 'dist' folder
function removeDistFolder() {
    return del(path.clean);
}

//-------fonts executer-----//
function fonts() {

    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
}

//--------separate task for converting otf to ttf--------/
gulp.task("otf2ttf", function () {
    return src([source_folder + "/fonts/*.otf"])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + "/fonts"))
})

//----------adding fonts to css files------//
async function fontsStyle() {
    src(source_folder + "/fonts/iconfonts/icons.* ")
    .pipe(dest(path.build.fonts));
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
            
        })
    }

}
function cb() {
}


/////////////////////////////////////////

var fontName = 'icons';
//add svg icons to the folder "icons" and use 'iconfont' task for generating icon font
gulp.task('iconfont', async () => {
    gulp.src(path.src.icons)
        .pipe(iconfontCss({
            // где будет наш scss файл
            targetPath: './../../scss/icons.scss',
            // пути подлючения шрифтов в icons.scss
            fontPath: "./../fonts/",
            fontName: fontName
        }))
        .pipe(iconfont({
            fontName: fontName,
            formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
            normalize: true,
            fontHeight: 1001
        }))
        .pipe(gulp.dest(source_folder + '/fonts/iconfonts'))
});




//////////////////////////////////////////

//-- chenges wathing--//
function watchFiles() {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.js, js);
    gulp.watch(path.watch.css, sassConverter);
    gulp.watch(path.watch.img, images);
}

//------executors------//
let build = gulp.series(removeDistFolder, gulp.parallel(fonts, images, sassConverter, js, html), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);


//-------executors exports-----//
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.html = html;
exports.sassConverter = sassConverter;


