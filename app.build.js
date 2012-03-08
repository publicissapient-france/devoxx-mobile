({
   //The top level directory that contains your app. If this option is used
   //then it assumed your scripts are in a subdirectory under this path.
   //This option is not required. If it is not specified, then baseUrl
   //below is the anchor point for finding things. If this option is specified,
   //then all the files from the app directory will be copied to the dir:
   //output area, and baseUrl will assume to be a relative path under
   //this directory.
   appDir: "./",
    
    //By default, all modules are located relative to this path. If baseUrl
    //is not explicitly set, then all modules are loaded relative to
    //the directory that holds the build file. If appDir is set, then
    //baseUrl should be specified as relative to the appDir.    appDir: "./",
    baseUrl: "./javascript",

    //The directory path to save the output. If not specified, then
    //the path will default to be a directory called "build" as a sibling
    //to the build file. All relative paths are relative to the build file.
    dir: "./target",

    //Set paths for modules. If relative paths, set relative to baseUrl above.
    //If a special value of "empty:" is used for the path value, then that
    //acts like mapping the path to an empty file. It allows the optimizer to
    //resolve the dependency to path, but then does not include it in the output.
    //Useful to map module names that are to resources on a CDN or other
    //http: URL when running in the browser and during an optimization that
    //file should be skipped because it has no dependencies.
    paths: {
        'text':        'lib/require/require.text-1.0.2',
        'order':       'lib/require/require.order-1.0.5',
        'core':        'core',
        'utils':       'utils',
        'ui':          'ui',
        'db':          'db',
        'log':         'log',
        'collection':  'collection',
        'entry':       'entry',
        'register':    'register',
        'analytics':   'analytics',
        'jquery':      'lib/jquery/jquery-1.7.1',
        'underscore':  'lib/underscore/underscore-1.3.1',
        'backbone':    'lib/backbone/backbone-0.9.1',
        'jqmr':        'lib/jquerymobile/jquery.mobile.router-0.6',
        'jqm':         'lib/jquerymobile/jquery.mobile-1.1.0-rc.1'
    },


    //How to optimize all the JS files in the build output directory.
    //Right now only the following values
    //are supported:
    //- "uglify": (default) uses UglifyJS to minify the code.
    //- "closure": uses Google's Closure Compiler in simple optimization
    //mode to minify the code. Only available if running the optimizer using
    //Java.
    //- "closure.keepLines": Same as closure option, but keeps line returns
    //in the minified files.
    //- "none": no minification will be done.
    optimize: "none",

    //If using UglifyJS for script optimization, these config options can be
    //used to pass configuration values to UglifyJS.
    //See https://github.com/mishoo/UglifyJS for the possible values.
//    uglify: {
//        toplevel: true,
//        ascii_only: true,
//        beautify: true
//    },

    //Allow CSS optimizations. Allowed values:
    //- "standard": @import inlining, comment removal and line returns.
    //Removing line returns may have problems in IE, depending on the type
    //of CSS.
    //- "standard.keepLines": like "standard" but keeps line returns.
    //- "none": skip CSS optimizations.
    optimizeCss: "standard.keepLines",

    //Inlines the text for any text! dependencies, to avoid the separate
   //async XMLHttpRequest calls to load those dependencies.
   inlineText: true,


    //When the optimizer copies files from the source location to the
    //destination directory, it will skip directories and files that start
    //with a ".". If you want to copy .directories or certain .files, for
    //instance if you keep some packages in a .packages directory, or copy
    //over .htaccess files, you can set this to null. If you want to change
    //the exclusion rules, change it to a different regexp. If the regexp
    //matches, it means the directory will be excluded. This used to be
    //called dirExclusionRegExp before the 1.0.2 release.
    //As of 1.0.3, this value can also be a string that is converted to a
    //RegExp via new RegExp().
    fileExclusionRegExp: /^(.*require-1\.0\.5\.js|target|.*\.min\.css|.*\.min\.js|r\.js|app\.build\.js|.*phonegap.*\.js|.*json.*\.js|.*date.*\.js|.*lawnchair.*\.js|\.idea|\.git|\.gitignore|data|README)$/,

    modules: [
        {
            name: "app"
        }
    ]
})