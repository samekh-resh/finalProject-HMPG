var thumbUp = document.getElementsByClassName("fa-thumbs-up");
var saveHousing = document.getElementsByClassName("save-housing");
var saveTopic = document.getElementsByClassName("save-topic");
var topicTrash = document.getElementsByClassName("topic-trash");
var housingTrash = document.getElementsByClassName("housing-trash");

// Array.from(thumbUp).forEach(function(element) {
//       element.addEventListener('click', function(){
//         const name = this.parentNode.parentNode.childNodes[1].innerText
//         const msg = this.parentNode.parentNode.childNodes[3].innerText
//         const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//         fetch('messages', {
//           method: 'put',
//           headers: {'Content-Type': 'application/json'},
//           body: JSON.stringify({
//             'name': name,
//             'msg': msg,
//             'thumbUp':thumbUp
//           })
//         })
//         .then(response => {
//           if (response.ok) return response.json()
//         })
//         .then(data => {
//           console.log(data)
//           window.location.reload(true)
//         })
//       });
// });

Array.from(saveHousing).forEach(function(element) {
      element.addEventListener('click', function(){

        // const name = this.parentNode.parentNode.childNodes[1].innerText
        // const msg = this.parentNode.parentNode.childNodes[3].innerText
        // const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        console.log(element.dataset.id)
        fetch('saveHousing', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            postId: element.dataset.id
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});
Array.from(saveTopic).forEach(function(element) {
      element.addEventListener('click', function(){

        // const name = this.parentNode.parentNode.childNodes[1].innerText
        // const msg = this.parentNode.parentNode.childNodes[3].innerText
        // const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
        console.log(element.dataset.id)
        fetch('saveTopic', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            postId: element.dataset.id
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});
Array.from(topicTrash).forEach(function(element) {
      element.addEventListener('click', function(){
      console.log(element.dataset.id)
        fetch('delete', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: element.dataset.id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
Array.from(housingTrash).forEach(function(element) {
      element.addEventListener('click', function(){
      console.log(element.dataset.id)
        fetch('deleteHousing', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: element.dataset.id
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
