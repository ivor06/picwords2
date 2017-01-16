(function () {
    System.config({
        // transpiler: 'typescript',
        typescriptOptions: {
            emitDecoratorMetadata: true
        },
        paths: {
            'npm:': 'node_modules/'
        },
        map: {
            app: 'app',
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
            'rx': 'npm:rx',
            'rxjs': 'npm:rxjs',
            'rx-dom': 'npm:rx-dom',
            'primeng': 'npm:primeng',
            'punycode': 'node_modules/punycode/punycode.js',
            'querystring': 'node_modules/querystring',
            'url': 'node_modules/url',
            'jsonschema': 'node_modules/jsonschema'
        },
        packages: {
            app: {
                main: './main.js',
                defaultExtension: 'js'
            },
            common: {
                defaultExtension: 'js'
            },
            libs: {
                defaultExtension: 'js'
            },
            rx: {
                main: './index.js',
                defaultExtension: 'js'
            },
            rxjs: {
                main: './Rx.js',
                defaultExtension: 'js'
            },
            "rx-dom": {
                main: './index.js',
                defaultExtension: 'js'
            },
            primeng: {
                defaultExtension: 'js'
            },
            punicode: {
                main: './punycode.js',
                defaultExtension: 'js'
            },
            querystring: {
                main: './index.js',
                defaultExtension: 'js'
            },
            url: {
                main: './url.js',
                defaultExtension: 'js'
            },
            jsonschema: {
                main: './lib/index.js',
                defaultExtension: 'js'
            }
        }
    });
})(window);