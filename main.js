(function(){
  var WA_NUMBER = '996705750441'; // номер WhatsApp без +
  var PRICE = 350;              // цена за м² в $
  function wa(text){ return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function fmt(n){ return n.toLocaleString('ru-RU').replace(/ /g,' '); }

  // Калькулятор
  var area = document.getElementById('area');
  if (area) {
    var areaOut = document.getElementById('areaOut'), totalOut = document.getElementById('totalOut');
    var paint = function(){
      var a = +area.value, pct = (a - area.min) / (area.max - area.min) * 100;
      area.style.background = 'linear-gradient(to right,#0071e3 ' + pct + '%,#3a3a3c ' + pct + '%)';
      areaOut.textContent = a; totalOut.textContent = fmt(a * PRICE);
      [areaOut, totalOut].forEach(function(el){ el.classList.add('bump'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('bump'); }, 180); });
    };
    area.addEventListener('input', paint); paint();
  }

  // Заявка → WhatsApp
  var lf = document.getElementById('leadForm');
  if (lf) lf.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('name').value.trim(), phone = document.getElementById('phone').value.trim();
    var msg = 'Здравствуйте! Хочу заказать бесплатный замер.\nИмя: ' + name + '\nТелефон: ' + phone +
      (area ? '\nПлощадь: ' + area.value + ' м² (ориентировочно от $' + fmt(area.value * PRICE) + ')' : '');
    window.open(wa(msg), '_blank');
  });

  // Все ссылки на WhatsApp
  var hello = 'Здравствуйте! Интересует ремонт квартиры под ключ.';
  document.querySelectorAll('a[href="https://wa.me/"],a[data-wa]').forEach(function(a){
    a.href = wa(a.getAttribute('data-wa') || hello); a.target = '_blank'; a.rel = 'noopener';
  });
})();
