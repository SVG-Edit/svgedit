export default {
  select_lib: 'Bilder Bibliothek auswählen',
  show_list: 'Liste aller Bibliotheken anzeigen',
  import_single: 'Einzelne importieren',
  import_multi: 'Mehrere importieren',
  open: 'Öffnen als neues Dokument',
  buttons: [
    {
      title: 'Bilder-Bibliothek'
    }
  ],
  imgLibs: [
    {
      name: 'Demo Bibliothek (lokal)',
      url: 'extensions/ext-imagelib/index.html',
      description: 'Demo Bibltiothek für svg-edit auf diesem Server'
    },
    {
      name: 'IAN Symbol Bibliothek',
      url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php?svgedit=3',
      description: 'Kostenlose Bibliothek mit Illustrationen'
    }
    /*
    // See message in "en" locale for further details
    ,
    {
      name: 'Openclipart',
      url: 'https://openclipart.org/svgedit',
      description: 'Share and Use Images. Over 100,000 Public Domain SVG Images and Growing.'
    }
    */
  ]
};
