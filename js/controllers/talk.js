myApp.controller('TalkController',
  ['$scope', '$rootScope', '$location', '$firebaseObject', '$firebaseArray','$routeParams', 'FIREBASE_URL',
  function($scope, $rootScope, $location, $firebaseObject, $firebaseArray, $routeParams, FIREBASE_URL) {

    $scope.whichtalk = $routeParams.tId;
    $scope.whichuser = $routeParams.uId;

    var talkRef = new Firebase(FIREBASE_URL + '/talks/' + $scope.whichtalk);
    $scope.talk = $firebaseObject(talkRef);

    var ref = new Firebase(FIREBASE_URL + '/talks/' +
      $scope.whichtalk + '/opinions');

    var opinions = $firebaseArray(ref);
    $scope.opinions = opinions;

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

    $scope.howManyOpinionVotes = function(opinion, type) {
      var numOfUps = 0;
      angular.forEach(opinion[type], function(vote) {
            numOfUps++;
      });
      return numOfUps;
    };

    $scope.allowEditOpinion = function (opinion) {
      if ((opinion.user == $rootScope.currentUser.$id) || ($scope.talk.createdBy == $rootScope.currentUser.$id)) {
        return true;
      }
      return false;
    };

    $scope.vote = function(opinionId, type) {
      var oppositeType;
      if (type == 'ups') {
        oppositeType = 'downs';
      } else if (type == 'downs'){
        oppositeType = 'ups';
      } else {
        return;
      }
      var oppositeRef = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId + '/' + oppositeType + '/' + $rootScope.currentUser.$id);
      var opposite = $firebaseObject(oppositeRef);
      opposite.$remove($rootScope.currentUser.$id);

      var refVoter = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + opinionId + '/' + type + '/' + $rootScope.currentUser.$id);
      var voter = $firebaseObject(refVoter);
      voter.user = $rootScope.currentUser.firstname + ' ' + $rootScope.currentUser.lastname;
      voter.date = Firebase.ServerValue.TIMESTAMP;
      voter.$save();
    };//vote

    $scope.isVoted = function(votesArray) {
      if (votesArray) {
        return $rootScope.currentUser.$id in votesArray;
      } else {
        return false;
      }
    };

    $scope.deleteOpinion = function(id) {
      var refDel = new Firebase(FIREBASE_URL + '/talks/' +
        $scope.whichtalk + '/opinions/' + id);
      var record = $firebaseObject(refDel);
      record.$remove(id);
    };


    $scope.showReply = function(myOpinion) {
      myOpinion.show = !myOpinion.show;

      if (myOpinion.userState == 'expanded') {
        myOpinion.userState = '';
      } else {
        myOpinion.userState = 'expanded';
      }
    }; // show love

    $scope.addReply = function(opinion, replyText) {
      var refReply = new Firebase(FIREBASE_URL + '/talks/' +
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
      if ((reply.user == $rootScope.currentUser.$id) || ($scope.talk.createdBy == $rootScope.currentUser.$id)){
        return true;
      }
      return false;
    };

    $scope.deleteReply = function(opinionId, replyid) {
      var refReply = new Firebase(FIREBASE_URL + '/talks/' +
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