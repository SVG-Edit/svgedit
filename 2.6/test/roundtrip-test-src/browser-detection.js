/* https://github.com/rahul/js.browser-detection */
window.browser = {
  initialize: function(user_agent) {
    if (user_agent == null) {
      user_agent = null;
    }
    return this.user_agent = user_agent ? user_agent : navigator.userAgent;
  },

  user_agent: navigator.userAgent,

  accept_language: function() {
    'use strict';
    return this.LANGUAGES[(navigator.userLanguage || navigator.language || 'en-US').toLowerCase()];
  },
  NAMES: {
    android: 'Android',
    blackberry: 'BlackBerry',
    chrome: 'Chrome',
    firefox: 'Firefox',
    ie: 'Internet Explorer',
    ipad: 'iPad',
    iphone: 'iPhone',
    ipod: 'iPod Touch',
    opera: 'Opera',
    other: 'Other',
    safari: 'Safari',
    psp: 'PlayStation Portable',
    quicktime: 'QuickTime',
    core_media: 'Apple CoreMedia'
  },
  VERSIONS: {
    _default: /(?:Version|MSIE|Firefox|Chrome|QuickTime|BlackBerry[^\/]+|CoreMedia v)[\/ ]?([a-z0-9.]+)/i,
    opera: /Opera\/.*? Version\/([\d.]+)/
  },
  TRIDENT_VERSION_REGEX: /Trident\/([0-9.]+)/,
  LANGUAGES: {
    af: 'Afrikaans',
    sq: 'Albanian',
    eu: 'Basque',
    bg: 'Bulgarian',
    be: 'Byelorussian',
    ca: 'Catalan',
    zh: 'Chinese',
    'zh-cn': 'Chinese/China',
    'zh-tw': 'Chinese/Taiwan',
    'zh-hk': 'Chinese/Hong Kong',
    'zh-sg': 'Chinese/singapore',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    nl: 'Dutch',
    'nl-nl': 'Dutch/Netherlands',
    'nl-be': 'Dutch/Belgium',
    en: 'English',
    'en-gb': 'English/United Kingdom',
    'en-us': 'English/United States',
    'en-au': 'English/Australian',
    'en-ca': 'English/Canada',
    'en-nz': 'English/New Zealand',
    'en-ie': 'English/Ireland',
    'en-za': 'English/South Africa',
    'en-jm': 'English/Jamaica',
    'en-bz': 'English/Belize',
    'en-tt': 'English/Trinidad',
    et: 'Estonian',
    fo: 'Faeroese',
    fa: 'Farsi',
    fi: 'Finnish',
    fr: 'French',
    'fr-be': 'French/Belgium',
    'fr-fr': 'French/France',
    'fr-ch': 'French/Switzerland',
    'fr-ca': 'French/Canada',
    'fr-lu': 'French/Luxembourg',
    gd: 'Gaelic',
    gl: 'Galician',
    de: 'German',
    'de-at': 'German/Austria',
    'de-de': 'German/Germany',
    'de-ch': 'German/Switzerland',
    'de-lu': 'German/Luxembourg',
    'de-li': 'German/Liechtenstein',
    el: 'Greek',
    he: 'Hebrew',
    'he-il': 'Hebrew/Israel',
    hi: 'Hindi',
    hu: 'Hungarian',
    'ie-ee': 'Internet Explorer/Easter Egg',
    is: 'Icelandic',
    id: 'Indonesian',
    "in": 'Indonesian',
    ga: 'Irish',
    it: 'Italian',
    'it-ch': 'Italian/ Switzerland',
    ja: 'Japanese',
    km: 'Khmer',
    'km-kh': 'Khmer/Cambodia',
    ko: 'Korean',
    lv: 'Latvian',
    lt: 'Lithuanian',
    mk: 'Macedonian',
    ms: 'Malaysian',
    mt: 'Maltese',
    no: 'Norwegian',
    pl: 'Polish',
    pt: 'Portuguese',
    'pt-br': 'Portuguese/Brazil',
    rm: 'Rhaeto-Romanic',
    ro: 'Romanian',
    'ro-mo': 'Romanian/Moldavia',
    ru: 'Russian',
    'ru-mo': 'Russian /Moldavia',
    sr: 'Serbian',
    sk: 'Slovack',
    sl: 'Slovenian',
    sb: 'Sorbian',
    es: 'Spanish',
    'es-do': 'Spanish',
    'es-ar': 'Spanish/Argentina',
    'es-co': 'Spanish/Colombia',
    'es-mx': 'Spanish/Mexico',
    'es-es': 'Spanish/Spain',
    'es-gt': 'Spanish/Guatemala',
    'es-cr': 'Spanish/Costa Rica',
    'es-pa': 'Spanish/Panama',
    'es-ve': 'Spanish/Venezuela',
    'es-pe': 'Spanish/Peru',
    'es-ec': 'Spanish/Ecuador',
    'es-cl': 'Spanish/Chile',
    'es-uy': 'Spanish/Uruguay',
    'es-py': 'Spanish/Paraguay',
    'es-bo': 'Spanish/Bolivia',
    'es-sv': 'Spanish/El salvador',
    'es-hn': 'Spanish/Honduras',
    'es-ni': 'Spanish/Nicaragua',
    'es-pr': 'Spanish/Puerto Rico',
    sx: 'Sutu',
    sv: 'Swedish',
    'sv-se': 'Swedish/Sweden',
    'sv-fi': 'Swedish/Finland',
    ts: 'Thai',
    tn: 'Tswana',
    tr: 'Turkish',
    uk: 'Ukrainian',
    ur: 'Urdu',
    vi: 'Vietnamese',
    xh: 'Xshosa',
    ji: 'Yiddish',
    zu: 'Zulu'
  },
  name: function() {
    'use strict';
    return this.NAMES[this.id()];
  },
  id: function() {
    'use strict';
    if (this.is_chrome()) {
      return 'chrome';
    } else if (this.on_iphone()) {
      return 'iphone';
    } else if (this.on_ipad()) {
      return 'ipad';
    } else if (this.on_ipod()) {
      return 'ipod';
    } else if (this.is_ie()) {
      return 'ie';
    } else if (this.is_opera()) {
      return 'opera';
    } else if (this.is_firefox()) {
      return 'firefox';
    } else if (this.on_android()) {
      return 'android';
    } else if (this.on_blackberry()) {
      return 'blackberry';
    } else if (this.is_safari()) {
      return 'safari';
    } else if (this.on_psp()) {
      return 'psp';
    } else if (this.is_quicktime()) {
      return 'quicktime';
    } else if (this.is_core_media()) {
      return 'core_media';
    } else {
      return 'other';
    }
  },
  version: function() {
    'use strict';
    return this.full_version().toString().split('.')[0];
  },
  full_version: function() {
    'use strict';

    var id, version;
    id = this.id();
    version = null;
    if (id !== 'opera') {
      id = '_default';
    }
    version = this.user_agent.match(this.VERSIONS[id]);
    if (version !== null) {
      version = RegExp.$1;
    }
    return version || '0.0';
  },
  version_gt: function(lower_bound) {
    'uses strict';
    return parseInt(this.version(), 10) > lower_bound;
  },
  version_lt: function(upper_bound) {
    'uses strict';
    return parseInt(this.version(), 10) < upper_bound;
  },
  is_capable: function() {
    'use strict';
    return this.uses_webkit() || this.is_firefox() || this.is_opera() || (this.is_ie() && parseInt(this.version, 10) >= 7);
  },
  has_compatibility_view: function() {
    'use strict';
    return this.is_ie() && !!this.user_agent.match(this.TRIDENT_VERSION_REGEX) && (parseInt(this.version(), 10) < (parseInt(RegExp.$1, 10) + 4));
  },
  uses_webkit: function() {
    'use strict';
    return !!this.user_agent.match(/AppleWebKit/i);
  },
  on_ios: function() {
    'use strict';
    return this.on_ipod() || this.on_ipad() || this.on_iphone();
  },
  on_mobile: function() {
    'use strict';
    return !!this.user_agent.match(/(Mobi(le)?|Symbian|MIDP|Windows CE)/) || this.on_blackberry() || this.on_psp() || this.is_opera_mini();
  },
  is_quicktime: function() {
    'use strict';
    return !!this.user_agent.match(/QuickTime/i);
  },
  on_blackberry: function() {
    'use strict';
    return !!this.user_agent.match(/BlackBerry/);
  },
  on_android: function() {
    'use strict';
    return !!this.user_agent.match(/Android/) && !this.is_opera();
  },
  is_core_media: function() {
    'use strict';
    return !!this.user_agent.match(/CoreMedia/);
  },
  on_iphone: function() {
    'use strict';
    return !!this.user_agent.match(/iPhone/);
  },
  on_ipad: function() {
    'use strict';
    return !!this.user_agent.match(/iPad/);
  },
  on_ipod: function() {
    'use strict';
    return !!this.user_agent.match(/iPod/);
  },
  is_safari: function() {
    'use strict';
    return this.user_agent.match(/Safari/) && !this.user_agent.match(/Chrome/);
  },
  is_firefox: function() {
    'use strict';
    return !!this.user_agent.match(/Firefox/);
  },
  is_chrome: function() {
    'use strict';
    return !!this.user_agent.match(/Chrome/);
  },
  is_ie: function() {
    'use strict';
    return !!this.user_agent.match(/MSIE/) && !this.user_agent.match(/Opera/);
  },
  is_ie6: function() {
    'use strict';
    return this.is_ie() && this.version() === '6';
  },
  is_ie7: function() {
    'use strict';
    return this.is_ie() && this.version() === '7';
  },
  is_ie8: function() {
    'use strict';
    return this.is_ie() && this.version() === '8';
  },
  is_ie9: function() {
    'use strict';
    return this.is_ie() && this.version() === '9';
  },
  on_psp: function() {
    'use strict';
    return !!this.user_agent.match(/PSP/);
  },
  is_opera: function() {
    'use strict';
    return !!this.user_agent.match(/Opera/);
  },
  is_opera_mini: function() {
    'use strict';
    return !!this.user_agent.match(/Opera Mini/);
  },
  on_mac: function() {
    'use strict';
    return !!this.user_agent.match(/Mac OS X/);
  },
  on_windows: function() {
    'use strict';
    return !!this.user_agent.match(/Windows/);
  },
  on_linux: function() {
    'use strict';
    return !!this.user_agent.match(/Linux/);
  },
  on_tablet: function() {
    'use strict';
    return this.on_ipad() || (this.on_android() && !this.on_mobile());
  },
  on_kindle: function() {
    'use strict';
    return !!this.user_agent.match(/Kindle/);
  },
  platform: function() {
    'use strict';
    if (this.on_linux()) {
      return 'linux';
    } else if (this.on_mac()) {
      return 'mac';
    } else if (this.on_windows()) {
      return 'windows';
    } else {
      return 'other';
    }
  },
  meta: function() {
    'use strict';

    var meta_data;
    meta_data = [];
    meta_data.push(this.id());
    if (this.uses_webkit()) {
      meta_data.push('webkit');
    }
    if (this.on_ios()) {
      meta_data.push('ios');
    }
    if (this.is_safari()) {
      meta_data.push('safari safari' + this.version());
    }
    if (!(this.is_safari() || this.is_chrome())) {
      meta_data.push(this.id() + this.version());
    }
    meta_data.push(this.platform());
    if (this.is_capable()) {
      meta_data.push('capable');
    }
    if (this.on_mobile()) {
      meta_data.push('mobile');
    }
    return meta_data;
  },
  to_string: function() {
    'use strict';
    return this.meta().join(' ');
  }
};

window.browser.initialize();