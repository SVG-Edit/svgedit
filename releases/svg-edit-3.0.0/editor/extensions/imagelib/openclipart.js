import {jml, body, nbsp} from '../../external/jamilih/jml-es.js';

import $ from '../../external/query-result/esm/index.js';
import {manipulation} from '../../external/qr-manipulation/dist/index-es.js';
manipulation($, jml);

const baseAPIURL = 'https://openclipart.org/search/json/';

async function processResults (url) {
  function queryLink (query) {
    return ['a', {
      href: 'javascript: void(0);',
      dataset: {value: query},
      $on: {click (e) {
        e.preventDefault();
        const {value} = this.dataset;
        $('#query')[0].$set(value);
        $('#openclipart')[0].$submit();
      }}
    }, [query]];
  }

  const r = await fetch(url);
  const json = await r.json();
  console.log('json', json);

  if (!json || json.msg !== 'success') {
    alert('There was a problem downloading the results');
    return;
  }
  const {payload, info: {
    results: numResults,
    pages,
    current_page: currentPage
  }} = json;

  // $('#page')[0].value = currentPage;
  // $('#page')[0].max = pages;

  // Unused properties:
  // - `svg_filesize` always 0?
  // - `dimensions: {
  //      png_thumb: {width, height},
  //      png_full_lossy: {width, height}
  //    }` object of relevance?
  // - No need for `tags` with `tags_array`
  // - `svg`'s: `png_thumb`, `png_full_lossy`, `png_2400px`
  const semiColonSep = '; ' + nbsp;
  $('#results').jml('div', [
    ['span', [
      'Number of results: ',
      numResults
    ]],
    semiColonSep,
    ['span', [
      'page ',
      currentPage,
      ' out of ',
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
      const imgHW = '100px';
      const colonSep = ': ' + nbsp;
      return ['div', [
        ['button', {style: 'margin-right: 8px; border: 2px solid black;', dataset: {id, value: svgURL}, $on: {
          async click (e) {
            e.preventDefault();
            const {value: svgURL, id} = this.dataset;
            console.log('this', id, svgURL);
            const post = (message) => {
              // Todo: Make origin customizable as set by opening window
              // Todo: If dropping IE9, avoid stringifying
              window.parent.postMessage(JSON.stringify({
                namespace: 'imagelib',
                ...message
              }), '*');
            };
            // Send metadata (also indicates file is about to be sent)
            post({
              name: title,
              id: svgURL
            });
            const result = await fetch(svgURL);
            const svg = await result.text();
            console.log('h', svgURL, svg);
            post({
              href: svgURL,
              data: svg
            });
          }
        }}, [
          // If we wanted interactive versions despite security risk:
          // ['object', {data: svgURL, type: 'image/svg+xml'}]
          ['img', {src: svgURL, style: `width: ${imgHW}; height: ${imgHW};`}]
        ]],
        ['b', [title]],
        ' ',
        ['i', [description]],
        ' ',
        ['span', [
          '(ID: ',
          ['a', {
            href: 'javascript: void(0);',
            dataset: {value: id},
            $on: {
              click (e) {
                e.preventDefault();
                const {value} = this.dataset;
                $('#byids')[0].$set(value);
                $('#openclipart')[0].$submit();
              }
            }
          }, [id]],
          ')'
        ]],
        ' ',
        ['i', [
          ['a', {
            href: detailLink,
            target: '_blank'
          }, ['Details']]
        ]],
        ['br'],
        ['span', [
          ['u', ['Uploaded by']], colonSep,
          queryLink(uploader),
          semiColonSep
        ]],
        ['span', [
          ['u', ['Download count']], colonSep,
          downloadedBy,
          semiColonSep
        ]],
        ['span', [
          ['u', ['Times used as favorite']], colonSep,
          totalFavorites,
          semiColonSep
        ]],
        ['span', [
          ['u', ['Created date']], colonSep,
          created
        ]],
        ['br'],
        ['u', ['Tags']], colonSep,
        ...tagsArray.map((tag) => {
          return ['span', [
            ' ',
            queryLink(tag)
          ]];
        })
      ]];
    }),
    ['br'], ['br'],
    (currentPage === 1 || pages <= 2
      ? ''
      : ['span', [
        ['a', {
          href: 'javascript: void(0);',
          $on: {
            click (e) {
              e.preventDefault();
              $('#page')[0].value = 1;
              $('#openclipart')[0].$submit();
            }
          }
        }, ['First']],
        ' '
      ]]
    ),
    (currentPage === 1
      ? ''
      : ['span', [
        ['a', {
          href: 'javascript: void(0);',
          $on: {
            click (e) {
              e.preventDefault();
              $('#page')[0].value = currentPage - 1;
              $('#openclipart')[0].$submit();
            }
          }
        }, ['Prev']],
        ' '
      ]]
    ),
    (currentPage === pages
      ? ''
      : ['span', [
        ['a', {
          href: 'javascript: void(0);',
          $on: {
            click (e) {
              e.preventDefault();
              $('#page')[0].value = currentPage + 1;
              $('#openclipart')[0].$submit();
            }
          }
        }, ['Next']],
        ' '
      ]]
    ),
    (currentPage === pages || pages <= 2
      ? ''
      : ['span', [
        ['a', {
          href: 'javascript: void(0);',
          $on: {
            click (e) {
              e.preventDefault();
              $('#page')[0].value = pages;
              $('#openclipart')[0].$submit();
            }
          }
        }, ['Last']],
        ' '
      ]]
    )
  ]);
}

jml('div', [
  ['style', [
    `.control {
      padding-top: 10px;
    }`
  ]],
  ['form', {
    id: 'openclipart',
    $custom: {
      async $submit () {
        const url = new URL(baseAPIURL);
        [
          'query', 'sort', 'amount', 'page', 'byids'
        ].forEach((prop) => {
          const {value} = $('#' + prop)[0];
          if (value) {
            url.searchParams.set(prop, value);
          }
        });
        await processResults(url);
      }
    },
    $on: {
      submit (e) {
        e.preventDefault();
        this.$submit();
      }
    }
  }, [
    // Todo: i18nize
    ['fieldset', [
      ['legend', ['Search terms']],
      ['div', {class: 'control'}, [
        ['label', [
          'Query (Title, description, uploader, or tag): ',
          ['input', {id: 'query', name: 'query', placeholder: 'cat', $custom: {
            $set (value) {
              $('#byids')[0].value = '';
              this.value = value;
            }
          }, $on: {
            change () {
              $('#byids')[0].value = '';
            }
          }}]
        ]]
      ]],
      ['br'],
      ' OR ',
      ['br'],
      ['div', {class: 'control'}, [
        ['label', [
          'IDs (single or comma-separated): ',
          ['input', {id: 'byids', name: 'ids', placeholder: '271380, 265741', $custom: {
            $set (value) {
              $('#query')[0].value = '';
              this.value = value;
            }
          }, $on: {
            change () {
              $('#query')[0].value = '';
            }
          }}]
        ]]
      ]]
    ]],
    ['fieldset', [
      ['legend', ['Configuring results']],
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
      ]]
    ]],
    ['div', {class: 'control'}, [
      ['input', {type: 'submit'}]
    ]]
  ]],
  ['div', {id: 'results'}]
], body);
