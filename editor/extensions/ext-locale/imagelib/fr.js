export default {
  select_lib: "Choisir une bibliothèque d'images",
  show_list: 'show_list',
  import_single: 'import_single',
  import_multi: 'import_multi',
  open: 'open',
  buttons: [
    {
      title: 'Image library'
    }
  ],
  imgLibs: [
    {
      name: 'Demo library (local)',
      url: '{path}imagelib/index{modularVersion}.html',
      description: 'Demonstration library for SVG-edit on this server'
    },
    {
      name: 'IAN Symbol Libraries',
      url: 'https://ian.umces.edu/symbols/catalog/svgedit/album_chooser.php',
      description: 'Free library of illustrations'
    },
    {
      name: 'Openclipart',
      url: 'https://openclipart.org/svgedit',
      description: 'Share and Use Images. Over 50,000 Public Domain SVG Images and Growing.'
    }
  ]
};
