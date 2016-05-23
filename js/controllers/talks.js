myApp.controller('TalksController',
  ['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
  function($scope, $rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL) {

    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);

    auth.$onAuth(function(authUser) {
      if (authUser) {
        var talksRef = new Firebase(FIREBASE_URL + 'users/' +
          $rootScope.currentUser.$id + '/talks');
        var talksInfo = $firebaseArray(talksRef);
        $scope.talks = talksInfo;

        talksInfo.$loaded().then(function(data) {
          $rootScope.howManytalks = talksInfo.length;
        }); //Make sure talk data is loaded

        talksInfo.$watch(function(data) {
          $rootScope.howManyTalks = talksInfo.length;
        });

        $scope.addTalk = function() {
          talksInfo.$add({
            name: $scope.talkName,
            date: Firebase.ServerValue.TIMESTAMP
          }).then(function() {
            $scope.talkName='';
          }); //promise
        }; // addTalk

        $scope.deleteTalk = function(key) {
          talksInfo.$remove(key);
        }; // deleteTalk

      } // User Authenticated
    }); // on Auth
}]); //Controller