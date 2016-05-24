myApp.controller('TalkController',
  ['$scope', '$rootScope', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

    $scope.whichtalk = $routeParams.mId;
    $scope.whichuser = $routeParams.uId;

    var talkRef = new Firebase(FIREBASE_URL + 'users/' +
      $scope.whichuser + '/talks/' + $scope.whichtalk);
    $scope.talk = $firebaseObject(talkRef);

    var ref = new Firebase(FIREBASE_URL + 'users/' +
      $scope.whichuser + '/talks/' +
      $scope.whichtalk + '/comments');

    var comments = $firebaseArray(ref);
    $scope.comments = comments;

    $scope.order = "title";
    $scope.direction = null;
    $scope.query = '';
    $scope.recordId='';

    $scope.addComment = function() {
      var data = {
        user: $rootScope.currentUser.$id,
        title: $scope.user.commentTitle,
        comment: $scope.user.commentText,
        date: Firebase.ServerValue.TIMESTAMP
      }; //data

      $scope.comments.$add(data).then(function() {
        $scope.user.commentTitle = "";
        $scope.user.commentText = "";
      }); //Send data to Firebase
    }; //AddComment

    $scope.allowEditComment = function (comment) {
      if ((comment.user == $rootScope.currentUser.$id) || ($scope.whichuser == $rootScope.currentUser.$id)) {
        return true;
      }
      return false;
    };

    $scope.deleteComment = function(id) {
      var refDel = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + id);
      var record = $firebaseObject(refDel);
      record.$remove(id);
    };

    $scope.showReply = function(myComment) {
      myComment.show = !myComment.show;

      if (myComment.userState == 'expanded') {
        myComment.userState = '';
      } else {
        myComment.userState = 'expanded';
      }
    }; // show love

    $scope.addReply = function(comment, replyText) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + comment.$id +
        '/replies');
      var repliesArray = $firebaseArray(refReply);

      var data = {
        user: $rootScope.currentUser.$id,
        reply: replyText,
        date: Firebase.ServerValue.TIMESTAMP
      }; //data
      repliesArray.$add(data).then(function() {
      });
    }; //giveReply

    $scope.allowEditReply = function (reply) {
      if ((reply.user == $rootScope.currentUser.$id) || ($scope.whichuser == $rootScope.currentUser.$id)){
        return true;
      }
      return false;
    };

    $scope.deleteReply = function(commentId, replyid) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + commentId +
        '/replies/' + replyid);
      var reply = $firebaseObject(refReply);
      reply.$remove();
    }; //deleteReply

    $scope.pickRandom = function() {
      var whichRecord = Math.round(Math.random()* (comments.length - 1));
      $scope.recordId = comments.$keyAt(whichRecord);
    }; //pick winner

}]); //Controller