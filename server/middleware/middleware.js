module.exports = function( ) {
    return function(req, res, next) {
        if( typeof req.query != 'undefined' && typeof req.query.access_token != 'undefined' && typeof req.query.currentTimestamp != 'undefined' ) {
            var User = req.app.models.User;
            var access_token = req.query.access_token;
            var currentTimestamp = req.query.currentTimestamp;
            User.last_seen( access_token, currentTimestamp, function( ignore_param, status, message, data ){
                
                if( typeof req.query.geo_lat != 'undefined' && typeof req.query.geo_long != 'undefined' ) {
                    var geo_lat = req.query.geo_lat;
                    var geo_long = req.query.geo_long;
                    User.geo_location( access_token, geo_lat, geo_long, currentTimestamp, function( ignore_param, status, message, data ){
                    
                        next();
                    })
                }else{
                    next();
                }
            })
        }else{
            next();
        }
    };
};