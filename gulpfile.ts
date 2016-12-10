import * as gulp from "gulp";
import {default as tslintPlugin} from "gulp-tslint";
import * as ts from "gulp-typescript";
import * as gulpCopy from "gulp-copy";
import * as sourceMaps from "gulp-sourcemaps";
import * as del from "del";
import * as ForeverMonitor from "forever-monitor";
// TODO Manually fixed bugs in index.d.ts for gulp-typescript and run-sequence

import {CLIENT, SERVER, LANG_LIST} from "./common/config";

type WatchEvent = {
    type: string;
    path: string;
}
type pathsObj = {
    tsFileList: string[],
    jsMapFileList?: string[],
    libs?: string[],
    node_modules: string
};
type FilePaths = {
    filePathSrc: string;
    filePathBuild: string;
};

const
    nodeProcess = new (ForeverMonitor.Monitor)(SERVER.BUILD_PATH + "/" + SERVER.APP_PATH, {
        max: 0,
        silent: false,
        args: []
    }),
    tsProject = ts.createProject(CLIENT.SRC_ROOT_PATH + "/tsconfig.json"),
    tsProjectServer = ts.createProject(SERVER.SRC_ROOT_PATH + "/tsconfig.json"),
    getResourceFileListFromTsProject = (sourceFileList: string[]) => {
        let fileList: string[] = [];
        sourceFileList
            .filter(file => file.startsWith("./app/components/"))
            .forEach(file => fileList = fileList.concat(
                ["html", "css"].map(ext => file.substring(1, file.length - 2) + ext),
                LANG_LIST.map(lang => file.substring(1, file.lastIndexOf("/")) + "/i18n/" + lang + ".json")
            ));
        return fileList.map(file => CLIENT.SRC_ROOT_PATH + file);
    },
    getTsFileListsFromTsProject = (sourceFileList: string[], scope: string) => sourceFileList
        .filter(file => file.startsWith(scope === "server" ? "./" : "./app/") && file.endsWith(".ts"))
        .map(file => (scope === "server" ? SERVER.SRC_ROOT_PATH : CLIENT.SRC_ROOT_PATH) + file.substring(1)),
    getFilePaths = (filePath: string, scope: string): FilePaths => {
        const
            projectSrcPath = scope == "server" ? SERVER.SRC_ROOT_PATH : CLIENT.SRC_ROOT_PATH,
            projectBuildPath = scope == "server" ? SERVER.BUILD_PATH : CLIENT.BUILD_PATH,
            filePathRelative = filePath.substring(filePath.indexOf(projectSrcPath) + projectSrcPath.length + 1, filePath.length);
        return {
            filePathSrc: projectSrcPath + "/" + filePathRelative,
            filePathBuild: projectBuildPath + "/" + filePathRelative.substring(0, filePathRelative.lastIndexOf("/"))
        };
    },
    pathsClient = {
        tsFileList: getTsFileListsFromTsProject(tsProject.config.files, "client"),
        common: "./common/**/*.ts",
        resources: getResourceFileListFromTsProject(tsProject.config.files),
        libs: [
            'core-js/**',
            'primeng/**',
            'systemjs/**',
            'reflect-metadata/**',
            'rxjs/**',
            'zone.js/**',
            '@angular/**'
        ],
        resourcesRoot: [
            "/systemjs.config.js",
            "/index.html",
            "/favicon.ico"
        ].map(item => CLIENT.SRC_ROOT_PATH + item),
        assets: CLIENT.SRC_ROOT_PATH + "/assets/**/*",
        node_modules: CLIENT.SRC_ROOT_PATH + "/node_modules/**"
    },
    pathsServer: pathsObj = {
        tsFileList: getTsFileListsFromTsProject(tsProjectServer.config.files, "server"),
        node_modules: SERVER.SRC_ROOT_PATH + "/node_modules/**"
    };

/**
 * Start server
 */
gulp.task("server-start", () => {
    nodeProcess.on('restart', function () {
        console.error('Forever restarting script for ' + nodeProcess.times + ' time');
    });
    return nodeProcess.start();
});

/**
 * Stop server
 */
gulp.task("server-stop", () => nodeProcess.stop());

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
    gulp
        .src(pathsClient.tsFileList)
        .pipe(tslintPlugin({formatter: "verbose"}))
        .pipe(tslintPlugin.report())
);

