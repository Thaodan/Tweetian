// TODO: Move this file to Services folder

.pragma library

Qt.include("Services/Global.js")
Qt.include("lib/oauth.js")

if(!Global.Twitter.OAUTH_CONSUMER_KEY || !Global.Twitter.OAUTH_CONSUMER_SECRET)
    throw new Error("Twitter OAUTH_CONSUMER_KEY and/or OAUTH_CONSUMER_SECRET is not set!")

var OAUTH_TOKEN
var OAUTH_TOKEN_SECRET

// OAUTH
var REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
var ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"

// GET
var GET_TIMELIME_URL = "https://api.twitter.com/1/statuses/home_timeline.json"
var GET_MENTIONS_URL = "https://api.twitter.com/1/statuses/mentions.json"
var GET_DIRECT_MSG_URL = "https://api.twitter.com/1/direct_messages.json"
var GET_SENT_DIRECT_MSG_URL = "https://api.twitter.com/1/direct_messages/sent.json"
var GET_RATE_LIMIT_URL = "https://api.twitter.com/1/account/rate_limit_status.json"
var GET_SHOW_USERS_URL = "https://api.twitter.com/1/users/show.json"
var GET_USER_TWEETS_URL = "https://api.twitter.com/1/statuses/user_timeline.json"
var GET_VERIFY_CREDENTIALS_URL = "https://api.twitter.com/1/account/verify_credentials.json"
var GET_USER_FAVOURITES_URL = "https://api.twitter.com/1/favorites.json"
var GET_USER_LISTS_ALL_URL = "https://api.twitter.com/1/lists/all.json"
var GET_USER_LISTS_MEMBERSHIPS_URL = "https://api.twitter.com/1/lists/memberships.json"
var GET_LIST_TIMELINE_URL = "https://api.twitter.com/1/lists/statuses.json"
var GET_LIST_MEMBER_URL = "https://api.twitter.com/1/lists/members.json"
var GET_LIST_SUBSCRIBERS_URL = "https://api.twitter.com/1/lists/subscribers.json"
var GET_TRENDS_URL = "https://api.twitter.com/1/trends/"
var GET_TRENDS_AVAILABLE_URL = "https://api.twitter.com/1/trends/available.json"
var GET_SAVED_SEARCHES_URL = "https://api.twitter.com/1/saved_searches.json"
var GET_SEARCH_URL = "https://search.twitter.com/search.json"
var GET_FOLLOWING_ID_URL = "https://api.twitter.com/1/friends/ids.json"
var GET_FOLLOWERS_ID_URL = "https://api.twitter.com/1/followers/ids.json"
var GET_USERS_LOOKUP_URL = "https://api.twitter.com/1/users/lookup.json"
var GET_USERS_SEARCH_URL = "https://api.twitter.com/1/users/search.json"
var GET_STATUS_SHOW_URL = "https://api.twitter.com/1/statuses/show/"
var GET_SUGGESTED_USER_CATERGORIES = "https://api.twitter.com/1/users/suggestions.json"
var GET_SUGGESTED_USER = "https://api.twitter.com/1/users/suggestions/"
var GET_PRIVACY_URL = "https://api.twitter.com/1/legal/privacy.json"
var GET_TOS_URL = "https://api.twitter.com/1/legal/tos.json"
var GET_RELATED_RESULTS = "https://api.twitter.com/1/related_results/show/"
var GET_USER_STREAM_URL = "https://userstream.twitter.com/2/user.json"

