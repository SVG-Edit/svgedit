export default {
  name: 'Arrows',
  langList: [
    {id: 'arrow_none', textContent: 'Sans flèche'}
  ],
  contextTools: [
    {
      title: 'Select arrow type',
      options: {
        none: 'No arrow',
        end: '----&gt;',
        start: '&lt;----',
        both: '&lt;---&gt;',
        mid: '--&gt;--',
        mid_bk: '--&lt;--'
      }
    }
  ]
};
