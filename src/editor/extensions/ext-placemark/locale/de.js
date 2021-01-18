export default {
  name: 'placemark',
  langList: [
    {id: 'nomarker', title: 'Keine Markierung'},
    {id: 'leftarrow', title: 'Pfeil links'},
    {id: 'rightarrow', title: 'Pfeil rechts'},
    {id: 'forwardslash', title: 'Schrägstrich'},
    {id: 'reverseslash', title: 'Umgekehrter Schrägstrich'},
    {id: 'verticalslash', title: 'Vertikaler Strich'},
    {id: 'box', title: 'Box'},
    {id: 'star', title: 'Stern'},
    {id: 'xmark', title: 'X'},
    {id: 'triangle', title: 'Dreieck'},
    {id: 'mcircle', title: 'Kreis'},
    {id: 'leftarrow_o', title: 'Offener Pfeil links'},
    {id: 'rightarrow_o', title: 'Offener Pfeil rechts'},
    {id: 'box_o', title: 'Offene Box'},
    {id: 'star_o', title: 'Offener Stern'},
    {id: 'triangle_o', title: 'Offenes Dreieck'},
    {id: 'mcircle_o', title: 'Offener Kreis'}
  ],
  buttons: [
    {
      title: 'Placemark Werkzeug'
    }
  ],
  contextTools: [
    {
      title: 'Typ der Placemark auswählen'
    },
    {
      title: 'Text (mehrere Texte mit Semikolon getrennt)',
      label: 'Text'
    },
    {
      title: 'Schriftart für den Text',
      label: ''
    }
  ]
};
