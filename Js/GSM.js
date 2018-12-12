var GSM = (function() {

    var m_subscribers = {}

    var m_registerMe = function(uid, callback) {
        m_subscribers[uid] = callback
    }

    var m_postMsg = function(uid, msg) {
        m_subscribers[uid](msg)
    }

    return {
        registerMe: m_registerMe,
        postMsg: m_postMsg
    }

})()
