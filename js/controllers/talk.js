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
      var myData = {
        title: $scope.user.title,
        comment: $scope.user.comment,
        date: Firebase.ServerValue.TIMESTAMP
      }; //myData

      $scope.comments.$add(myData).then(function() {
        console.log('addedComment');
      }); //Send data to Firebase
    }; //AddComment

    $scope.deleteComment = function(id) {
      var refDel = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + id);
      var record = $firebaseObject(refDel);
      record.$remove(id);
    };

    $scope.pickRandom = function() {
      var whichRecord = Math.round(Math.random()* (comments.length - 1));
      $scope.recordId = comments.$keyAt(whichRecord);
    }; //pick winner

    $scope.showReply = function(myComment) {
      myComment.show = !myComment.show;

      if (myComment.userState == 'expanded') {
        myComment.userState = '';
      } else {
        myComment.userState = 'expanded';
      }
    }; // show love

    $scope.giveReply = function(myComment, replyText) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + myComment.$id +
        '/replies');
      var repliesArray = $firebaseArray(refReply);

      var myData = {
        reply: replyText,
        date: Firebase.ServerValue.TIMESTAMP
      }; //myData
      repliesArray.$add(myData).then(function() {
        console.log('giveReply');
      });
    }; //giveReply

    $scope.deleteReply =function(commentId, reply) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/comments/' + commentId +
        '/replies');
      var record = $firebaseObject(refReply);
      record.$remove(reply);
    }; //deleteReply


}]); //Controller