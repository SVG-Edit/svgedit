import {jml, $, body} from '../../external/jamilih/jml-es.js';

jml('div', [
  ['style', [
    `.control {
      padding-top: 10px;
    }`
  ]],
  ['form', {
    $on: {
      async submit (e) {
        e.preventDefault();
        await this.$submit();
      }
    },
    $custom: {
      async $submit () {
        console.log('submit2');
        const results = $('#results');
        while (results.hasChildNodes()) {
          results.firstChild.remove();
        }
        const url = new URL('https://openclipart.org/search/json/');
        [
          'query', 'sort', 'amount', 'page'
        ].forEach((prop) => {
          const {value} = $('#' + prop);
          url.searchParams.set(prop, value);
        });
        const r = await fetch(url);
        const json = await r.json();

        if (!json || json.msg !== 'success') {
          alert('There was a problem downloading the results');
          return;
        }
        console.log('json', json);
        const {payload, info: {
          results: numResults,
          pages,
          current_page: currentPage
        }} = json;

        // $('#page').value = currentPage;
        // $('#page').max = pages;

        function queryLink (uploader) {
          return ['a', {
            href: '#',
            dataset: {value: uploader},
            $on: {click (e) {
              e.preventDefault();
              const {value} = this.dataset;
              console.log('v0', value);
            }}
          }, [uploader]];
        }

        // Unused properties:
        // - `svg_filesize` always 0?
        // - `dimensions: {
        //      png_thumb: {width, height},
        //      png_full_lossy: {width, height}
        //    }` object of relevance?
        // - No need for `tags` with `tags_array`
        // - `svg`'s: `png_thumb`, `png_full_lossy`, `png_2400px`
        jml(results, [
          ['span', [
            'Number of results: ',
            numResults
          ]],
          ['span', [
            'Page ',
            currentPage,
            'out of: ',
            pages
          ]],
          ...payload.map(({
            title, description, id,
            uploader, created,
            svg: {url: svgURL},
            detail_link: detailLink,
            tags_array: tagsArray,
            downloaded_by: downloadedBy,
            total_favorites: totalFavorites
          }) => {
            return ['div', [
              ['b', [title]],
              ['br'],
              ['i', [description]],
              ['span', [
                ['a', {
                  href: detailLink,
                  target: '_blank'
                }, ['Details']]
              ]],
              ['button', {
                $on: {
                  async click () {
                    const svgURL = this.dataset.value;
                    console.log('this', svgURL);
                    /*
                    const result = await fetch(svgURL);
                    const svg = await result.text();
                    console.log('svg', svg);
                    */
                    // Todo: Pass to our API
                  }
                },
                dataset: {value: svgURL}
              }, [
                'Use SVG'
              ]],
              ['span', [
                '(ID: ',
                ['a', {
                  href: '#',
                  dataset: {value: id},
                  $on: {click (e) {
                    e.preventDefault();
                    const {value} = this.dataset;
                    // Todo: byids for searching by id/comma-separated ids
                    console.log('v', value);
                  }}
                }, [id]],
                ')'
              ]],
              ['span', [
                'Uploaded by: ',
                queryLink(uploader)
              ]],
              ...tagsArray.map((tag) => {
                return ['span', [
                  ' ',
                  queryLink(tag)
                ]];
              }),
              ['span', [
                'Created date: ',
                created
              ]],
              ['span', [
                'Download count: ',
                downloadedBy
              ]],
              ['span', [
                'Times used as favorite: ',
                totalFavorites
              ]]
            ]];
          })
        ]);
      }
    }
  }, [
    // Todo: i18nize
    ['div', {class: 'control'}, [
      ['label', [
        'Query (Title, description, uploader, or tag): ',
        ['input', {id: 'query', name: 'query'}]
      ]]
    ]],
    ['div', {class: 'control'}, [
      ['label', [
        'Sort by: ',
        ['select', {id: 'sort'}, [
          // Todo: i18nize first values
          ['Date', 'date'],
          ['Downloads', 'downloads'],
          ['Favorited', 'favorites']
        ].map(([text, value = text]) => {
          return ['option', {value}, [text]];
        })]
      ]]
    ]],
    ['div', {class: 'control'}, [
      ['label', [
        'Results per page: ',
        ['input', {
          id: 'amount', name: 'amount', value: 10,
          type: 'number', min: 1, max: 200, step: 1, pattern: '\\d+'}]
      ]]
    ]],
    ['div', {class: 'control'}, [
      ['label', [
        'Page number: ',
        ['input', {
          // max: 1, // We'll change this based on available results
          id: 'page', name: 'page', value: 1, style: 'width: 40px;',
          type: 'number', min: 1, step: 1, pattern: '\\d+'
        }]
      ]]
    ]],
    ['div', {class: 'control'}, [
      ['input', {type: 'submit'}]
    ]]
  ]],
  ['div', {id: 'results'}]
], body);
