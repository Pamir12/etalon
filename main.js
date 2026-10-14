(function(){
  var WA_NUMBER = '996705750441'; // номер WhatsApp без +
  var PRICE = 350;                // цена за м² в $
  function wa(text){ return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function fmt(n){ return Math.round(n).toLocaleString('ru-RU').replace(/ /g,' '); }
  function $(id){ return document.getElementById(id); }
  function bump(el){ if(!el) return; el.classList.add('bump'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('bump'); }, 180); }
  function toast(text){
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = text; document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('out'); }, 1800); setTimeout(function(){ t.remove(); }, 2300);
  }

  /* ---------- Калькулятор по площади ---------- */
  var area = $('area');
  if (area) {
    var areaOut = $('areaOut'), totalOut = $('totalOut');
    var paint = function(){
      var a = +area.value, pct = (a - area.min) / (area.max - area.min) * 100;
      area.style.background = 'linear-gradient(to right,#0071e3 ' + pct + '%,#3a3a3c ' + pct + '%)';
      areaOut.textContent = a; totalOut.textContent = fmt(a * PRICE); bump(areaOut); bump(totalOut);
    };
    area.addEventListener('input', paint); paint();
  }

  /* ---------- Заявка → WhatsApp ---------- */
  var lf = $('leadForm');
  if (lf) lf.addEventListener('submit', function(e){
    e.preventDefault();
    var msg = 'Здравствуйте! Хочу заказать бесплатный замер.\nИмя: ' + $('name').value.trim() + '\nТелефон: ' + $('phone').value.trim() +
      (area ? '\nПлощадь: ' + area.value + ' м² (ориентировочно от $' + fmt(area.value * PRICE) + ')' : '');
    window.open(wa(msg), '_blank');
  });

  /* ---------- Калькулятор по комнатам ---------- */
  var rc = $('roomCalc');
  if (rc) {
    var rows = rc.querySelectorAll('[data-room]');
    var rcPaint = function(){
      var total = 0, parts = [];
      rows.forEach(function(r){ var v = +r.querySelector('input').value || 0; total += v; parts.push([r, v]); });
      parts.forEach(function(p){
        var bar = p[0].querySelector('.rbar'), price = p[0].querySelector('.rprice');
        bar.style.width = (total ? p[1] / total * 100 : 0) + '%';
        price.textContent = p[1] ? '$' + fmt(p[1] * PRICE) : '—';
      });
      $('rcArea').textContent = fmt(total); $('rcTotal').textContent = fmt(total * PRICE); bump($('rcTotal'));
    };
    rows.forEach(function(r){
      var inp = r.querySelector('input');
      r.querySelectorAll('[data-step]').forEach(function(b){
        b.addEventListener('click', function(){ inp.value = Math.max(0, Math.min(300, (+inp.value || 0) + (+b.getAttribute('data-step')))); rcPaint(); });
      });
      inp.addEventListener('input', rcPaint);
    });
    rcPaint();
    var rcSend = $('rcSend');
    if (rcSend) rcSend.addEventListener('click', function(e){
      e.preventDefault();
      var lines = []; rows.forEach(function(r){ var v = +r.querySelector('input').value || 0; if (v) lines.push(r.getAttribute('data-room') + ': ' + v + ' м²'); });
      window.open(wa('Здравствуйте! Посчитал ремонт по комнатам:\n' + lines.join('\n') + '\nИтого: ' + $('rcArea').textContent + ' м², ориентировочно от $' + $('rcTotal').textContent + '\nХочу точную смету.'), '_blank');
    });
  }

  /* ---------- Квиз ---------- */
  var quiz = $('quiz');
  if (quiz) {
    var steps = quiz.querySelectorAll('.qstep'), bar = $('qbar'), cur = 0, ans = {};
    var qArea = $('qArea'), qAreaOut = $('qAreaOut');
    var show = function(i){
      cur = i;
      steps.forEach(function(s, k){ s.hidden = k !== i; });
      bar.style.width = ((i) / (steps.length - 1) * 100) + '%';
      $('qcount').textContent = i < steps.length - 1 ? 'Вопрос ' + (i + 1) + ' из ' + (steps.length - 1) : 'Готово!';
      $('qback').style.visibility = i > 0 && i < steps.length ? 'visible' : 'hidden';
      if (i === steps.length - 1) {
        var a = +qArea.value;
        $('qResArea').textContent = a; $('qResTotal').textContent = fmt(a * PRICE);
        $('qSummary').textContent = [ans.type, a + ' м²', ans.style, ans.when, ans.pack].filter(Boolean).join(' · ');
      }
      quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    quiz.querySelectorAll('.qopt').forEach(function(b){
      b.addEventListener('click', function(){
        var key = b.closest('.qstep').getAttribute('data-key');
        ans[key] = b.getAttribute('data-v') || b.textContent.trim();
        b.closest('.qopts').querySelectorAll('.qopt').forEach(function(o){ o.classList.toggle('sel', o === b); });
        setTimeout(function(){ show(cur + 1); }, 220);
      });
    });
    if (qArea) {
      var qp = function(){ var p = (qArea.value - qArea.min) / (qArea.max - qArea.min) * 100;
        qArea.style.background = 'linear-gradient(to right,#0071e3 ' + p + '%,#d2d2d7 ' + p + '%)'; qAreaOut.textContent = qArea.value; bump(qAreaOut); };
      qArea.addEventListener('input', qp); qp();
    }
    $('qnext').addEventListener('click', function(){ show(cur + 1); });
    $('qback').addEventListener('click', function(){ if (cur > 0) show(cur - 1); });
    $('qform').addEventListener('submit', function(e){
      e.preventDefault();
      var msg = 'Здравствуйте! Прошёл подбор ремонта на сайте.\n' +
        'Жильё: ' + (ans.type || '—') + '\nПлощадь: ' + qArea.value + ' м²\nСтиль: ' + (ans.style || '—') +
        '\nКогда начать: ' + (ans.when || '—') + '\nПакет: ' + (ans.pack || '—') +
        '\nОриентировочно: от $' + fmt(qArea.value * PRICE) + '\nИмя: ' + $('qname').value.trim() + '\nТелефон: ' + $('qphone').value.trim();
      window.open(wa(msg), '_blank');
    });
    show(0);
  }

  /* ---------- Запись на замер ---------- */
  var bk = $('booking');
  if (bk) {
    var days = $('bkDays'), times = $('bkTimes'), pick = { d: null, t: null };
    var wd = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'], mn = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
    var d = new Date(); d.setHours(0,0,0,0); var added = 0;
    while (added < 12) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) continue;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'slot day';
      b.innerHTML = '<span>' + wd[d.getDay()] + '</span><b>' + d.getDate() + '</b><span>' + mn[d.getMonth()] + '</span>';
      b.setAttribute('data-v', wd[d.getDay()] + ', ' + d.getDate() + ' ' + mn[d.getMonth()]);
      days.appendChild(b); added++;
    }
    ['10:00','12:00','14:00','16:00','18:00'].forEach(function(t){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'slot'; b.textContent = t; b.setAttribute('data-v', t); times.appendChild(b);
    });
    var sel = function(box, key){ box.addEventListener('click', function(e){
      var b = e.target.closest('.slot'); if (!b) return;
      box.querySelectorAll('.slot').forEach(function(o){ o.classList.toggle('sel', o === b); }); pick[key] = b.getAttribute('data-v');
      $('bkPicked').textContent = (pick.d || 'Выберите день') + (pick.t ? ' в ' + pick.t : '');
    }); };
    sel(days, 'd'); sel(times, 't');
    $('bkForm').addEventListener('submit', function(e){
      e.preventDefault();
      if (!pick.d || !pick.t) { toast('Выберите день и время'); return; }
      window.open(wa('Здравствуйте! Хочу записаться на бесплатный замер.\nКогда: ' + pick.d + ' в ' + pick.t +
        '\nАдрес: ' + $('bkAddr').value.trim() + '\nИмя: ' + $('bkName').value.trim() + '\nТелефон: ' + $('bkPhone').value.trim()), '_blank');
    });
  }

  /* ---------- Чек-лист ---------- */
  var cl = $('checklist');
  if (cl) {
    var boxes = cl.querySelectorAll('input[type=checkbox]'), saved = {};
    try { saved = JSON.parse(localStorage.getItem('etalon-checklist') || '{}'); } catch (e) {}
    var clPaint = function(){
      var done = 0; boxes.forEach(function(b){ if (b.checked) done++; });
      $('clDone').textContent = done; $('clAll').textContent = boxes.length;
      $('clBar').style.width = (done / boxes.length * 100) + '%';
    };
    boxes.forEach(function(b){
      if (saved[b.id]) b.checked = true;
      b.addEventListener('change', function(){
        saved[b.id] = b.checked; try { localStorage.setItem('etalon-checklist', JSON.stringify(saved)); } catch (e) {}
        clPaint();
      });
    });
    clPaint();
    var pr = $('clPrint'); if (pr) pr.addEventListener('click', function(){ window.print(); });
    var rs = $('clReset'); if (rs) rs.addEventListener('click', function(){
      boxes.forEach(function(b){ b.checked = false; }); saved = {}; try { localStorage.removeItem('etalon-checklist'); } catch (e) {} clPaint();
    });
  }

  /* ---------- Поделиться ---------- */
  document.querySelectorAll('[data-share]').forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      var data = { title: 'Эталон — ремонт квартир под ключ', text: 'Посмотри, ремонт под ключ от $350 за м²:', url: 'https://pamir12.github.io/etalon/' };
      if (navigator.share) { navigator.share(data).catch(function(){}); return; }
      if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function(){ toast('Ссылка скопирована'); }, function(){ window.open(wa(data.text + ' ' + data.url), '_blank'); }); }
      else window.open(wa(data.text + ' ' + data.url), '_blank');
    });
  });

  /* ---------- Наверх ---------- */
  var top = $('toTop');
  if (top) {
    var onScroll = function(){ top.classList.toggle('show', window.scrollY > 900); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    top.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Все ссылки на WhatsApp ---------- */
  var hello = document.documentElement.lang === 'ky' ? 'Саламатсызбы! Батирди ачкычка чейин оңдоо кызыктырат.' : 'Здравствуйте! Интересует ремонт квартиры под ключ.';
  document.querySelectorAll('a[href="https://wa.me/"],a[data-wa]').forEach(function(a){
    a.href = wa(a.getAttribute('data-wa') || hello); a.target = '_blank'; a.rel = 'noopener';
  });
})();
