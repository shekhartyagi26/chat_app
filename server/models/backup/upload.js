var UTIL = require('../modules/generic');
var CONFIG = require('../config.json');
var BASE_URL = CONFIG.BASE_URL;
var CONTAINERS_URL = BASE_URL + '/api/containers/';

module.exports = function(File) {
    File.getApp(function(err, app){
        loopback = app.loopback;
        var ds = loopback.createDataSource({
            "name": "storage",
            "connector": "loopback-component-storage",
            "provider": "filesystem", 
            "root": "./uploads",
            "maxFileSize": "52428800",
            "getFilename": function (origFilename, req, res) {
                var origFilename = origFilename.name;
                var parts = origFilename.split('.');
                var extension = parts[parts.length-1];
                var newFilename = UTIL.currentTimestamp() + '.' + extension;
                return newFilename;
            }
        });
        var container = ds.createModel('container');
        app.model(container);
    });
    
    
    File.upload = function (ctx,options, callback ) {
        
        var Room = File.app.models.Room;
        var User = File.app.models.User;
        if(!options) options = {};
        if( typeof ctx.req.query.file_type == 'undefined' || typeof ctx.req.query.file_type == '' || typeof ctx.req.query.accessToken == 'undefined' || typeof ctx.req.query.accessToken == '' ){
            callback( null, 0, 'File type or accesstoken is not mentioned in url', {} );
        }else{
            var file_type = ctx.req.query.file_type;
            var accessToken = ctx.req.query.accessToken;
            var currentTimestamp = '';
            if( typeof ctx.req.query.currentTimestamp != 'undefined'){
                currentTimestamp = ctx.req.query.currentTimestamp;
            }
            
            
            var file_folder = false;
            if( file_type == 'profile_image' ){
                file_folder = 'images_profile';
            }else if( file_type == 'room_image' ){
                file_folder = 'images_room';
            }else if( file_type == 'room_background_image' ){
                file_folder = 'images_room_background';
            }else if( file_type == 'room_file' ){
                file_folder = 'files_room';
            }
            
            if( file_folder == false){
                callback( null, 0, 'file type is unknown', {} );
            }else{
                ctx.req.params.container = file_folder;
                File.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
                    if(err) {
                        callback( null, 0, 'error occurs', {} );
                    } else {
                        var fileInfo = fileObj.files.file[0];
                        var upload_file_url = CONTAINERS_URL+ file_folder + '/download/'+fileInfo.name;
                        File.create({
                            name: fileInfo.name,
                            type: fileInfo.type,
                            container: fileInfo.container,
                            url: upload_file_url
                        },function (err,obj) {
                            if (err !== null) {
                                callback( null, 0, 'error occurs', {} );
                            } else {
                                if( file_type == 'profile_image' ){
                                    User.update_profile_image(accessToken, upload_file_url, currentTimestamp, function( ignore_param, status, message, data ){
                                        if( status == 1 ){
                                            console.log( 'success upload and updated' );
                                            callback( null, 1, 'success upload and updated', obj );
                                        }else{
                                            console.log( 'success upload and fail to update' );
                                            callback( null, 0, 'success upload and fail to update', obj );
                                        }
                                    })
                                }
                                else if( file_type == 'room_image' ){
                                    if( typeof ctx.req.query.room_id == 'undefined' || typeof ctx.req.query.room_id == ''){
                                        callback( null, 0, 'room_id is not mentioned in url', obj );
                                    }else{
                                        room_id = ctx.req.query.room_id;
                                        Room.update_room_image(accessToken, room_id,upload_file_url, currentTimestamp, function( ignore_param, status, message, data ){
                                            if( status == 1 ){
                                                console.log( 'success upload and updated' );
                                                callback( null, 1, 'success upload and updated', obj );
                                            }else{
                                                console.log( 'success upload and fail to update' );
                                                callback( null, 0, 'success upload and fail to update', obj );
                                            }
                                        })
                                    }
                                }
                                else if( file_type == 'room_background_image' ){
                                    User.update_room_background_image(accessToken, upload_file_url, currentTimestamp, function( ignore_param, status, message, data ){
                                        if( status == 1 ){
                                            console.log( 'success upload and updated' );
                                            callback( null, 1, 'success upload and updated', obj );
                                        }else{
                                            console.log( 'success upload and fail to update' );
                                            callback( null, 0, 'success upload and fail to update', obj );
                                        }
                                    })
                                }
                                else if( file_type == 'room_file' ){
                                    
                                    console.log( '------------------------');
                                    console.log( '-------THIS IS ROOM FILE-----------------')
                                    console.log( '------------------------');
                                    console.log( obj );
                                    console.log( '------------------------');
                                    console.log( '------------------------');
                                    
                                    callback( null, 1, 'success upload', obj );
                                }
                                else{
                                    callback( null, 0, 'success upload but no use', {} );
                                }
                            }
                        });
                    }
                });
            }
        }
        
    };
    File.remoteMethod(
        'upload',{
            description: 'Uploads a file',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} }
            ],
            returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
            ],
            http: {verb: 'post'}
        }
    );
    
};