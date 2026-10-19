// Smooth fade when you click a link to another page
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]');
  if (!a) return;
  var h = a.getAttribute('href');
  if (!h || h.charAt(0) === '#' || a.target || /^(https?:|mailto:)/.test(h)) return;
  e.preventDefault();
  document.body.classList.add('leaving');
  setTimeout(function () { location.href = h; }, 350);
});
addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });

// Panels fade and rise into place as you scroll
var io = new IntersectionObserver(function (items) {
  items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add('in'); io.unobserve(it.target); } });
}, { threshold: .1 });
document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
