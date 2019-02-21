if ('ga' in window) {
  tracker = ga.getAll()[0];
  if (tracker) {
    const btn = document.getElementById('test');
    btn.addEventListener('click', e => {
      tracker.send({
        hitType: 'event',
        eventCategory: 'Phone',
        eventAction: 'add',
        eventLabel: 'add phone',
        hitCallback: function() {
          console.log('send event');
        },
      });
    });
  }
}
