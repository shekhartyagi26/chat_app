var gcm = require('node-gcm');
var UTIL = require('../modules/generic');
var ObjectID = require('mongodb').ObjectID;
var CONFIG = require('../config.json');
var PUSH_sender = new gcm.Sender( CONFIG.GOOGLE_API_KEY );


module.exports = function (Pushmessage) {
    Pushmessage.disableRemoteMethod("create", true);
    Pushmessage.disableRemoteMethod("upsert", true);
    Pushmessage.disableRemoteMethod("updateAll", true);
    Pushmessage.disableRemoteMethod("updateAttributes", false);
    Pushmessage.disableRemoteMethod("find", true);
    Pushmessage.disableRemoteMethod("findById", true);
    Pushmessage.disableRemoteMethod("findOne", true);
    Pushmessage.disableRemoteMethod("deleteById", true);
    Pushmessage.disableRemoteMethod("login", true);
    Pushmessage.disableRemoteMethod("logout", true);
    Pushmessage.disableRemoteMethod("confirm", true);
    Pushmessage.disableRemoteMethod("count", true);
    Pushmessage.disableRemoteMethod("exists", true);
    Pushmessage.disableRemoteMethod("resetPassword", true);
    Pushmessage.disableRemoteMethod('createChangeStream', true);
    Pushmessage.disableRemoteMethod('__count__accessTokens', false);
    Pushmessage.disableRemoteMethod('__create__accessTokens', false);
    Pushmessage.disableRemoteMethod('__delete__accessTokens', false);
    Pushmessage.disableRemoteMethod('__destroyById__accessTokens', false);
    Pushmessage.disableRemoteMethod('__findById__accessTokens', false);
    Pushmessage.disableRemoteMethod('__get__accessTokens', false);
    Pushmessage.disableRemoteMethod('__updateById__accessTokens', false);
    //-------------------------------------------------------------
    //send push message
    Pushmessage.push_message = function( regTokens, message, callback){
        PUSH_sender.send( message, { registrationTokens: regTokens }, function (err, response) {
            if(err){
                callback( false, err );
            }else{
                if( response.success == 1 ){
                    callback( true, response );
                }else{
                    callback( false, response );
                }
            } 
        });
    };
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    //to get the final message ready for gcm
    Pushmessage.get_push_message_structure = function( type, info, callback ){
        if( type == 'room_message' ){
            var message = new gcm.Message();
//            message.addData('key1', 'msg1');
//            message.addData('title', 'Test Push');
//            message.addData('message', 'Push number 1');
//            message.addData('info', 'super secret info');
            
            message.addData('priority', 'high');
            message.addData('room_id', info.room_id );
            message.addData('title', info.message_owner_name );
            message.addData('icon', info.message_profile_image );
            message.addData('image', info.message_profile_image );
            message.addData('body', info.message_body );
            
            
//            var message = new gcm.Message({
//                //priority: 'high',
//                data: {
//                    priority: 'high',
//                    room_id: info.room_id,
//                    title: info.message_owner_name,
//                    icon: info.message_profile_image,
//                    body: info.message_body
//                },
////                notification: {
////                    title: info.message_owner_name,
////                    icon: info.message_profile_image,
////                    body: info.message_body
////                }
//            });
            callback( message );            
        }
        else if( type == 'private_room_created'){
            var message = new gcm.Message({
                priority: 'high',
                data: {
                    room_id: info.room_id
                },
                notification: {
                    title: info.name,
                    icon: info.profile_image,
                    body: 'Initiate a chat with you'
                }
            });
            callback( message );            
        }
        else if( type == 'remove_public_room_member'){
            var message = new gcm.Message({
                priority: 'high',
                data: {
                    room_id: info.room_id
                },
                notification: {
                    title: info.name,
                    icon: info.profile_image,
                    body: 'You are removed from room ' + info.room_id
                }
            });
            callback( message );            
        }
        else if( type == 'private_room_deleted'){
            var message = new gcm.Message();
            
            var message_body = info.name + ' ends chat with you';
            message.addData('priority', 'high');
            message.addData('title', info.name );
            message.addData('icon', info.profile_image );
            message.addData('image', info.profile_image );
            message.addData('body', message_body );
            callback( message );
        }
        else if( type == 'user_blocked'){
            var message = new gcm.Message();
            
            var message_body = info.name + ' blocked ';
            message.addData('priority', 'high');
            message.addData('title', info.name );
            message.addData('icon', info.profile_image );
            message.addData('image', info.profile_image );
            message.addData('body', message_body );
            callback( message );
        }
        else{
            callback( false);
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    //to insert a new info in push messagetable which will be used as for push message
    Pushmessage.create_push_message = function ( type, tokens, message_info, callback ) {
        var valid_type = [
            'room_message', // when user get a message and is not seen at the time of push message
            'private_room_created', // when user A create a private message with user B,  push message will be sent to user B
            'remove_public_room_member', // when a user is removed from public group by admin, push message will be sent to removed user
            'private_room_deleted', // when any user of a private room delete a room, push message will be sent to another user
            'user_blocked' // when any user of a private room block user, push message will sent to another user
        ];
        if( valid_type.indexOf(type) == -1 ){
            callback(null, 0, 'Invalid type', {});
        }else{
            var TOKENS = [];
            if( tokens != '' && tokens.length > 0 ){
                TOKENS = tokens;
            }
            var new_push_message = new Pushmessage({
                'type' : type,
                'message_info' : message_info,
                'tokens' : TOKENS,
                'STATUS_push_message' : 0*1,
                'STATUS_response_push_message' : '',
                'created_on' : UTIL.currentTimestamp(),
                'created_on_date_time' : UTIL.currentDateTimeDay(),
                'processed_on' : '',
                'processed_on_date_time' : '',
            });
            new_push_message.save( function(err){
                if( err ){
                    callback(null, 0, 'try again', {});
                }else{
                    var push_message_id = new_push_message.id;
                    var data = {
                        'type' : type,
                        'push_message_id' : push_message_id,
                    };
                    callback(null, 1, 'Push message created', data);
                }
            });
        }
    };
    Pushmessage.remoteMethod(
            'create_push_message', {
                description: 'Create new push message',
                accepts: [
                    {arg: 'type', type: 'string'}, 
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/create_push_message',
                }
            }
    );
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    Pushmessage.start_pushing = function( DATA, callback ){
        console.log("\n");
        console.log("\n");
        console.log("\n");
        console.log( 'Pending for Push Message :: ' + DATA.length );
        console.log("\n");
        if( DATA.length == 0 ){
            callback();
        }else{
            var Message = Pushmessage.app.models.Message;
            var pm_data = DATA[0];
            DATA.shift();
            
            var pm_mongo_id = pm_data.id;
            
            var pm_type = pm_data['type'];
            if( pm_type == 'room_message' ){
                var pm_message_id = pm_data.message_info.message_id;
                Message.find( {
                    "where" : {
                        '_id' : new ObjectID( pm_message_id )
                    }
                }, function (err, results) {
                    if( err ){
                        Pushmessage.start_pushing( DATA, callback );
                    }else{
                        if( results.length == 0 ){
                            Pushmessage.start_pushing( DATA, callback );
                        }else{
                            result = results[0];
                            if( result.message_status == 'seen' ){
                                Pushmessage.update({
                                    _id : new ObjectID( pm_mongo_id )
                                },{
                                    'STATUS_push_message': 1*1,
                                    'STATUS_response_push_message' : 'Message is already seen',
                                    'processed_on' : UTIL.currentTimestamp(),
                                    'processed_on_date_time' : UTIL.currentDateTimeDay()
                                },function (err, result2) {
                                    if (err) {
                                        Pushmessage.start_pushing( DATA, callback );
                                    } else {
                                        Pushmessage.start_pushing( DATA, callback );
                                    }
                                });
                                
                            }else{
                                pm_data_info =  pm_data.message_info;
                                pm_data_tokens = pm_data.tokens;
                                Pushmessage.get_push_message_structure( pm_type, pm_data_info, function( gcm_message ){
                                    if( gcm_message == false ){
                                        Pushmessage.start_pushing( DATA, callback );
                                    }else{
                                        Pushmessage.push_message( pm_data_tokens, gcm_message, function( gcm_status, gcm_response ){
                                            Pushmessage.update({
                                                _id : new ObjectID( pm_mongo_id )
                                            },{
                                                'STATUS_push_message': 1*1,
                                                'STATUS_response_push_message' : gcm_response,
                                                'processed_on' : UTIL.currentTimestamp(),
                                                'processed_on_date_time' : UTIL.currentDateTimeDay()
                                            },function (err, result2) {
                                                if (err) {
                                                    Pushmessage.start_pushing( DATA, callback );
                                                } else {
                                                    Pushmessage.start_pushing( DATA, callback );
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
            }
            else if( pm_type == 'private_room_deleted' || pm_type == 'remove_public_room_member' || pm_type == 'private_room_created'){
                pm_data_info =  pm_data.message_info;
                pm_data_tokens = pm_data.tokens;
                Pushmessage.get_push_message_structure( pm_type, pm_data_info, function( gcm_message ){
                    if( gcm_message == false ){
                        Pushmessage.start_pushing( DATA, callback );
                    }else{
                        Pushmessage.push_message( pm_data_tokens, gcm_message, function( gcm_status, gcm_response ){
                            Pushmessage.update({
                                _id : new ObjectID( pm_mongo_id )
                            },{
                                'STATUS_push_message': 1*1,
                                'STATUS_response_push_message' : gcm_response,
                                'processed_on' : UTIL.currentTimestamp(),
                                'processed_on_date_time' : UTIL.currentDateTimeDay()
                            },function (err, result2) {
                                if (err) {
                                    Pushmessage.start_pushing( DATA, callback );
                                } else {
                                    Pushmessage.start_pushing( DATA, callback );
                                }
                            });
                        });
                    }
                });
            }
            else{
                Pushmessage.start_pushing( DATA, callback );
            }
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    //cron url to start pushing messages, by getting records fron pushmessage collection
    Pushmessage.cron_push_message = function ( callback ) {
        console.log('CRON :: cron_push_message');
        var Message = Pushmessage.app.models.Message;
        Pushmessage.find(  {
            "where" : {
                'STATUS_push_message' : 0*1,
            },
            "limit" : 5
        },function (err, results) {
            if( err ){
                console.log( err );
                console.log('error hai');
            }else{
                if( results.length > 0 ){
                    Pushmessage.start_pushing( results, function(){
                        callback(null, 1, 'All are done', {} );
                    });
                }else{
                    callback(null, 1, '0 Pending.', {} );
                }
            }
        });
    };
    Pushmessage.remoteMethod(
            'cron_push_message', {
                description: 'Create new push message',
                accepts: [
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'get', path: '/cron_push_message',
                }
            }
    );
};
