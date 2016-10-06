var socketio = require('socket.io');
module.exports.listen = function (app) {
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;

    function list_my_rooms(accessToken, room_type, currentTimestamp, callback) {
        Room.list_my_rooms(accessToken, room_type, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        });
    }
    function create_room(accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, callback) {
        Room.create_room(accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        });
    }
    function FN_join_public_room(accessToken, room_id, currentTimestamp, callback) {
        Room.join_public_room(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_admin_add_user_to_public_room(accessToken, room_id, to_be_add_user_id, currentTimestamp, callback) {
        Room.admin_add_user_to_public_room(accessToken, room_id, to_be_add_user_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_leave_public_group(accessToken, room_id, currentTimestamp, callback) {
        Room.leave_public_group(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_remove_public_room_member(accessToken, room_id, user_id, currentTimestamp, callback) {
        Room.remove_public_room_member(accessToken, room_id, user_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, callback) {
        Room.room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var broadcast_data = {};
            var user_data = {};
            if (res_status == 1) {
                var broadcast_data = {
                    'room_id': room_id,
                    'message_id': res_data.message_id,
                    'message_status': res_data.message_status,
                    'name': res_data.name,
                    'profile_image': res_data.profile_image,
                    'message_type': res_data.message.type,
                    'message_body': res_data.message.body,
                    'message_time': res_data.message_time,
                };
                var user_data = {
                    'msg_local_id': res_data.msg_local_id,
                    'room_id': room_id,
                    'message_id': res_data.message_id,
                    'message_status': res_data.message_status,
                    'message_time': res_data.message_time,
                    'message_body': res_data.message.body,
                    'userId': res_data.new_message.userId,
                };
            }
            var response = {
                'status': res_status,
                'message': res_message,
                'data': {
                    'broadcast_data': broadcast_data,
                    'user_data': user_data
                }
            };
            console.log(response);
            callback(response);
        })
    }
    function FN_add_socket_to_room_and_user(info, callback) {
        var accessToken = info.accessToken;
        var room_id = info.room_id;
        var socket_id = info.socket_id;
        Room.FN_add_socket_to_room_and_user(info, function (ignore_param, res_status, res_message, res_data) {
            response = {
                status: res_status,
                message: res_message,
                data: res_data
            }
            callback(response);
        })
    }
    function FN_delete_public_room(accessToken, room_id, currentTimestamp, callback) {
        Room.delete_public_room(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_get_user_profile(accessToken, user_id, currentTimestamp, callback) {
        User.get_user_profile(accessToken, user_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_do_logout(accessToken, currentTimestamp, callback) {
        User.do_logout(accessToken, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_get_user_room_unread_messages(accessToken, room_id, currentTimestamp, callback) {
        Room.get_user_room_unread_messages(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_delete_private_room(accessToken, room_id, currentTimestamp, callback) {
        Room.delete_private_room(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_block_private_room(accessToken, room_id, currentTimestamp, callback) {
        Room.block_private_room(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_unblock_user(accessToken, user_id, currentTimestamp, callback) {
        User.unblock_user(accessToken, user_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_mute_room_notification(accessToken, room_id, currentTimestamp, callback) {
        Room.mute_room_notification(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    function FN_unmute_room_notification(accessToken, room_id, currentTimestamp, callback) {
        Room.unmute_room_notification(accessToken, room_id, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
            var response = {
                'status': res_status,
                'message': res_message,
                'data': res_data
            };
            callback(response);
        })
    }
    //------------------------------------
    //------------------------------------
    //------------------------------------
    io = socketio.listen(app);
    io.on('connection', function (socket) {
        console.log('----------------------------------------');
        console.log('App is opened somewhere in this world !!');
        console.log('----------------------------------------');
        socket.on('create_room', function (accessToken, room_type, chat_with, room_name, room_description, currentTimestamp) {
            create_room(accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, function (response) {
                socket.emit('new_private_room', response);
                if (response.status == 1) {
                    list_my_rooms(accessToken, room_type, currentTimestamp, function (response_1) {
                        socket.emit('show_my_rooms', response_1);
                    });
                }
            });
        });
        socket.on('list_my_rooms', function (accessToken, currentTimestamp) {
            list_my_rooms(accessToken, currentTimestamp, function (response) {
                socket.emit('show_my_rooms', response);
            });
        });
        //when room users view a message, update message_status to seen
        socket.on('update_message_status', function (accessToken, room_id, message_id, status, currentTimestamp) {
            Room.update_message_status(accessToken, room_id, message_id, status, currentTimestamp, function (ignore_param, res_status, res_message, res_data) {
                if (res_status == 1) {
                    socket.to(room_id).emit('response_update_message_status', res_data);
                }
            })
        });
        //sockets events ( trying to create generic )
        socket.on('APP_SOCKET_EMIT', function (type, info) {
        //whenever a room is open 'room_open' will be emit on mobile app.
            if (type == 'room_open') {
                console.log('----------------------------------------');
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: room_open :: A Room is opened with id : ' + room_id);
                var join_room = true;
                if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                    if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                        var exist_sockets = io.sockets.adapter.rooms[room_id].sockets;
                        var user_socket_id = socket.id;
                        for (var k in exist_sockets) {
                            if (k == user_socket_id) {
                                join_room = false;
                            }
                        }
                    }
                }
                if (join_room == true) {
                    socket.join(room_id);
                    console.log('SOCKET CALL :: room_open :: Socket ID is assign to room : ' + room_id);
                    var add_socket_info = {
                        accessToken: accessToken,
                        room_id: room_id,
                        socket_id: socket.id
                    }
                    FN_add_socket_to_room_and_user(add_socket_info, function (response) {
                        console.log('SOCKET CALL :: room_open :: Socket ID update to room and user in DB : ' + response.message);
                        console.log('----------------------------------------');
                    });
                } else {
                    console.log('----------------------------------------');
                }
            } else if (type == 'room_message') {
                var msg_local_id = info.msg_local_id;
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var message_type = info.message_type;
                var message = info.message;
                var currentTimestamp = info.currentTimestamp;
                FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        // will be available on other users of room
                        var d1 = {
                            type: 'alert',
                            data: response.data.broadcast_data
                        }
                        socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'new_room_message', d1);
                        // will have status of message sent by user
                        var d2 = {
                            type: 'alert',
                            data: response.data.user_data
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'sent_message_response', d2);
                        var d11 = {
                            room_id: room_id,
                            unread_messages: 1,
                            currentTimestamp: currentTimestamp
                        }
                        //update_room_unread_notification -- this will have a room_id, with that room_id show_room_unread_notification will be call
                        socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'update_room_unread_notification', d11);
                    }
                });
            } else if (type == 'join_public_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: join_public_room :: room_id ' + room_id);
                FN_join_public_room(accessToken, room_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'alert',
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'join_public_room', d); // to the admin who removed the message
                        //----------------------------------------------------
                        var join_user_info = response.data.join_user_info;
                        var joins_user_info_name = join_user_info.name;
                        var room_name = '';
                        if (typeof response.data.room_name != 'undefined' && response.data.room_name != '') {
                            room_name = response.data.room_name;
                        }
                        var msg_local_id = '';
                        var message_type = 'room_alert_message';
                        var message = joins_user_info_name + ' joins the room';
                        FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                            if (response.status == 1) {
                                console.log(message_type + ' :: ' + message);
                        // will be available on other users of room
                                var d1 = {
                                    type: 'alert',
                                    data: response.data.broadcast_data
                                }
                                socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'join_public_room', d1);
                            }
                        });
                    }
                });
            } else if (type == 'admin_add_user_to_public_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var to_be_add_user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: admin_add_user_to_public_room :: room_id ' + room_id);
                FN_admin_add_user_to_public_room(accessToken, room_id, to_be_add_user_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'alert',
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'admin_add_user_to_public_room', d); // to the admin who removed the message
                        //----------------------------------------------------
                        var join_user_info = response.data.join_user_info;
                        var joins_user_info_name = join_user_info.name;
                        var room_name = '';
                        if (typeof response.data.room_name != 'undefined' && response.data.room_name != '') {
                            room_name = response.data.room_name;
                        }
                        var msg_local_id = '';
                        var message_type = 'room_alert_message';
                        var message = 'Admin add ' + joins_user_info_name + ' to room';
                        FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                            if (response.status == 1) {
                                console.log(message_type + ' :: ' + message);
                        // will be available on other users of room
                                var d1 = {
                                    type: 'alert',
                                    data: response.data.broadcast_data
                                }
                                socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'admin_add_user_to_public_room', d1);
                            }
                        });
                    }
                });
            } else if (type == 'leave_public_group') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                FN_leave_public_group(accessToken, room_id, currentTimestamp, function (response) {
                    var d = {
                        type: 'alert',
                        data: response
                    }
                    socket.emit('RESPONSE_APP_SOCKET_EMIT', 'leave_public_group', d);
                    //-start--send a room message, message_type=room_alert_message that user left this group---------
                    if (response.status == 1) {
                        var left_user_info = response.data.left_user_info;
                        var left_user_info_name = left_user_info.name;
                        var msg_local_id = '';
                        var message_type = 'room_alert_message';
                        var message = left_user_info_name + ' left the room';
                        FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                            if (response.status == 1) {
                                console.log(message_type + ' :: ' + message);
                    // will be available on other users of room
                                var d1 = {
                                    type: 'alert',
                                    data: response.data.broadcast_data
                                }
                                socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'new_room_message', d1);
                            }
                        });
                    //--to emit from client side so that scoket can be removed  from room
                        var remove_socket_from_room_data = {
                            user_id: left_user_info.user_id,
                            room_id: room_id
                        };
                        socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'remove_socket_from_room', remove_socket_from_room_data);
                    //--remove token
                        if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                            if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                                socket.leave(room_id);
                            }
                        }
                    }
                    //-start--send a room message, message_type=room_alert_message that user left this group---------
                });
            } else if (type == 'remove_public_room_member') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                FN_remove_public_room_member(accessToken, room_id, user_id, currentTimestamp, function (response) {
                    var d = {
                        type: 'alert',
                        data: response
                    }
                    socket.emit('RESPONSE_APP_SOCKET_EMIT', 'remove_public_room_member', d); // to the admin who removed the message
                    //-start--send a room message, message_type=room_alert_message that admin remove the user from group---------
                    if (response.status == 1) {
                        var left_user_info = response.data.left_user_info;
                        var left_user_info_name = left_user_info.name;
                        var msg_local_id = '';
                        var message_type = 'room_alert_message';
                        var message = 'Admin removed ' + left_user_info_name + ' from Room';
                        FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                            if (response.status == 1) {
                                console.log(message_type + ' :: ' + message);
                            // will be available on other users of room
                                var d1 = {
                                    type: 'alert',
                                    data: response.data.broadcast_data
                                }
                                socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'new_room_message', d1);
                            }
                        });
                    //--to emit from client side so that scoket can be removed  from room
                        var remove_socket_from_room_data = {
                            user_id: left_user_info.user_id,
                            room_id: room_id
                        };
                        console.log('remove_socket_from_room_data 2');
                        console.log(remove_socket_from_room_data);
                        socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'remove_socket_from_room', remove_socket_from_room_data);
                    }
                    //-start--send a room message, message_type=room_alert_message that admin remove the user from group---------
                });
            } else if (type == 'remove_socket_from_room') {
                var user_id = info.user_id;
                var room_id = info.room_id;
                console.log('SOCKET CALL :: remove_socket_from_room :: user_id - ' + room_id + ' :: room_id - ' + room_id);
                if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                    if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                        socket.leave(room_id);
                        console.log('SOCKET CALL :: remove_socket_from_room :: user_id - ' + room_id + ' :: room_id - ' + room_id + ' :: REMOVED');
                    }
                }
            } else if (type == 'get_user_profile_for_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                FN_get_user_profile(accessToken, user_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'info',
                            room_id: room_id,
                            user_id: user_id,
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'get_user_profile_for_room', d);
                    }
                });
            } else if (type == 'delete_public_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: delete_public_room :: Admin deleted the room with id: ' + room_id);
                FN_delete_public_room(accessToken, room_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'info',
                            room_id: room_id,
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'delete_public_room', d);
                        //-----------------------------------
                        var msg_local_id = '';
                        var message_type = 'room_alert_message';
                        var message = 'Room deleted by admin';
                        FN_room_message(msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function (response) {
                            if (response.status == 1) {
                                console.log(message_type + ' :: ' + message);
                        // will be available on other users of room
                                var d1 = {
                                    type: 'alert',
                                    data: response.data.broadcast_data
                                }
                                socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'new_room_message', d1);
                            }
                        });
                        //--to emit from client side so that scoket can be removed  from room
                        var remove_room_data = {
                            room_id: room_id
                        };
                        socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'remove_socket_from_room', remove_room_data);
                        //--remove token
                        if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                            if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                                socket.leave(room_id);
                            }
                        }
                    }
                })
            } else if (type == 'do_logout') {
                var accessToken = info.accessToken;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: do_logout :: with accessToken of user: ' + accessToken);
                FN_do_logout(accessToken, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        d_user_id = response.data.user_id;
                        console.log('SOCKET CALL :: do_logout :: user logout with : ' + d_user_id);
                    }
                });
            } else if (type == 'room_user_typing') {
                var user_id = info.user_id;
                var user_name = info.name;
                var room_id = info.room_id;
                if (user_name != '' && room_id != '') {
                    console.log('SOCKET CALL :: room_user_typing :: name - ' + user_name + ' :: for room_id - ' + room_id);
                    d1 = {
                        user_id: user_id,
                        name: user_name,
                        room_id: room_id,
                        message: user_name + ' is_typing...',
                        message_type: 'room_temporary_message'
                    }
                    socket.to(room_id).emit('RESPONSE_APP_SOCKET_EMIT', 'room_user_typing', d1);
                }
            } else if (type == 'show_room_unread_notification') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                if (accessToken != '' && room_id != '') {
                    console.log('SOCKET CALL :: show_room_unread_notification :: for room_id - ' + room_id);
                    FN_get_user_room_unread_messages(accessToken, room_id, currentTimestamp, function (response) {
                        if (response.status == 1) {
                            var d1 = {
                                room_id: room_id,
                                unread_messages: response.data.messages_count,
                                currentTimestamp: currentTimestamp
                            }
                            console.log('SOCKET CALL :: show_room_unread_notification :: for room_id - ' + room_id + ' unread messages ::  ' + response.data.messages_count);
                            socket.emit('RESPONSE_APP_SOCKET_EMIT', 'show_room_unread_notification', d1);
                        }
                    });
                }
            } else if (type == 'get_user_profile') {
                var accessToken = info.accessToken;
                var user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: get_user_profile :: for user_id - ' + user_id);
                FN_get_user_profile(accessToken, user_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'info',
                            user_id: response.data.user_id,
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'get_user_profile', d);
                    }
                });
            } else if (type == 'delete_private_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: delete_private_room :: for room_id - ' + room_id);
                FN_delete_private_room(accessToken, room_id, currentTimestamp, function (response) {
                    var d = {
                        type: 'alert',
                        data: response
                    }
                    if (response.status == 1) {
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'delete_private_room', d);
                        if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                            if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                                socket.leave(room_id);
                            }
                        }
                    }
                });
            } else if (type == 'block_private_room') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: block_user :: for room_id - ' + room_id);
                FN_block_private_room(accessToken, room_id, currentTimestamp, function (response) {
                    var d = {
                        type: 'alert',
                        data: response
                    }
                    if (response.status == 1) {
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'block_private_room', d);
                        if (typeof io.sockets.adapter.rooms[room_id] != 'undefined') {
                            if (typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined') {
                                socket.leave(room_id);
                            }
                        }
                    }
                });
            } else if (type == 'unblock_user') {
                var accessToken = info.accessToken;
                var user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: unblock_user :: user to unblock - ' + user_id);
                FN_unblock_user(accessToken, user_id, currentTimestamp, function (response) {
                    var d = {
                        type: 'alert',
                        data: response
                    }
                    if (response.status == 1) {
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'unblock_user', d);
                    }
                });
            } else if (type == 'mute_room_notification') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: mute_room_notification :: for room - ' + room_id);
                FN_mute_room_notification(accessToken, room_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'info',
                            room_id: room_id,
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'mute_room_notification', d);
                    }
                });
            } else if (type == 'unmute_room_notification') {
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                console.log('SOCKET CALL :: unmute_room_notification :: for room - ' + room_id);
                FN_unmute_room_notification(accessToken, room_id, currentTimestamp, function (response) {
                    if (response.status == 1) {
                        var d = {
                            type: 'info',
                            room_id: room_id,
                            data: response
                        }
                        socket.emit('RESPONSE_APP_SOCKET_EMIT', 'unmute_room_notification', d);
                    }
                });
            }
        });
    });
}