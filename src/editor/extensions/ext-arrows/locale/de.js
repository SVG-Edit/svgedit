export default {
  name: 'Arrows',
  langList: [
    {id: 'arrow_none', textContent: 'Kein Pfeil'}
  ],
  contextTools: [
    {
      title: 'Pfeiltyp auswählen',
      options: {
        none: 'Kein Pfeil',
        end: '----&gt;',
        start: '&lt;----',
        both: '&lt;---&gt;',
        mid: '--&gt;--',
        mid_bk: '--&lt;--'
      }
    }
  ]
};
