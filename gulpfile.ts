import {CLIENT} from "./common/config";
import * as gulp from "gulp";
import * as gulpTsLint from "gulp-tslint";
import * as ts from "gulp-typescript";
import * as del from "del";
//import * as uglify from "gulp-uglify";

const tsProject = ts.createProject(CLIENT.SRC_ROOT_PATH + "/tsconfig.json");

/**
 * Clean builded project.
 */
gulp.task("clean", () =>
    del.sync(CLIENT.BUILD_PATH)
);

/**
 * Lint TypeScript files.
 */
gulp.task("tslint", () =>
    gulp.src(CLIENT.SRC_ROOT_PATH + "/app/*.ts")
        .pipe(gulpTsLint())
        .pipe(gulpTsLint.report())
);

/**
 * Compile TypeScript files.
 */
gulp.task("compile", () => {
    const tsResult = tsProject.src()
        .pipe(ts(tsProject.config.compilerOptions));

    return tsResult.pipe(gulp.dest(CLIENT.BUILD_PATH));
});

// gulp.task("systemjs", () => {
//     return gulp.src([CLIENT.SRC_ROOT_PATH + "/systemjs.config.js"], {})
//         .pipe(gulp.dest(CLIENT.BUILD_PATH));
// });

/**
 * Copy all resources
 */
gulp.task("resources", () => gulp.src([
    "/systemjs.config.js",
    "/**/*.html",
    "/**/*.css",
    "/**/*.ico"
].map(item => CLIENT.SRC_ROOT_PATH + item))
    .pipe(gulp.dest(CLIENT.BUILD_PATH)));

gulp.task("libs", () => gulp.src([
    'core-js/client/shim.min.js',
    'systemjs/dist/system-polyfills.js',
    'systemjs/dist/system.src.js',
    'reflect-metadata/Reflect.js',
    'rxjs/**',
    'zone.js/dist/**',
    '@angular/**'
], {cwd: CLIENT.SRC_ROOT_PATH + "/node_modules/**"})
    .pipe(gulp.dest(CLIENT.BUILD_PATH + "/node_modules")));

/**
 * Build client
 */
gulp.task("frontend-dev", ["clean", "compile", "resources", "libs"]);

/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch', () => {
    gulp.watch([CLIENT.SRC_ROOT_PATH + "/**/*.ts", "./gulpfile.ts"], ["compile"]).on('change', (e: any) => {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
    gulp.watch([CLIENT.SRC_ROOT_PATH + "/**/*.html", CLIENT.SRC_ROOT_PATH + "/**/*.css"], ['resources']).on('change', (e: any) => {
        console.log('Resource file ' + e.path + ' has been changed. Updating.');
    });
});

// gulp.task("default", () => gulp.src([CLIENT.SRC_ROOT_PATH + "/**/*.js"])
//     .pipe(gulp.dest(CLIENT.BUILD_PATH))
//     .pipe(uglify())
//     .pipe(rename({ extname: '.min.js' }))
//     .pipe(gulp.dest(CLIENT.BUILD_PATH)));
