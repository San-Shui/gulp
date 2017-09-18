var gulp = require('gulp')
// 网页自动刷新（服务器控制客户端同步刷新）
var livereload = require('gulp-livereload')
// 本地服务器
var webserver = require('gulp-webserver')
// less文件编译成css
var	less = require('gulp-less') 
// 压缩css文件
var cssmin = require('gulp-clean-css')
// 生成sourcemap文件
var sourcemaps = require('gulp-sourcemaps')
// 当发生异常时提示错误
var notify = require('gulp-notify')
var plumber = require('gulp-plumber')
// 压缩html，可以压缩页面javascript、css，去除页面空格、注释，删除多余属性等操作
var htmlmin = require('gulp-htmlmin')
// 只操作有过修改的文件
var changed = require('gulp-changed')
// 压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
var imagemin = require('gulp-imagemin')
// 深度压缩图片
var pngquant = require('imagemin-pngquant')
// 只压缩修改的图片，没有修改的图片直接从缓存文件读取（C:\Users\Administrator\AppData\Local\Temp\gulp-cache）。
var cache = require('gulp-cache')
// 给css文件里引用url加版本号
var cssver = require('gulp-make-css-url-version')
// 压缩javascript文件，减小文件大小
var uglify = require('gulp-uglify')
// 文件重命名
var rename = require('gulp-rename')			
// 合并javascript文件，减少网络请求
var concat = require('gulp-concat')
// 文件清理
var clean = require('gulp-clean')				

/**
 * 使用gulp-less文件编译成css
 */
gulp.task('lessTask', function() {
    gulp.src('src/less/*.less')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(rename({ suffix: '.min' })) // 重命名
		.pipe(less()) // 将less文件编译成css
        .pipe(cssmin()) // 压缩css
        .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/css')) // 将会在dist/css下生成index.css
})

/**
 * watch监测less文件的改变
 */
gulp.task('lessWatch', function () {
    gulp.watch('src/**/*.less', ['lessTask']); // 当src文件或者子文件下的某个less文件发生改变时，调用lessTask任务
});

/**
 * 使用gulp-htmlmin压缩html
 */
gulp.task('htmlminTask', function () {
    var options = {
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true, // 压缩HTML
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
        minifyJS: true, // 压缩页面JS
        minifyCSS: true // 压缩页面CSS
    };
    var stream = gulp.src('src/*.html')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(changed('dist'))
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'))
    return stream
    
})

/**
 * 使用gulp-imagemin压缩图片
 */
gulp.task('imageminTask', function () {
    var option = {
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: false, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: false //类型：Boolean 默认：false 多次优化svg直到完全优化
    }
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(imagemin(option))
        .pipe(gulp.dest('dist/img'))
})

/**
 * 使用imagemin-pngquant深度压缩图片
 */
gulp.task('pngquantTask', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(changed('dist/img'))
        .pipe(imagemin({
            progressive: true,// 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
            use: [pngquant()] // 使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest('dist/img'));
})

/**
 * 使用gulp-cache只压缩修改的图片
 */
gulp.task('cacheTask', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(changed('dist/img'))
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
})

/**
 * 使用gulp-clean-css压缩css文件
 */
gulp.task('cssminTask', function() {
    var option = {
        advanced: true,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
        compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
        keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
        keepSpecialComments: '*'//保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    }
    gulp.src('src/css/*.css')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(cssmin(option)) // 压缩css
		.pipe(gulp.dest('dist/css')) // 将会在dist/css下生成index.css
})

/**
 * 使用gulp-make-css-url-version给css文件里引用url加版本号
 */
gulp.task('cssverTask', function () {
    gulp.src('src/css/*.css')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(sourcemaps.init()) // 执行sourcemaps
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(cssver()) //给css文件里引用文件加版本号（文件MD5）
        .pipe(cssmin())
        .pipe(sourcemaps.write('./')) // 地图输出路径（存放位置）
        .pipe(gulp.dest('dist/css'));
})

/**
 * 使用gulp-uglify压缩javascript文件，减小文件大小。
 */
gulp.task('uglifyTask', function () {
    gulp.src(['src/js/*.js', '!src/js/**/scrollspy.js'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(changed('dist/js')) // 对应匹配的文件
        .pipe(sourcemaps.init()) // 执行sourcemaps
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(uglify()) // 使用uglify进行压缩，并保留部分注释
        .pipe(sourcemaps.write('./')) // 地图输出路径（存放位置）
        .pipe(gulp.dest('dist/js'));
});

/**
 * 使用gulp-concat合并javascript文件，减少网络请求。
 */
gulp.task('concatTask', function () {
    gulp.src(['dist/js/*.js'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) // 错误提示
        .pipe(concat('concatLibs.js')) // 合并成libs.js
        .pipe(rename({ suffix: '.min' })) // 重命名
        .pipe(gulp.dest('dist/js'))
})

/**
 * 文件复制
 */
gulp.task('copyTask', function () {
    gulp.src('src/fonts/*')
        .pipe(gulp.dest('dist/fonts'))
})

/**
 * 清理文件
 */
gulp.task('cleanTask', function() {
    var stream = gulp.src( 'dist', {read: false} ) // 清理maps文件
        .pipe(clean())
    return stream
})

/**
 * 注册任务
 */
gulp.task('webserver', ['htmlminTask'], function() {
    gulp.src( 'dist' ) // 服务器目录（./代表根目录）
    .pipe(webserver({ // 运行gulp-webserver
      livereload: true, // 启用LiveReload
      open: 'index.html', // 服务器启动时自动打开网页
      port: 8089 // 服务端口
    }))
})

/**
 * 监听任务
 */
gulp.task('watch', function(){
    // 监听 less
    gulp.watch( 'src/less/*.less' , ['lessTask'])
    // 监听 html
    gulp.watch( 'src/*.html' , ['htmlminTask'])
    // 监听 images
    gulp.watch( 'src/img/*.{png,jpg,gif,ico}' , ['pngquantTask'])
    // 监听 js
    gulp.watch( ['src/js/*.js','!src/js/*.min.js'] , ['uglifyTask'])
    // 监听 css
    gulp.watch( 'src/css/*.css' , ['cssverTask'])
})

/**
 * 默认任务
 */
gulp.task('default',[ 'htmlminTask', 'copyTask', 'cssverTask', 'uglifyTask', 'cacheTask', 'lessTask', 'webserver', 'watch'])
