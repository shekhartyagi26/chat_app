var UTIL = require('../modules/generic');
var lodash = require('lodash');
var moment = require('moment');
var generatePassword = require('password-generator');
var ObjectID = require('mongodb').ObjectID;
var CONFIG = require('../config');

var geocoderProvider = 'google';
var httpAdapter = 'https';

var extra = {
    apiKey : CONFIG.GOOGLE_API_KEY,
    formatter: null
};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

module.exports = function (User) {
    //--start--USER GENERIC function------
    User.FN_unblock_user = function( info, callback ){
        var user_id = info.user_id;
        var unblock_user_id = info.unblock_user_id;
        
        User.update({
            id: new ObjectID( user_id )
        }, {
            '$pull': { 'blocked_users': new ObjectID( unblock_user_id ) }
        },{
            allowExtendedOperators: true 
        }, function (err, result) {
            if (err) {
                callback( false );
            } else {
                callback( true );
            }
        });
    }
    
    User.FN_get_user_by_id = function( userId, callback ){
        var where = {
            'where' : {
                'id' : new ObjectID( userId )
            }
        };
        User.find( where, function (err, result) {
            if( err ){
                callback( 0, 'error occurs', {});
            }else{
                if( result.length > 0 ){
                    result = result[0];
                    callback( 1, 'user found', result );
                }else{
                    callback( 0, 'no user found', {} );
                }
            }
        });
    };
    User.FN_get_user_status = function( info, callback ){
        var status = info.status;
        var last_seen = info.last_seen;
        
        var ret_status = 'offline';
        
        var away_time = 60 * 3; // 3 minutes
        
        if( typeof status != 'undefined' && typeof last_seen != 'udefined'){
            ret_status = status;
            if( last_seen != '' ){
                var server_time = UTIL.currentTimestamp();
                var time_diff = server_time - last_seen;
                if( time_diff > 0 && time_diff > away_time ){
                    ret_status = 'away';
                }
            }
        }
        callback( ret_status );
        
    };
    //--end--USER GENERIC function------
    
    
    //********************************* START REGISTER AND LOGIN **********************************
    User.register_login = function (action, action_type, social_id, platform, device_id, token, email_id, name, password, profile_image, gender, dob, currentTimestamp, callback) {
        var LIFE_OF_ACCESS_TOKEN = 60 * 60 * 24 * 1000;
        if (action && action_type && email_id) {
            if (typeof name == 'undefined' || name == '') {
                name = '';
            } else {
                name = name.toLowerCase();
            }
            if (typeof profile_image == 'undefined' || profile_image == '') {
                profile_image = '';
            }
            email_id = email_id.toLowerCase();
            where = {
                email: email_id
            };
            User.find({where: where}, function (err, result) {
                if (err) {
                    callback(null, 0, err, {});
                } else {
                    if (action == 'login_register') {
                        var resultSize = lodash.size(result);
                        if (resultSize > 0) {
                            result = result[0];
                            var r_verification_status = result.verification_status;
                            if (action_type == 'manual_register') {
                                callback(null, 0, 'Email id already exists.', {});
                            } else if (action_type == 'manual_login' || action_type == 'facebook' || action_type == 'google') {
                                if (action_type == 'facebook' || action_type == 'google') {
                                    result.createAccessToken(LIFE_OF_ACCESS_TOKEN, function (err, accessToken) {
                                        if (err) {
                                            callback(null, 0, 'Invalid login', {});
                                        } else {
                                            //--start-- update user device_id and token
                                            User.update( {email: email_id}, {
                                                device_id: device_id,
                                                token: token,
                                                status : 'online'
                                            }, function (err, result11) {
                                                if (err) {
                                                    callback(null, 0, err, {});
                                                } else {
                                                   var data = {
                                                        user_id: accessToken.userId,
                                                        access_token: accessToken.id,
                                                        name : result.name,
                                                        profile_image : result.profile_image,
                                                        room_background_image : result.room_background_image
                                                    };
                                                    callback(null, 1, 'Success login', data);
                                                }
                                            });
                                            //--end-- update user device_id and token
                                        }
                                    });
                                } else {
                                    if (r_verification_status == 0) {
                                        callback(null, 3, 'Please verify you account first', {});
                                    } else {
                                        //-START--get access token---------
                                        User.login({
                                            email: email_id,
                                            password: password,
                                            ttl: LIFE_OF_ACCESS_TOKEN
                                        }, function (err, accessToken) {
                                            if (err) {
                                                callback(null, 0, 'Invalid login', {});
                                            } else {
                                                //--start-- update user device_id and token
                                                User.update( {email: email_id}, {
                                                    device_id: device_id,
                                                    token: token,
                                                    status : 'online'
                                                }, function (err, result11) {
                                                    if (err) {
                                                        callback(null, 0, err, {});
                                                    } else {
                                                        var data = {
                                                            user_id: result.id,
                                                            access_token: accessToken.id,
                                                            name : result.name,
                                                            profile_image : result.profile_image,
                                                            room_background_image : result.room_background_image
                                                        };
                                                        callback(null, 1, 'Success login', data);
                                                    }
                                                });
                                                //--end-- update user device_id and token
                                            }
                                        })
                                        //-END----get access token---------
                                    }
                                }
                            }
                        } else {
                            if (action_type == 'manual_login') {
                                callback(null, 0, 'Email id not exists', {});
                            } else if (name == '') {
                                callback(null, 0, 'Name required', {});
                            } else if (action_type != 'facebook' && action_type != 'google' && (typeof password == 'undefined' || password == '')) {
                                callback(null, 0, 'Password required', {});
                            } else {
                                //random password when regsiter by facebook and google
                                if (action_type == 'facebook' || action_type == 'google') {
                                    password = UTIL.get_random_number();
                                }
                                password = password.toString();
                                var verification_status = 0;
                                var verification_code = UTIL.get_random_number();
                                verification_code = verification_code.toString();
                                if (action_type == 'facebook' || action_type == 'google') {
                                    verification_status = 1;
                                    verification_code = '';
                                }
                                User.create({
                                    verification_status: verification_status,
                                    verification_code: verification_code,
                                    registration_type: action_type,
                                    social_id: social_id,
                                    platform: platform,
                                    device_id: '',
                                    token: token,
                                    email: email_id,
                                    name: name,
                                    password: password,
                                    last_seen: '',
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp),
                                    profile_image: profile_image,
                                    profile_status: '',
                                    room_background_image : '',
                                    gender : gender,
                                    dob : dob,
                                }, function (err, user) {
                                    if (err) {
                                        callback(null, 0, err, {});
                                    } else {
                                        var user_id = user.id;
                                        var data = {
                                            user_id: user_id
                                        };
                                        if (action_type != 'facebook' && action_type != 'google') {
                                            data['show_verification'] = 1;
                                        }
                                        User.app.models.email.newRegisteration({email: email_id, name: name, verification_code: verification_code}, function () {
                                            //--send access token if register is via facebook or google
                                            if (action_type == 'facebook' || action_type == 'google') {
                                                user.createAccessToken(LIFE_OF_ACCESS_TOKEN, function (err, accessToken) {
                                                    if (err) {
                                                        callback(null, 0, 'Invalid login', {});
                                                    } else {
                                                        var data = {
                                                            user_id: accessToken.userId,
                                                            access_token: accessToken.id,
                                                            name : name,
                                                            profile_image : profile_image
                                                        };
                                                        callback(null, 1, 'Success Registration', data);
                                                    }
                                                });
                                            } else {
                                                callback(null, 1, 'Successful Registration', data);
                                            }
                                        });
                                    }
                                })
                            }
                        }
                    }
                }
            });
        }
        else {
            callback(null, 0, 'Fill All fileds', {});
        }
    };
    User.remoteMethod(
            'register_login', {
                accepts: [
                    {arg: 'action', type: 'string'},
                    {arg: 'action_type', type: 'string'},
                    {arg: 'social_id', type: 'string'},
                    {arg: 'platform', type: 'string'},
                    {arg: 'device_id', type: 'string'},
                    {arg: 'token', type: 'string'},
                    {arg: 'email', type: 'string'},
                    {arg: 'name', type: 'string'},
                    {arg: 'password', type: 'string'},
                    {arg: 'profile_image', type: 'string'},
                    {arg: 'gender', type: 'string'},
                    {arg: 'dob', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END REGISTER AND LOGIN ************************************    

//********************************* START USER VERIFICATIION **********************************
    User.do_user_verification = function (email_id, code, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err, {});
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'Email Id not exists', {});
                } else {
                    result = result[0];
                    verification_status = result['verification_status'];
                    exist_code = result['verification_code'];
                    if (verification_status == 1) {
                        callback(null, 0, 'Already verified.', {});
                    } else if (exist_code != code) {
                        callback(null, 0, 'Verification failed.', {});
                    } else {
                        User.update({email: email_id}, {
                            verification_status: 1,
                            verification_code: ''
                        }, function (err, result) {
                            if (err) {
                                callback(null, 0, err, {});
                            } else {
                                callback(null, 1, 'Verified!! You can login now', {});
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'do_user_verification', {
                accepts: [
                    {arg: 'email', type: 'string'},
                    {arg: 'code', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END USER VERIFICATION **********************************

//********************************* START RESEND VERIFICATION CODE **********************************
    User.resend_verification_code = function (email_id, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err, {});
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'Email Id not exists', {});
                } else {
                    result = result[0];
                    verification_status = result['verification_status'];
                    if (verification_status == 1) {
                        callback(null, 0, 'Already verified.', {});
                    } else {
                        new_verification_code = UTIL.get_random_number();
                        new_verification_code = new_verification_code.toString();
                        User.update({email: email_id}, {
                            verification_code: new_verification_code
                        }, function (err, result) {
                            if (err) {
                                callback(null, 0, err, {});
                            } else {
                                User.app.models.email.resendVerification({email: email_id, verification_code: new_verification_code}, function () {
                                    callback(null, 1, 'Check your email for new verification code', {});
                                });
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'resend_verification_code', {
                accepts: [
                    {arg: 'email', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END RESEND VERIFICATION CODE **********************************



//********************************* START FORGET PASSWORD **********************************
    User.forgot_password = function (email_id, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err);
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'You should get a new password on your email address, if you have an account with us.');
                } else {
                    result = result[0];
                    new_password = generatePassword(4, false);
                    new_password = new_password.toString();
                    UTIL.encode_password(new_password, function (hash_password) {
                        User.update({email: email_id}, {
                            password: hash_password
                        }, function (err, result) {
                            if (err) {
                                callback(null, err);
                            } else {
                                User.app.models.email.forgotPassword({email: email_id, new_password: new_password}, function () {
                                    callback(null, 1, 'You will get a new password on your email address, if you have an account with us.');
                                });
                            }
                        });
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'forgot_password', {
                accepts: [
                    {arg: 'email', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'}
                ]
            }
    );
//********************************* END FORGET PASSWORD **********************************

//********************************* START RESET PASSWORD **********************************
    User.reset_password = function (req, password, callback) {
        var access_token_userid = req.accessToken.userId;
        User.findById(access_token_userid, function (err, user) {
            if (err) {
                callback(null, 0, 'UnAuthorized', {});
            } else {
                user.updateAttribute('password', password, function (err, user) {
                    if (err) {
                        callback(null, 0, 'Error', {});
                    } else {
                        callback(null, 1, 'Password updated successfully', {});
                    }
                });
            }
        });
    };
    User.remoteMethod(
            'reset_password', {
                accepts: [
                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'password', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END RESET PASSWORD **********************************

//********************************* START LIST OF ALL USERS **********************************
    User.list_users = function ( accessToken, page, limit, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    if (lodash.isUndefined(page) && lodash.isUndefined(limit)) {
                        callback(null, 0, 'Invalid Request Parameters', {});
                    }
                    else {
                        var num = 0;
                        num = page * 1;
                        User.findById(access_token_userid, function (err, user) {
                            if (err) {
                                callback(null, 0, 'UnAuthorized 1', err);
                            } else {
                                var geo_long_logged_user = geo_lat_logged_user = '';
                                if( typeof user.geo_location != 'undefined' && user.geo_location.length == 2 ){
                                    geo_long_logged_user = user.geo_location[0];
                                    geo_lat_logged_user = user.geo_location[1];
                                }
                                
                                var users_withn_distance = 1000 * 0.621371;// miles to km //1 km
                                var where = {
                                    id: {neq: access_token_userid},
                                    verification_status: 1*1,
                                    friends : { 'nin' : [access_token_userid] },
                                    blocked_users : { 'nin' : [access_token_userid] },
                                };
                                if( typeof user.geo_location != 'undefined' && user.geo_location.length == 2 ){
                                    var user_long = user.geo_location[0];
                                    var user_lat = user.geo_location[1];
                                    where.geo_location = { geoWithin: { $centerSphere: [ [ user_long, user_lat ], users_withn_distance / 3963.2 ] } };
                                }
                                User.find({
                                    where: where,
                                    limit: limit,
                                    skip: num * limit,
                                    //order: 'last_seen DESC',
                                }, function (err, result) {
                                    if (err) {
                                        callback(null, 0, 'Try Again', err);
                                    }
                                    else {
                                        var userInfo = [];
                                        if (result.length > 0) {
                                            lodash.forEach(result, function (value) {
                                                var userName = value.name;
                                                var userId = value.id;
                                                var pic = value.profile_image;
                                                var lastSeen = value.last_seen;
                                                var geo_city = geo_address = geo_state = geo_country = '';
                                                var gender = dob = '';
                                                if( typeof value.gender != 'undefined' ){
                                                    gender = value.gender;
                                                }
                                                if( typeof value.dob != 'undefined' ){
                                                    dob = value.dob;
                                                }
                                                if( typeof value.geo_city != 'undefined' ){
                                                    geo_city = value.geo_city;
                                                }
                                                if( typeof value.geo_address != 'undefined' ){
                                                    geo_address = value.geo_address;
                                                }
                                                if( typeof value.geo_state != 'undefined' ){
                                                    geo_state = value.geo_state;
                                                }
                                                if( typeof value.geo_country != 'undefined' ){
                                                    geo_country = value.geo_country;
                                                }
                                                var geo_long_user = geo_lat_user = '';
                                                if( typeof value.geo_location != 'undefined' && value.geo_location.length == 2 ){
                                                    geo_long_user = value.geo_location[0];
                                                    geo_lat_user = value.geo_location[1];
                                                }
                                                
                                                var distance_from_logged_user = '';
                                                
                                                if( geo_long_logged_user != '' && geo_lat_logged_user != '' &&  geo_long_user != '' && geo_lat_user != '' ){
                                                    distance_from_logged_user = UTIL.get_distance( geo_lat_logged_user, geo_long_logged_user, geo_lat_user, geo_long_user );
                                                }
                                                if( distance_from_logged_user != ''){
                                                            distance_from_logged_user = distance_from_logged_user + ' Km';
                                                        }
                                                
                                                
                                                var aa = {
                                                    status : value.status,
                                                    last_seen : value.last_seen
                                                }
                                                status = '';
                                                User.FN_get_user_status( aa, function(s){
                                                    status = s;
                                                });
                                                userInfo.push({
                                                    name: userName, 
                                                    gender : gender,
                                                    dob : dob,
                                                    id: userId, 
                                                    pic: pic, 
                                                    lastSeen: lastSeen, 
                                                    status : status, 
                                                    geo_city : geo_city, 
                                                    geo_address : geo_address,
                                                    geo_country : geo_country,
                                                    geo_state : geo_state,
                                                    distance_from_logged_user : distance_from_logged_user
                                                    //distance_from_logged_user : distance_from_logged_user + 'Km Away from you'
                                                });
                                            });
                                            callback(null, 1, 'Users List', userInfo);
                                        }
                                        else {
                                            callback(null, 0, 'No Record Found', {});
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'list_users', {
                description: 'Show the list of all Users',
                accepts: [
                    //{arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'page', type: 'number'},
                    {arg: 'limit', type: 'number'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/list_users',
                }
            }
    );
//********************************* END LIST OF ALL USERS ************************************  

//********************************* START LAST SEEN **********************************
    User.last_seen = function ( accessToken, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            var server_time = UTIL.currentTimestamp();
                            user.updateAttributes({
                                'last_seen' : server_time,
                                'status' : 'online'
                            },function (err, user) {
                                if (err) {
                                    callback(null, 0, 'Error', {});
                                } else {
                                    callback(null, 1, 'Last seen updated successfully', {});
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'last_seen', {
                description: 'update last seen od user',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/last_seen',
                }
            }
    );
//********************************* END LAST SEEN **********************************

//********************************* START my profile ( logged user profile) **********************************
    User.my_profile = function ( accessToken, currentTimestamp, callback) {
        var Room = User.app.models.Room;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    
                    var where1 = {
                        'id' : new ObjectID( userId )
                    };
                    
                    //User.findById(userId, function (err, user) {
                    User.find({
                        "where": where1,
                        "include": [{
                            relation: 'blocked_users', 
                            scope: {
                                fields: ['name','profile_image','last_seen','status'],
                            }
                        }]
                    },function( err, user ){
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            
                            user = user[0];
                            
                            var user = user.toJSON();
                            var blocked_users = [];
                            if( typeof user.blocked_users != 'undefined' && user.blocked_users.length > 0 ){
                                blocked_users = user.blocked_users;
                            }
                            
                            Room.find({
                                'where':{
                                    room_users : {'all':[new ObjectID( userId )]}
                                }
                            },function( err1, rooms ){
                                if( err1 ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    var user_private_rooms = 0;
                                    var user_public_rooms = 0;
                                    if( rooms.length > 0 ){
                                        for( var k in rooms){
                                            r_type = rooms[k].room_type;
                                            if( r_type == 'public' ){
                                                user_public_rooms += 1;
                                            }else if( r_type == 'private' ){
                                                user_private_rooms += 1;
                                            }
                                        }
                                    }
                                    var USER_PROFILE = {
                                        'user_id' : user.id,
                                        'name' : user.name,
                                        'profile_image' : user.profile_image,
                                        'profile_status' : user.profile_status,
                                        'last_seen' : user.last_seen,
                                        'user_private_rooms' : user_private_rooms,
                                        'user_public_rooms' : user_public_rooms,
                                        'user_blocked_users' : blocked_users.length,
                                        'blocked_users' : blocked_users,
                                        'gender' : user.gender,
                                        'dob' : user.dob
                                    }
                                    callback(null, 1, 'User profile details', USER_PROFILE);
                                }
                            })
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'my_profile', {
                description: 'get logged user profile',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/my_profile',
                }
            }
    );
//********************************* END my profile ( logged user profile) **********************************


//********************************* START user profile ( any user profile on user_id basis ) **********************************
    User.get_user_profile = function ( accessToken, user_id, currentTimestamp, callback) {
        var Room = User.app.models.Room;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    User.find({
                        'where' : {
                            '_id' : new ObjectID( user_id )
                        }
                    }, function (err, results) {
                        if (err) {
                            callback(null, 0, 'try again', {});
                        } else {
                            if( results.length == 0 ){
                                callback(null, 0, 'No user Found', {});
                            }else{
                                user = results[0];
                                Room.find({
                                    'where':{
                                        room_users : {'all':[new ObjectID( user_id )]}
                                    }
                                },function( err1, rooms ){
                                    if( err1 ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        var user_private_rooms = 0;
                                        var user_public_rooms = 0;
                                        if( rooms.length > 0 ){
                                            for( var k in rooms){
                                                r_type = rooms[k].room_type;
                                                if( r_type == 'public' ){
                                                    user_public_rooms += 1;
                                                }else if( r_type == 'private' ){
                                                    user_private_rooms += 1;
                                                }
                                            }
                                        }
                                        var aa = {
                                            status : user.status,
                                            last_seen : user.last_seen
                                        }
                                        status = '';
                                        User.FN_get_user_status( aa, function(s){
                                            status = s;
                                        });
                                        var USER_PROFILE = {
                                            'user_id' : user.id,
                                            'name' : user.name,
                                            'profile_image' : user.profile_image,
                                            'profile_status' : user.profile_status,
                                            'last_seen' : user.last_seen,
                                            'user_private_rooms' : user_private_rooms,
                                            'user_public_rooms' : user_public_rooms,
                                            'status' : status,
                                            'gender' : user.gender,
                                            'dob' : user.dob
                                        }
                                        callback(null, 1, 'User profile details', USER_PROFILE);
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'get_user_profile', {
                description: 'get any user profile info',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'user_id', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/get_user_profile',
                }
            }
    );
//********************************* START user profile ( any user profile on user_id basis ) **********************************


//********************************* START logged in user can update his profile **********************************
    User.update_profile_status = function ( accessToken, status, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('profile_status', status, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            status : status
                                        }
                                        callback(null, 1, 'Status update', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_profile_status', {
                description: 'logged in user can update his profile status',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'status', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_status',
                }
            }
    );
//********************************* END logged in user can update his profile **********************************


//********************************* START Logout**********************************
    User.do_logout = function ( accessToken, currentTimestamp, callback) {
        var accessToken_original = accessToken;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.logout(accessToken_original, function(err) {
                        if( err ){
                            callback(null, 0, 'error occurs', {});
                        }else{
                            User.update({
                                id: new ObjectID( userId )
                            }, {
                                status : 'offline',
                                token : '',
                                device_id : ''
                            }, function (err, result) {
                                if (err) {
                                } else {
                                }
                            });
                            var d = {
                                user_id : userId
                            }
                            callback(null, 1, 'Success logout', d );
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'do_logout', {
                description: 'logout user',
                accepts: [
                    {arg: 'accessToken', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/do_logout',
                }
            }
    );
//********************************* END log out **********************************



//********************************* START logged in user can update his profile_image**********************************
    User.update_profile_image = function ( accessToken, image_url, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('profile_image', image_url, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            profile_image : image_url
                                        }
                                        callback(null, 1, 'Profile image updated', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_profile_image', {
                description: 'logged in user can update his profile image',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'image_url', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_image',
                }
            }
    );
//********************************* END logged in user can update his profile **********************************


//********************************* START logged in user can update his room background image ( images will be comman for all rooms )**********************************
    User.update_room_background_image = function ( accessToken, image_url, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('room_background_image', image_url, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            room_background_image : image_url
                                        }
                                        callback(null, 1, 'Background image updated', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_room_background_image', {
                description: 'logged in user can update his chat background image',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'image_url', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_image',
                }
            }
    );
//********************************* END logged in user can update his room background image ( images will be comman for all rooms )**********************************



    //********************************* START update geo location **********************************
    User.geo_location = function ( accessToken, geo_lat, geo_long, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            var server_time = UTIL.currentTimestamp();
                            var UPDATE_GEO_NAME = true;
                            var geo_location_details_update_time = '';
                            if( typeof user.geo_location_details_update_time != 'undefined' ){
                                geo_location_details_update_time = user.geo_location_details_update_time;
                                
                                time_diff = server_time - geo_location_details_update_time;
                                time_minutes = time_diff * 1  / 60 ;
                                if( time_minutes < 5 ){
                                    UPDATE_GEO_NAME = false;
                                }
                            }
                            user.updateAttributes({
                                'geo_location' :  [ geo_long * 1, geo_lat * 1 ]
                            },function (err, user) {
                                if (err) {
                                    callback(null, 0, 'Error', {});
                                } else {
                                    if( UPDATE_GEO_NAME == true ){
                                        geocoder.reverse({lat:geo_lat, lon:geo_long}).then(function(res) {
                                            var geo_city = geo_address = geo_state = geo_country = '';
                                            if( typeof res[0] != 'undefined' ){
                                                geo_res_data = res[0];
                                                if( typeof geo_res_data.city != 'undefined' ){
                                                    geo_city = geo_res_data.city;
                                                }
                                                if( typeof geo_res_data.formattedAddress != 'undefined' ){
                                                    geo_address = geo_res_data.formattedAddress;
                                                }
                                                if( typeof geo_res_data.country != 'undefined' ){
                                                    geo_country = geo_res_data.country;
                                                }
                                                if( typeof geo_res_data.administrativeLevels.level1long != 'undefined' ){
                                                    geo_state = geo_res_data.administrativeLevels.level1long;
                                                }
                                                if( geo_state == '' ){
                                                    if( typeof geo_res_data.administrativeLevels.level2long != 'undefined' ){
                                                        geo_state = geo_res_data.administrativeLevels.level2long;
                                                    }
                                                }
                                            }
                                            user.updateAttributes({
                                                'geo_location_details_update_time' : server_time,
                                                'geo_city' : geo_city,
                                                'geo_state' : geo_state,
                                                'geo_country' : geo_country,
                                                'geo_address' :geo_address,
                                                'geo_location_details' :  res
                                            },function (err, user) {
                                                if (err) {
                                                    callback(null, 1, 'Geo locations updated successfully', {});
                                                } else {
                                                    callback(null, 1, 'Geo locations updated successfully', {});
                                                }
                                            })
                                        }).catch(function(err) {
                                            callback(null, 1, 'Geo locations updated successfully', {});
                                        });
                                    }else{
                                        callback(null, 1, 'Geo locations updated successfully', {});
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'geo_location', {
                description: 'update geo locations of user',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'geo_lat', type: 'string'}, 
                    {arg: 'geo_long', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/geo_location',
                }
            }
    );
    //********************************* END update geo location **********************************
    
    
    //********************************* START unblock user **********************************
    User.unblock_user = function ( accessToken, user_id, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            var unblock_data = {
                                user_id : userId,
                                unblock_user_id : user_id
                            }
                            User.FN_unblock_user( unblock_data, function( ret ){
                                if( ret == false ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    callback(null, 1, 'Successfully unblocked', {} );
                                }
                            })
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'unblock_user', {
                description: 'update geo locations of user',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'user_id', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/unblock_user',
                }
            }
    );
    //********************************* END update geo location **********************************
    




};
