
define(['require', 'module', 'console_shim', 'modernizr', 'jquery', 'underscore', 'readerView', 'epub-fetch', 'epub-model/package_document_parser', 'epub-model/package_document', 'epub-fetch/iframe_zip_loader', 'epub-model/smil_document_parser', 'URIjs'],
    function (require, module, console_shim, Modernizr, $, _, readerView, ResourceFetcher, PackageParser, PackageDocument, IframeZipLoader, SmilParser, URI) {

    console.log('Readium module id: ' + module.id);

    //hack to make URI object global for readers consumption.
    window.URI = URI;

    var Readium = function(readiumOptions, readerOptions){

        var self = this;

        var _currentResourceFetcher;

        var _iframeZipLoader = new IframeZipLoader(ReadiumSDK, function() { return _currentResourceFetcher; });

        var jsLibRoot = readiumOptions.jsLibRoot;
        var renderingViewport = readerOptions.el;

        readerOptions.iframeLoader = _iframeZipLoader;

        this.reader = new ReadiumSDK.Views.ReaderView(readerOptions);

        this.openPackageDocument = function(bookRoot, callback, openPageRequest)  {

            _currentResourceFetcher = new ResourceFetcher(bookRoot, jsLibRoot);

            _currentResourceFetcher.initialize(function() {

                var _packageParser = new PackageParser(bookRoot, _currentResourceFetcher);

                _packageParser.parse(function(docJson){
                    SmilParser.fillSmilData(docJson, bookRoot, jsLibRoot, _currentResourceFetcher, function() {
                        var packageDocument = new PackageDocument(_currentResourceFetcher.getPackageUrl(), docJson, _currentResourceFetcher);
                        var openBookOptions = readiumOptions.openBookOptions || {};
                        var openBookData = $.extend(packageDocument.getPackageData(), openBookOptions);
                        if (openPageRequest) {
                            openBookData.openPageRequest = openPageRequest;
                        }
                        self.reader.openBook(openBookData);

                        var options = { 
                            packageDocumentUrl : _currentResourceFetcher.getPackageUrl(),
                            metadata: docJson.metadata
                        };

                        if (callback){
                            // gives caller access to document metadata like the table of contents
                            callback(packageDocument, options);
                        }
                    })
                });
            });
        };

        ReadiumSDK.trigger(ReadiumSDK.Events.READER_INITIALIZED, this.reader);
    };


    return Readium;

});
