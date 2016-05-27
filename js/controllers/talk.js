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
      $scope.whichtalk + '/opinions');

    var opinions = $firebaseArray(ref);
    $scope.opinions = opinions;

    $scope.opinions.$loaded().then(function(){
        angular.forEach($scope.opinions, function(opinion) {
            console.log(opinion.ups.length);
        })
    });

    $scope.order = "title";
    $scope.direction = null;
    $scope.query = '';
    $scope.recordId='';

    $scope.addOpinion = function() {
      var data = {
        user: $rootScope.currentUser.$id,
        title: $scope.user.opinionTitle,
        opinion: $scope.user.opinionText,
        date: Firebase.ServerValue.TIMESTAMP
      }; //data

      $scope.opinions.$add(data).then(function() {
        $scope.user.opinionTitle = "";
        $scope.user.opinionText = "";
      }); //Send data to Firebase
    }; //AddOpinion

    $scope.allowEditOpinion = function (opinion) {
      if ((opinion.user == $rootScope.currentUser.$id) || ($scope.whichuser == $rootScope.currentUser.$id)) {
        return true;
      }
      return false;
    };

    $scope.deleteOpinion = function(id) {
      var refDel = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/opinions/' + id);
      var record = $firebaseObject(refDel);
      record.$remove(id);
    };

    $scope.upOpinion = function(opinionId) {
      var refUps = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId +
        '/ups');
      var upsArray = $firebaseArray(refUps);
      var data = {
        user: $rootScope.currentUser.$id,
        date: Firebase.ServerValue.TIMESTAMP
      }; //data
      upsArray.$add(data).then(function() {
      });
    };//upOpinion


    $scope.showReply = function(myOpinion) {
      myOpinion.show = !myOpinion.show;

      if (myOpinion.userState == 'expanded') {
        myOpinion.userState = '';
      } else {
        myOpinion.userState = 'expanded';
      }
    }; // show love

    $scope.addReply = function(opinion, replyText) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinion.$id +
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

    $scope.deleteReply = function(opinionId, replyid) {
      var refReply = new Firebase(FIREBASE_URL + 'users/' +
        $scope.whichuser + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId +
        '/replies/' + replyid);
      var reply = $firebaseObject(refReply);
      reply.$remove();
    }; //deleteReply

    $scope.pickRandom = function() {
      var whichRecord = Math.round(Math.random()* (opinions.length - 1));
      $scope.recordId = opinions.$keyAt(whichRecord);
    }; //pick winner

}]); //Controller