/**
 * Compile TypeScript files.
 */
gulp.task("compile-common", () => gulp
    .src(pathsClient.common)
    .pipe(ts(tsProject.config.compilerOptions))
    .pipe(gulp.dest(CLIENT.BUILD_PATH + "/common"))
);

/**
 * Compile TypeScript files.
 */
gulp.task("compile", [
    "tslint",
    "clean",
], () => tsProject
    .src()
    .pipe(sourceMaps.init())
    .pipe(ts(tsProject.config.compilerOptions))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest(CLIENT.BUILD_PATH)));

/**
 * Copy root resources
 */
gulp.task("resources-root", () => gulp.src(pathsClient.resourcesRoot).pipe(gulp.dest(CLIENT.BUILD_PATH)));

/**
 * Copy app resources
 */
gulp.task("resources", () => gulp.src(pathsClient.resources).pipe(gulpCopy(CLIENT.BUILD_PATH, {prefix: 1})));

/**
 * Copy assets
 */
gulp.task("assets", () => gulp.src(pathsClient.assets).pipe(gulp.dest(CLIENT.BUILD_PATH + "/assets")));

/**
 * Copy libs
 */
gulp.task("libs", () => gulp
    .src(pathsClient.libs, {cwd: pathsClient.node_modules})
    .pipe(gulp.dest(CLIENT.BUILD_PATH + "/node_modules")));

/**
 * Build client
 */
gulp.task("frontend-dev", [
    "compile",
    "compile-common",
    "resources",
    "resources-root",
    "assets",
    "libs"
]);

/**
 * Copy libs
 */
gulp.task("libs-server", () => gulp.src("**", {cwd: pathsServer.node_modules})
    .pipe(gulp.dest(SERVER.BUILD_PATH + pathsServer.node_modules)));

/**
 * Lint TypeScript files.
 */
gulp.task("tslint-server", () => gulp.src(pathsServer.tsFileList)
    .pipe(tslintPlugin({
        formatter: "verbose"
    }))
    .pipe(tslintPlugin.report()));

/**
 * Compile TypeScript files.
 */
gulp.task("compile-server", [
        "tslint-server"
    ], (cb) => tsProjectServer.src()
        .pipe(ts(tsProjectServer.config.compilerOptions))
        .pipe(gulp.dest(SERVER.BUILD_PATH))
);

/**
 * Build server
 */
gulp.task("build-server", [
    "compile-server",
    "libs-server"
], () => {
});

/**
 * Watch for changes in TypeScript, HTML, CSS and JSON files.
 */
gulp.task("watch-all", ["server-start"], () => { // TODO Check stopping task and stop server
    gulp.watch([pathsClient.common], ["compile-common"]).on("change", (event: WatchEvent) => {
        console.log("TypeScript file (common)", event.path, "has been changed. Compiling.");
    });
    gulp.watch(pathsClient.resourcesRoot, ["resources-root"]).on("change", (event: WatchEvent) => {
        console.log("Resource root file", event.path, "has been changed. Updating.");
    });
    gulp.watch(pathsClient.resources).on('change', (event: WatchEvent) => {
        console.log("Resource file", event.path, "has been changed. Updating.");
        gulp.src(event.path.substring(23, event.path.length)).pipe(gulpCopy(CLIENT.BUILD_PATH, {prefix: 1}));
    });
    gulp.watch(pathsClient.tsFileList)
        .on("change", (event: WatchEvent) => {
            console.log("TypeScript file (client)", event.path, "has been changed. Updating.");
            const filePaths = getFilePaths(event.path.replace(/\\/g, "/"), "client");
            return gulp.src(filePaths.filePathSrc)
                .pipe(ts(tsProject.config.compilerOptions))
                .pipe(gulp.dest(filePaths.filePathBuild));
        });
    return gulp.watch(pathsServer.tsFileList)
        .on("change", (event: WatchEvent) => {
            console.log("TypeScript file (server)", event.path, "has been changed. Updating.");
            const filePaths = getFilePaths(event.path.replace(/\\/g, "/"), "server");
            return gulp.src(filePaths.filePathSrc)
                .pipe(ts(tsProjectServer.config.compilerOptions))
                .pipe(gulp.dest(filePaths.filePathBuild))
                .once("end", () => nodeProcess.restart());
        })
});
