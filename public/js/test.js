if ('ga' in window) {
  console.log('in');
  tracker = ga.getAll()[0];
  if (tracker) {
    const btn = document.getElementById('test');
    btn.addEventListener('click', e => {
      console.log('click');
      tracker.send('event', 'Phone', 'add', '0501111111');
    });
  }
}