// POST
var POST_STATUS_URL = "https://api.twitter.com/1/statuses/update.json"
var POST_RETWEET_URL = "https://api.twitter.com/1/statuses/retweet/"
var POST_FAVOURITE_URL = "https://api.twitter.com/1/favorites/create/"
var POST_UNFAVOURITE_URL = "https://api.twitter.com/1/favorites/destroy/"
var POST_DIRECT_MSG_URL = "https://api.twitter.com/1/direct_messages/new.json"
var POST_REPORT_SPAM_URL = "https://api.twitter.com/1/report_spam.json"
var POST_SAVED_SEARCHES_URL = "https://api.twitter.com/1/saved_searches/create.json"
var POST_REMOVE_SAVED_SEARCH_URL = "http://api.twitter.com/1/saved_searches/destroy/"
var POST_DIRECT_MSG_DELETE_URL = "https://api.twitter.com/1/direct_messages/destroy/"
var POST_FOLLOW_URL = "https://api.twitter.com/1/friendships/create.json"
var POST_UNFOLLOW_URL = "https://api.twitter.com/1/friendships/destroy.json"
var POST_DELETE_STATUS_URL = "https://api.twitter.com/1/statuses/destroy/"
var POST_SUBSCRIBE_LIST_URL = "https://api.twitter.com/1/lists/subscribers/create.json"
var POST_UNSUBSCRIBE_LIST_URL = "https://api.twitter.com/1/lists/subscribers/destroy.json"
var POST_DELETE_LIST_URL = "https://api.twitter.com/1/lists/destroy.json"
var TWITTER_IMAGE_UPLOAD_URL = "https://upload.twitter.com/1/statuses/update_with_media.json"

function setToken(token, tokenSecret){
    OAUTH_TOKEN = token
    OAUTH_TOKEN_SECRET = tokenSecret
}

function OAuthRequest(method, url){
    this.accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET,
        token: OAUTH_TOKEN,
        tokenSecret: OAUTH_TOKEN_SECRET
    }
    this.message = {
        action: url,
        method: method
    }
}

OAuthRequest.prototype.setParameters = function (parameters) {
    this.message.parameters = parameters
}

OAuthRequest.prototype.sendRequest = function (onSuccess, onFailure) {
    var encoded = OAuth.formEncode(this.message.parameters)
    var encodedURL = this.message.method == "GET" && encoded.length > 0 ? this.message.action + '?' + encoded
                                                                        : this.message.action
    OAuth.completeRequest(this.message, this.accessor)
    var authorizationHeader = OAuth.getAuthorizationHeader(this.message.action, this.message.parameters)
    var request = new XMLHttpRequest()
    request.open(this.message.method, encodedURL)

    request.onreadystatechange = function (){
        if(request.readyState == XMLHttpRequest.DONE){
            if(request.status === 200){
                if(request.responseText != "") onSuccess(JSON.parse(request.responseText))
                else onSuccess("")
            }
            else onFailure(request.status, request.statusText)
        }
    }

    request.setRequestHeader("Authorization", authorizationHeader)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.setRequestHeader("User-Agent", Global.USER_AGENT)
    request.send(encoded)
}

