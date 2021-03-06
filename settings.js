"use strict";

var _ = require('underscore')

var settings = {}

settings.movesClientId = process.env.MOVES_CLIENT
settings.movesSecret = process.env.MOVES_SECRET

settings.movesToken = process.env.MOVES_TOKEN // if a token is in the environment for demonstration purposes

settings.movesRedirectUri = process.env.MOVES_REDIRECT

settings.movesAPIUrl = 'https://api.moves-app.com/api/v1'
settings.movesAuthUrl = 'https://api.moves-app.com/oauth/v1'

module.exports = settings
