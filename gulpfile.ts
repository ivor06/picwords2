import {CLIENT} from "./common/config";
import * as gulp from "gulp";
import {default as tslintPlugin, TslintPlugin} from "gulp-tslint";
import * as ts from "gulp-typescript";
import * as del from "del";

const tsProject = ts.createProject(CLIENT.SRC_ROOT_PATH + "/tsconfig.json");

/**
 * Clean builded project.
 */
gulp.task("clean", () =>
    del.sync([
        CLIENT.BUILD_PATH + "/app/*.*",
        CLIENT.BUILD_PATH + "/common/*.*"
    ])
);

/**
 * Lint TypeScript files.
 */
gulp.task("tslint", () =>
    gulp.src(CLIENT.SRC_ROOT_PATH + "/app/*.ts")
        .pipe(tslintPlugin({
            formatter: "verbose"
        }))
        .pipe(tslintPlugin.report())
);

/**
 * Compile TypeScript files.
 */
gulp.task("compile-common", () => {
    gulp.src("./common/**/*.ts")
        .pipe(ts(tsProject.config.compilerOptions))
        .pipe(gulp.dest(CLIENT.BUILD_PATH + "/common"));
});

/**
 * Compile TypeScript files.
 */
gulp.task("compile", [
    "tslint",
    "clean",
    "compile-common"
], () => {
    const tsResult = tsProject.src()
        .pipe(ts(tsProject.config.compilerOptions));
    return tsResult.pipe(gulp.dest(CLIENT.BUILD_PATH));
});

/**
 * Copy all resources
 */
gulp.task("resources", () => gulp.src([
    "/systemjs.config.js",
    "/**/*.html",
    "/**/*.css",
    "/**/*.json",
    "/**/*.svg",
    "/**/*.ico"
].map(item => CLIENT.SRC_ROOT_PATH + item))
    .pipe(gulp.dest(CLIENT.BUILD_PATH)));

gulp.task("libs", () => gulp.src([
    'core-js/client/shim.min.js',
    'core-js/client/shim.min.js.map',
    'systemjs/dist/system-polyfills.js',
    'systemjs/dist/system.src.js',
    'reflect-metadata/Reflect.js',
    'reflect-metadata/Reflect.js.map',
    'rxjs/**',
    'zone.js/dist/**',
    '@angular/**'
    ], {cwd: CLIENT.SRC_ROOT_PATH + "/node_modules/**"})
    .pipe(gulp.dest(CLIENT.BUILD_PATH + "/node_modules")));

/**
 * Build client
 */
gulp.task("frontend-dev", [
    "compile",
    "resources",
    "libs"
]);

/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch', ["frontend-dev"], () => {
    gulp.watch([CLIENT.SRC_ROOT_PATH + "/**/*.ts", "./gulpfile.ts"], ["frontend-dev"]).on('change', (e: any) => {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
    gulp.watch([CLIENT.SRC_ROOT_PATH + "/**/*.html", CLIENT.SRC_ROOT_PATH + "/**/*.css"], ['resources']).on('change', (e: any) => {
        console.log('Resource file ' + e.path + ' has been changed. Updating.');
    });
});
