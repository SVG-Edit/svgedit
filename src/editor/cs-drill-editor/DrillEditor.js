export default {

  ToolExtensions: { //order of extensions determined by LeftPanel.html (appending them via DOM does not preserve order?)
    common: [
      'ext-shapes', // default generic shapes
      'ext-markers', // default line arrows
      'ext-panning',
      'ext-grid',
      'ext-opensave',
      'ext-bluetriangle', //old extensions for backward compatability?
      'ext-redcircle', //old extensions for backward compatability?
      'ext-cs-push-message-save', //save message between vue app and drill editor
      'ext-cs-actions', //run, run w/ ball, pass
      'ext-cs-players', // new blue triangle/red circle, x's and o's, generic players + sport specific players
      // 'ext-cs-positions', // sport specific positions (GK, Left Back, Striker, etc)
      'ext-cs-shapes' // sport specific shapes + common shapes (cone, coach, etc)
    ],
    soccer: [
    ],
    basketball: [
    ],
    hockey: [
    ],
    lacrosse: [
    ],
    rugby: [
    ],
    volleyball: [
      ],
  },

  Templates: {
    soccer: [
      { name: 'Blank Field', filePath: '/soccer/field_blank.svg' },
      { name: 'Full Field', filePath: '/soccer/field_full.svg' },
      { name: 'Full Field with Players', filePath: '/soccer/field_full_w_players.svg' },
      { name: 'Field Top with Players', filePath: '/soccer/field_top_w_players.svg' },
      { name: 'Field Middle with Players', filePath: '/soccer/field_middle_w_players.svg' },
      { name: 'Field Bottom with Players', filePath: '/soccer/field_bottom_w_players.svg' },
      { name: 'Field Top', filePath: '/soccer/field_top.svg' },
      { name: 'Field Bottom', filePath: '/soccer/field_bottom.svg' },
      { name: 'Futsal Court', filePath: '/soccer/futsal_court.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    basketball: [
      { name: 'Full Court', filePath: '/basketball/basketball-court.svg' },
      { name: 'Half Court', filePath: '/basketball/basketball-half-court.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    hockey: [
      { name: 'Full Rink (H)', filePath: '/hockey/full-rink-horiz.svg' },
      { name: 'Full Rink (V)', filePath: '/hockey/full-rink-vert.svg' },
      { name: 'Half Rink', filePath: '/hockey/half-rink.svg' },
      { name: 'Offensive/Defensive Zone', filePath: '/hockey/offense-defense-zone.svg' },
      { name: 'Neutral Zone', filePath: '/hockey/neutral-zone.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    lacrosse: [
      { name: 'Full Field (Boys)', filePath: '/lacrosse/boys-full-field.svg' },
      { name: 'Half Field (Boys)', filePath: '/lacrosse/boys-half-field.svg' },
      { name: 'Full Field (Girls)', filePath: '/lacrosse/girls-full-field.svg' },
      { name: 'Half Field (Girls)', filePath: '/lacrosse/girls-half-field.svg' },
      { name: 'Full Field (Indoor)', filePath: '/lacrosse/box-full-field.svg' },
      { name: 'Half Field (Indoor)', filePath: '/lacrosse/box-half-field.svg' },
      { name: 'Blank Field', filePath: '/lacrosse/field_blank.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    rugby: [
      { name: 'Full Field', filePath: '/rugby/field_full.svg' },
      { name: 'Half Field', filePath: '/rugby/field_half.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    volleyball: [
      { name: 'Full Court', filePath: '/volleyball/court.svg' },
      { name: 'Blank', filePath: '/blank.svg' },
    ],
    default: [
      { name: 'Blank', filePath: '/blank.svg' }
    ]
  },
}
