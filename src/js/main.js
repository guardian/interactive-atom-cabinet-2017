var el = document.createElement('script');
el.src = '<%= path %>/app.js';
document.body.appendChild(el);

var btn = document.querySelector('.expand-btn')
var div = document.querySelector('.chart-wrapper')
btn.addEventListener('click', function(){

  div.setAttribute('class', 'chart-wrapper')
  btn.style.display = "none";
  window.resize();

})
