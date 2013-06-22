"use strict";

var settings = require('../settings'),
    request = require('request'),
    moment = require('moment'),
    _ = require('underscore');

var moves = {}

/*
Make an api call to Moves.

Path should include the leading slash
*/
var movesAPIRequest = function (token, path, callback) {
    var requestOptions = {
        url : settings.movesAPIUrl + path,
        qs : {
            access_token : token
        },
        json : true
    };

    request(requestOptions, function (err, response, body){
        console.log(err)
        if (response.statusCode === 401)
            callback('invalidToken', body)
        else if (err)
            callback(err, body);
        else if (response.statusCode !== 200)
            callback('Unexpected response code' + response.statusCode, body);
        else
            callback(null, body);
    });
}


/*
Get user profile.

Output is in the following format:
{
    "userId": 23138311640030064,
    "profile": {
        "firstDate": "20121211",
        "currentTimeZone": {
            "id": "Europe/Helsinki",
            "offset": 10800
        }
    }
}
*/
moves.getProfile = function (token, callback){
    movesAPIRequest(token, '/user/profile', function (err, profile){
        callback(err, profile)
    })
}

/*
Get the first date from which there might be data for the user

Output is of the form 'YYYYMMDD'
*/
moves.getFirstDate = function (token, callback){
    moves.getProfile(token, function (err, profile){
        if (err)
            return callback(err)
        return callback(err, profile.profile.firstDate)
    })
}

/*
Get the full daily summary of moves activity
*/
moves.fullDailySummary = function(token, callback){
    moves.getFirstDate(token, function (err, firstDate){
        if (err)
            return callback(err)

        // FOR NOW JUST GET A FEW DAYS IN JUNE
        movesAPIRequest(token, '/user/summary/daily?from=20130601&to=20130621', function (err, activityBody){
            // sort by date descending. sortedActivityBody[0] should be today
            var sortedActivityBody = _.sortBy(activityBody, function(ele){ return -parseInt(ele.date)})

            // reformat activity object
            var milesMinutesActivity = _.map(sortedActivityBody, function(ele){
                return {
                    date : moment(ele.date, 'YYYYMMDD').format('YYYY-MM-DD'),
                    summary : _.map(ele.summary, function(subSummary){
                        return {
                            activity : subSummary.activity,
                            duration : subSummary.duration/60, // convert to minutes
                            distance : subSummary.distance/1609.34, // convert to miles
                            steps    : subSummary.steps
                        }
                    })
                }
            })
            callback(err, milesMinutesActivity)
        })
    })
}

module.exports = moves;
