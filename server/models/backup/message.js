var UTIL = require('../modules/generic');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (Message) {
    Message.disableRemoteMethod("create", true);
    Message.disableRemoteMethod("upsert", true);
    Message.disableRemoteMethod("updateAll", true);
    Message.disableRemoteMethod("updateAttributes", false);
    Message.disableRemoteMethod("find", true);
    Message.disableRemoteMethod("findById", true);
    Message.disableRemoteMethod("findOne", true);
    Message.disableRemoteMethod("deleteById", true);
    Message.disableRemoteMethod("login", true);
    Message.disableRemoteMethod("logout", true);
    Message.disableRemoteMethod("confirm", true);
    Message.disableRemoteMethod("count", true);
    Message.disableRemoteMethod("exists", true);
    Message.disableRemoteMethod("resetPassword", true);
    Message.disableRemoteMethod('createChangeStream', true);
    Message.disableRemoteMethod('__count__accessTokens', false);
    Message.disableRemoteMethod('__create__accessTokens', false);
    Message.disableRemoteMethod('__delete__accessTokens', false);
    Message.disableRemoteMethod('__destroyById__accessTokens', false);
    Message.disableRemoteMethod('__findById__accessTokens', false);
    Message.disableRemoteMethod('__get__accessTokens', false);
    Message.disableRemoteMethod('__updateById__accessTokens', false);
};
