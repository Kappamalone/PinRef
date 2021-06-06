const { src, dest, series, watch } = require('gulp');
const concat = require("gulp-concat")
const uglify = require("gulp-uglify")
const cleanCSS = require('gulp-clean-css'); 
const browserSync = require("browser-sync").create();
const gulpif = require("gulp-if")
const nodemon = require("gulp-nodemon");
let mode;


function javascript() {
    return src("src/js/*.js")
        .pipe(gulpif(mode == "prod", uglify()))
        .pipe(concat("client.min.js"))
        .pipe(dest("dist"))
}


function css() {
    return src("src/css/*.css")
        .pipe(gulpif(mode=="prod",cleanCSS()))
        .pipe(concat("styles.min.css"))
        .pipe(dest("dist"))
}

function nodemonServe() {
    var started = false;
    return nodemon({
        script: "server.js"
    }).on("start", () => {
        if (!started) {
            started = true;
        }
    })
}

function browsersyncServe() {
    browserSync.init(null, {
        port: 4000,
        proxy: "http://localhost:3000",
        reloadDelay: 1000
    })
}



function browsersyncReload(done) {
    browserSync.reload();
    done();
}


//There should be two settings:
//Production: minify images,js,css,compile and transpile ts
//Dev: browsersync, watch for file changes and move to /dist
exports.dev = (done) => {
    mode = "dev"
    nodemonServe();
    browsersyncServe();
    css();
    javascript();

    //On dev: a watch task should reload the liver server anytime a file is changed
    watch("*.html",browsersyncReload);
    watch("src/css/*.css",series(css,browsersyncReload));
    watch("src/js/*.js",series(javascript,browsersyncReload));
    done();
}

exports.prod = (done) => {
    mode = "prod";
    css();
    javascript();
    typescript();
    done();
}