const fs = require('fs');
['plan.html', 'calendar.html', 'profile.html'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/<a href="calendar.html"([^>]*)>Календарь<\/a>/, '<a href="calendar.html"$1>Календарь</a>\n      <a href="education.html">Обучение</a>');
  fs.writeFileSync(f, c);
  console.log('Updated ' + f);
});
