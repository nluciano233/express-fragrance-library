/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
} 

var cart = document.querySelectorAll('.cart')
for (var i = 0; i<cart.length; i++) {
  cart[i].addEventListener("click", function(){
    alert('Are you sure you can affort that, buddy?')
  })
}
