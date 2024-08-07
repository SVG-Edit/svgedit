/* globals svgEditor */

const atags = document.querySelectorAll('a')
Array.prototype.forEach.call(atags, function (aEle) {
  svgEditor.$click(aEle, function (event) {
    event.preventDefault()
    const { href } = event.currentTarget
    const target = window.parent
    const post = (message) => {
      // Todo: Make origin customizable as set by opening window
      // Todo: If dropping IE9, avoid stringifying
      target.postMessage(JSON.stringify({
        namespace: 'imagelib',
        ...message
      }), '*')
    }
    // Convert Non-SVG images to data URL first
    // (this could also have been done server-side by the library)
    // Send metadata (also indicates file is about to be sent)
    post({
      name: event.currentTarget.textContent,
      id: href
    })
    if (!href.includes('.svg')) {
      const img = new Image()
      img.addEventListener('load', function () {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height
        // load the raster image into the canvas
        canvas.getContext('2d').drawImage(this, 0, 0)
        // retrieve the data: URL
        let data
        try {
          data = canvas.toDataURL()
        } catch (err) {
          // This fails in Firefox with `file:///` URLs :(
          // Todo: This could use a generic alert library instead
          alert('Data URL conversion failed: ' + err)
          data = ''
        }
        post({ href, data })
      })
      img.src = href
    } else {
      fetch(href)
        .then((r) => r.text())
        .then((data) => {
          post({ href, data })
          return data
        })
        .catch((error) => console.error(error))
    }
    return false
  })
})