function getHomeTimeline(sinceId, maxId, onSuccess, onFailure) {
    var timelineRequest = new OAuthRequest("GET", GET_TIMELIME_URL)
    var parameters = [["count", "200"], ["include_rts", true], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    timelineRequest.setParameters(parameters)
    timelineRequest.sendRequest(onSuccess, onFailure)
}

function getMentions(sinceId, maxId, onSuccess, onFailure){
    var mentionsRequest = new OAuthRequest("GET", GET_MENTIONS_URL)
    var parameters = [["count", "200"], ["include_rts", true], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    mentionsRequest.setParameters(parameters)
    mentionsRequest.sendRequest(onSuccess, onFailure)
}

function getDirectMsg(sinceId, maxId, onSuccess, onFailure) {
    var directMsgRequest = new OAuthRequest("GET", GET_DIRECT_MSG_URL)
    var parameters = [["count", "100"], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    directMsgRequest.setParameters(parameters)
    directMsgRequest.sendRequest(function(data){
                                     getSentDirectMsg(sinceId, maxId, data, onSuccess, onFailure)
                                 },onFailure)
}

function getSentDirectMsg(sinceId, maxId, dmRecieve, onSucces, onFailure) {
    var directMsgSent = new OAuthRequest("GET", GET_SENT_DIRECT_MSG_URL)
    var parameters = [["count", "100"], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    directMsgSent.setParameters(parameters)
    directMsgSent.sendRequest(function(data){onSucces(dmRecieve, data)}, onFailure)
}

function getStatus(statusId, onSuccess, onFailure) {
    var statusRequest = new OAuthRequest("GET", GET_STATUS_SHOW_URL + statusId + ".json")
    statusRequest.setParameters([["include_entities", true]])
    statusRequest.sendRequest(onSuccess, onFailure)
}

function getRateLimit(onSuccess, onFailure) {
    var rateLimitRequest = new OAuthRequest("GET", GET_RATE_LIMIT_URL)
    rateLimitRequest.sendRequest(onSuccess, onFailure)
}

function getUserInfo(screenName, onSuccess, onFailure) {
    var userInfoRequest = new OAuthRequest("GET", GET_SHOW_USERS_URL)
    userInfoRequest.setParameters([["screen_name", screenName]])
    userInfoRequest.sendRequest(onSuccess, onFailure)
}

function getUserTweets(screenName, maxId, onSuccess, onFailure) {
    var userTweetsRequest = new OAuthRequest("GET", GET_USER_TWEETS_URL)
    var parameters = [["screen_name", screenName], ["count", 50], ["include_rts", true], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    userTweetsRequest.setParameters(parameters)
    userTweetsRequest.sendRequest(onSuccess, onFailure)
}

function getUserFavourites(screenName, maxId, onSuccess, onFailure){
    var favouritesRequest = new OAuthRequest("GET", GET_USER_FAVOURITES_URL)
    var parameters = [["screen_name", screenName], ["count", 50], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    favouritesRequest.setParameters(parameters)
    favouritesRequest.sendRequest(onSuccess, onFailure)
}

function getUserLists(screenName, onSuccess, onFailure) {
    var listsRequest = new OAuthRequest("GET", GET_USER_LISTS_ALL_URL)
    listsRequest.setParameters([["screen_name", screenName]])
    listsRequest.sendRequest(onSuccess, onFailure)
}

function getUserListsMemberships(screenName, cursor, onSuccess, onFailure) {
    cursor = cursor || -1
    var listsMemberRequest = new OAuthRequest("GET", GET_USER_LISTS_MEMBERSHIPS_URL)
    listsMemberRequest.setParameters([["screen_name", screenName], ["cursor", cursor]])
    listsMemberRequest.sendRequest(onSuccess, onFailure)
}

function getListTimeline(listId, sinceId, maxId, onSuccess, onFailure){
    var listTimelineRequest = new OAuthRequest("GET", GET_LIST_TIMELINE_URL)
    var parameters = [["list_id", listId], ["per_page", 100], ["include_entities", true], ["include_rts", true]]
    if(sinceId) parameters.push(["since_id", sinceId])
    else if(maxId) parameters.push(["max_id", maxId])
    listTimelineRequest.setParameters(parameters)
    listTimelineRequest.sendRequest(onSuccess, onFailure)
}

function getListMembers(listId, cursor, onSuccess, onFailure){
    var listMemberRequest = new OAuthRequest("GET", GET_LIST_MEMBER_URL)
    listMemberRequest.setParameters([["list_id", listId], ["cursor", cursor], ["skip_status", true]])
    listMemberRequest.sendRequest(onSuccess, onFailure)
}

function getListSubscribers(listId, cursor, onSuccess, onFailure){
    var listSubscribersRequest = new OAuthRequest("GET", GET_LIST_SUBSCRIBERS_URL)
    listSubscribersRequest.setParameters([["list_id", listId], ["cursor", cursor], ["skip_status", true]])
    listSubscribersRequest.sendRequest(onSuccess, onFailure)
}

function getTrends(woeid, onSuccess, onFailure) {
    var trendsRequest = new OAuthRequest("GET", GET_TRENDS_URL + woeid + ".json")
    trendsRequest.sendRequest(onSuccess, onFailure)
}

function getTrendsAvailable(onSuccess, onFailure){
    var trendsAvailableRequest = new OAuthRequest("GET", GET_TRENDS_AVAILABLE_URL)
    trendsAvailableRequest.sendRequest(onSuccess, onFailure)
}

function getSavedSearches(onSuccess, onFailure) {
    var savedSearchRequest = new OAuthRequest("GET", GET_SAVED_SEARCHES_URL)
    savedSearchRequest.sendRequest(onSuccess, onFailure)
}

function getSearch(query, sinceId, maxId, onSuccess, onFailure){
    var searchRequest = new OAuthRequest("GET", GET_SEARCH_URL)
    var parameters = [["q", query], ["rpp", 50], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    searchRequest.setParameters(parameters)
    searchRequest.sendRequest(onSuccess, onFailure)
}

function getNearbyTweets(latitude, longitude, sinceId, maxId, onSuccess, onFailure){
    var geocode = latitude + "," + longitude + ",1km"
    var nearbyTweetsRequest = new OAuthRequest("GET", GET_SEARCH_URL)
    var parameters = [["geocode", geocode], ["rpp", 50], ["include_entities", true]]
    if(maxId) parameters.push(["max_id", maxId])
    else if(sinceId) parameters.push(["since_id", sinceId])
    nearbyTweetsRequest.setParameters(parameters)
    nearbyTweetsRequest.sendRequest(onSuccess, onFailure)
}

function getUserSearch(query, page, onSuccess, onFailure) {
    var userSearchRequest = new OAuthRequest("GET", GET_USERS_SEARCH_URL)
    userSearchRequest.setParameters([["q", query], ["page", page], ["per_page", 20]])
    userSearchRequest.sendRequest(onSuccess, onFailure)
}

function getFollowingId(screenName, onSuccess, onFailure) {
    var followingIdRequest = new OAuthRequest("GET", GET_FOLLOWING_ID_URL)
    followingIdRequest.setParameters([["screen_name", screenName], ["stringify_ids", true]])
    followingIdRequest.sendRequest(onSuccess, onFailure)
}

function getFollowersId(screenName, onSuccess, onFailure){
    var followersIdRequest = new OAuthRequest("GET", GET_FOLLOWERS_ID_URL)
    followersIdRequest.setParameters([["screen_name", screenName], ["stringify_ids", true]])
    followersIdRequest.sendRequest(onSuccess, onFailure)
}

function getUserLookup(userId, onSuccess, onFailure){
    var userLookupRequest = new OAuthRequest("GET", GET_USERS_LOOKUP_URL)
    userLookupRequest.setParameters([["user_id", userId]])
    userLookupRequest.sendRequest(onSuccess, onFailure)
}

function getConversation(id, onSuccess, onFailure){
    var conversationRequest = new OAuthRequest("GET", GET_RELATED_RESULTS + id + ".json")
    conversationRequest.setParameters([["include_entities", true]])
    conversationRequest.sendRequest(onSuccess, onFailure)
}

function getSuggestedUserCategories(onSuccess, onFailure){
    var userCategoriesRequest = new OAuthRequest("GET", GET_SUGGESTED_USER_CATERGORIES)
    userCategoriesRequest.sendRequest(onSuccess, onFailure)
}

function getSuggestedUser(slug, onSuccess, onFailure){
    var suggestedUserRequest = new OAuthRequest("GET", GET_SUGGESTED_USER + slug + ".json")
    suggestedUserRequest.sendRequest(onSuccess, onFailure)
}

function getPrivacyPolicy(onSuccess, onFailure) {
    var privacyRequest = new OAuthRequest("GET", GET_PRIVACY_URL)
    privacyRequest.sendRequest(onSuccess, onFailure)
}

function getTermsOfService(onSuccess, onFailure){
    var tosRequest = new OAuthRequest("GET", GET_TOS_URL)
    tosRequest.sendRequest(onSuccess, onFailure)
}

function getVerifyCredentials(onSuccess, onFailure){
    var verifyCrendtialsRequest = new OAuthRequest("GET", GET_VERIFY_CREDENTIALS_URL)
    verifyCrendtialsRequest.sendRequest(onSuccess, onFailure)
}

function postRequestToken(onSuccess, onFailure) {
    var accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET
    }
    var message = {
        action: REQUEST_TOKEN_URL,
        method: "POST",
        parameters: [["oauth_callback", "http://twitter.com"]]
    }
    OAuth.completeRequest(message, accessor)
    var authorizationHeader = OAuth.getAuthorizationHeader(message.action, message.parameters)
    var request = new XMLHttpRequest()
    request.open(message.method, message.action)

    request.onreadystatechange = function (){
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
                var token, tokenSecret, callbackConfirmed
                var tokenArray = request.responseText.split('&')
                for(var i=0; i<tokenArray.length; i++){
                    if(tokenArray[i].indexOf("oauth_token=") == 0) token = tokenArray[i].substring(12)
                    else if(tokenArray[i].indexOf("oauth_token_secret=") == 0) tokenSecret = tokenArray[i].substring(19)
                    else if(tokenArray[i].indexOf("oauth_callback_confirmed=") == 0) callbackConfirmed = tokenArray[i].substring(25)
                }
                if(callbackConfirmed == "true") onSuccess(token, tokenSecret)
                else onFailure(request.status, "oauth_callback_confirmed value is not true")
            }
            else onFailure(request.status, request.statusText)
        }
    }

    request.setRequestHeader("Authorization", authorizationHeader)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.setRequestHeader("User-Agent", Global.USER_AGENT)
    request.send()
}

function postAccessToken(token, tokenSecret, oauthVerifier, onSuccess, onFailure) {
    var accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET,
        token: token,
        tokenSecret: tokenSecret
    }
    var message = {
        action: ACCESS_TOKEN_URL,
        method: "POST",
        parameters: [["oauth_verifier", oauthVerifier]]
    }
    var body = OAuth.formEncode(message.parameters)
    OAuth.completeRequest(message, accessor)
    var authorizationHeader = OAuth.getAuthorizationHeader(message.action, message.parameters)
    var request = new XMLHttpRequest()
    request.open(message.method, message.action)

    request.onreadystatechange = function (){
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200) {
                var token, tokenSecret, screenName
                var tokenArray = request.responseText.split('&')
                for(var i=0; i<tokenArray.length; i++){
                    if(tokenArray[i].indexOf("oauth_token=") == 0) token = tokenArray[i].substring(12)
                    else if(tokenArray[i].indexOf("oauth_token_secret=") == 0) tokenSecret = tokenArray[i].substring(19)
                    else if(tokenArray[i].indexOf("screen_name=") == 0) screenName = tokenArray[i].substring(12)
                }
                onSuccess(token, tokenSecret, screenName)
            }
            else onFailure(request.status, request.statusText)
        }
    }

    request.setRequestHeader("Authorization", authorizationHeader)
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    request.setRequestHeader("User-Agent", Global.USER_AGENT)
    request.send(body)
}

function postStatus(status, statusId, latitude, longitude, onSuccess, onFailure) {
    var postStatusRequest = new OAuthRequest("POST", POST_STATUS_URL)
    var parameters = [["status", status], ["include_entities", true]]
    if(statusId) parameters.push(["in_reply_to_status_id", statusId])
    if(latitude && longitude){
        parameters.push(["lat", latitude])
        parameters.push(["long", longitude])
    }
    postStatusRequest.setParameters(parameters)
    postStatusRequest.sendRequest(onSuccess, onFailure)
}

function postDeleteStatus(statusId, onSuccess, onFailure) {
    var deleteStatusRequest = new OAuthRequest("POST", POST_DELETE_STATUS_URL + statusId + ".json")
    deleteStatusRequest.sendRequest(onSuccess, onFailure)
}

function postDirectMsg(status, screenName, onSuccess, onFailure) {
    var postDirectMsgRequest = new OAuthRequest("POST", POST_DIRECT_MSG_URL)
    postDirectMsgRequest.setParameters([["text", status], ["screen_name", screenName], ["include_entities", true]])
    postDirectMsgRequest.sendRequest(onSuccess, onFailure)
}

function postDeleteDirectMsg(statusId, onSuccess, onFailure){
    var deleteDirectMsg = new OAuthRequest("POST", POST_DIRECT_MSG_DELETE_URL + statusId + ".json")
    deleteDirectMsg.sendRequest(onSuccess, onFailure)
}

function postRetweet(statusId, onSuccess, onFailure){
    var retweetRequest = new OAuthRequest("POST", POST_RETWEET_URL + statusId + ".json")
    retweetRequest.setParameters([["include_entities", true]])
    retweetRequest.sendRequest(onSuccess, onFailure)
}

function postFavourite(statusId, onSuccess, onFailure){
    var favouriteRequest = new OAuthRequest("POST", POST_FAVOURITE_URL + statusId + ".json")
    favouriteRequest.sendRequest(function(data){onSuccess(data, true)}, onFailure)
}

function postUnfavourite(statusId, onSuccess, onFailure){
    var unfavouriteRequest = new OAuthRequest("POST", POST_UNFAVOURITE_URL + statusId + ".json")
    unfavouriteRequest.sendRequest(function(data){onSuccess(data, false)}, onFailure)
}

function postFollow(screenName, onSuccess, onFailure){
    var followRequest = new OAuthRequest("POST", POST_FOLLOW_URL)
    followRequest.setParameters([["screen_name", screenName]])
    followRequest.sendRequest(function(data){onSuccess(data, true)}, onFailure)
}

function postUnfollow(screenName, onSuccess, onFailure) {
    var unfollowRequest = new OAuthRequest("POST", POST_UNFOLLOW_URL)
    unfollowRequest.setParameters([["screen_name", screenName]])
    unfollowRequest.sendRequest(function(data){onSuccess(data, false)}, onFailure)
}

function postSavedSearches(query, onSuccess, onFailure) {
    var savedNewSearchRequest = new OAuthRequest("POST", POST_SAVED_SEARCHES_URL)
    savedNewSearchRequest.setParameters([["query", query]])
    savedNewSearchRequest.sendRequest(onSuccess, onFailure)
}

function postRemoveSavedSearch(id, onSuccess, onFailure){
    var removeSearchRequest = new OAuthRequest("POST", POST_REMOVE_SAVED_SEARCH_URL + id + ".json")
    removeSearchRequest.sendRequest(onSuccess, onFailure)
}

function postReportSpam(screenName, onSuccess, onFailure){
    var reportSpamRequest = new OAuthRequest("POST", POST_REPORT_SPAM_URL)
    reportSpamRequest.setParameters([["screen_name", screenName]])
    reportSpamRequest.sendRequest(onSuccess, onFailure)
}

function postSubscribeList(listId, onSuccess, onFailure){
    var subscribeListRequest = new OAuthRequest("POST", POST_SUBSCRIBE_LIST_URL)
    subscribeListRequest.setParameters([["list_id", listId]])
    subscribeListRequest.sendRequest(onSuccess, onFailure)
}

function postUnsubscribeList(listId, onSuccess, onFailure){
    var unsubscriberListRequest = new OAuthRequest("POST", POST_UNSUBSCRIBE_LIST_URL)
    unsubscriberListRequest.setParameters([["list_id", listId]])
    unsubscriberListRequest.sendRequest(onSuccess, onFailure)
}

function postDeleteList(listId, onSuccess, onFailure){
    var deleteListRequest = new OAuthRequest("POST", POST_DELETE_LIST_URL)
    deleteListRequest.setParameters([["list_id", listId]])
    deleteListRequest.sendRequest(onSuccess, onFailure)
}

// functions for generating header and url for use in C++
function getTwitterImageUploadAuthHeader(){
    var accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET,
        token: OAUTH_TOKEN,
        tokenSecret: OAUTH_TOKEN_SECRET
    }
    var message = {
        action: TWITTER_IMAGE_UPLOAD_URL,
        method: "POST"
    }
    OAuth.completeRequest(message, accessor)
    return OAuth.getAuthorizationHeader(message.action, message.parameters)
}

function getUserStreamURLAndHeader(){
    var accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET,
        token: OAUTH_TOKEN,
        tokenSecret: OAUTH_TOKEN_SECRET
    }
    var message = {
        action: GET_USER_STREAM_URL,
        method: "GET",
        parameters: [["delimited", "length"], ["stall_warnings", true], ["with", "followings"]]
    }
    var url = OAuth.addToURL(message.action, message.parameters)
    OAuth.completeRequest(message, accessor)
    var authorizationHeader = OAuth.getAuthorizationHeader(message.action, message.parameters)
    return {url: url, header: authorizationHeader}
}

function getOAuthEchoAuthHeader(){
    var accessor = {
        consumerKey: Global.Twitter.OAUTH_CONSUMER_KEY,
        consumerSecret: Global.Twitter.OAUTH_CONSUMER_SECRET,
        token: OAUTH_TOKEN,
        tokenSecret: OAUTH_TOKEN_SECRET
    }
    var message = {
        action: GET_VERIFY_CREDENTIALS_URL,
        method: "GET"
    }
    OAuth.completeRequest(message, accessor)
    return OAuth.getAuthorizationHeader(message.action, message.parameters)
}