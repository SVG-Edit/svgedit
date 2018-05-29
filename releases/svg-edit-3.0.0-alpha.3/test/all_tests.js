const iframes = document.querySelectorAll('iframe');
[...iframes].forEach((f) => {
  f.addEventListener('load', () => {
    f.contentWindow.QUnit.done(() => {
      f.style.height = (f.contentDocument.body.scrollHeight + 20) + 'px';
    });
  });
});
