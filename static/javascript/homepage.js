function popupon() {
  var modal = document.getElementById("popupbox");
  modal.style.display = "block";
}

window.onclick = function(event) {
    var modal = document.getElementById("popupbox");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }