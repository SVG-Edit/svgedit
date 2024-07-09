export default {

  ToolExtensions: {
    common: [
      'ext-push-message-save',
      // 'ext-shapes',
      'ext-bluetriangle',
      'ext-redcircle',
      'ext-cone',
      // 'ext-arrows',
    ],
    soccer: [
      'ext-soccerpass',
      'ext-soccerrun',
      'ext-soccerrunball',
      'ext-orangetriangle',
      'ext-soccerball',
      'ext-soccernet',
    ],
    basketball: [
      'ext-basketball.js',
      'ext-basketballnet.js',
      'ext-basketballrun.js',
      'ext-basketballrunball.js',
      'ext-basketballpass.js',
    ],
    hockey: [
      'ext-hockeypuck.js',
      'ext-hockeynet.js',
      'ext-hockeyskate.js',
      'ext-hockeyskatepuck.js',
      'ext-hockeypass.js',
    ],
    lacrosse: [
      'ext-lacrosseball.js',
      'ext-lacrossepass.js',
      'ext-lacrosserun.js',
      'ext-lacrosserunball.js',
    ],
    rugby: [
      'ext-rugbyball.js',
      'ext-soccerrun.js',
      'ext-soccerrunball.js',
      'ext-soccerpass.js',
    ],
    volleyball: [
      'ext-volleyball.js',
      'ext-soccerrun.js',
      'ext-soccerrunball.js',
      'ext-soccerpass.js',
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
