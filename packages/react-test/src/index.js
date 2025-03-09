import React from 'react'
import ReactDOM from 'react-dom/client'

import ReactTest from './ReactTest'

const name = 'react-test'
const div = document.createElement('div')
const root = ReactDOM.createRoot(div)

export default {
  name,
  async init () {
    return {
      name,
      eventBased: true, // if eventbased is true, the extensions needs to listen to svgedit events
      callback () {
        // position the div used by React in the left bar
        document.getElementById('tools_left').append(div)
        root.render(<ReactTest svgEdit={this} trigger='callback' />)
      }
    }
  }
}
