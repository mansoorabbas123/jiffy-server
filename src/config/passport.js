'use strict'

import passport from 'passport';
import config from '../config/config.js';
import passportJWT from 'passport-jwt';
import _ from 'lodash';

// Handling passport strategy
let ExtractJwt = passportJWT.ExtractJwt
let JwtStrategy = passportJWT.Strategy

let newConfig = {
    jwtOptions: {
        'secretOrKey': process.env.secretOrKey,
        'ignoreExpiration': process.env.ignoreExpiration,
        'passReqToCallback': process.env.passReqToCallback
    }
}

newConfig.jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
var strategy = new JwtStrategy(newConfig.jwtOptions, (req, jwtPayload, next) => {
    if (!_.isEmpty(jwtPayload.data)) {
        jwtPayload = jwtPayload.data
    }
    next(null, jwtPayload)
})
passport.use(strategy)

export default passport;