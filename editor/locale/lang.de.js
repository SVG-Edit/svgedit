/* eslint-disable quotes */
/* globals svgEditor */
svgEditor.readLang({
	lang: "de",
	dir: "ltr",
	common: {
		"ok": "OK",
		"cancel": "Abbrechen",
		"key_backspace": "Rücktaste",
		"key_del": "Löschen",
		"key_down": "nach unten",
		"key_up": "nach oben",
		"more_opts": "Mehr Optionen",
		"url": "URL",
		"width": "Breite",
		"height": "Höhe"
	},
	misc: {
		"powered_by": "powered by"
	},
	ui: {
		"toggle_stroke_tools": "Zeige/Verberge weitere Linien-Werkzeuge",
		"palette_info": "Klick zum Ändern der Füllfarbe, Shift-Klick zum Ändern der Linienfarbe",
		"zoom_level": "vergrößern",
		"panel_drag": "Nach links/rechts ziehen, um die Größe vom Seitenpanel zu ändern"
	},
	properties: {
		"id": "Element identifizieren",
		"fill_color": "Füllfarbe ändern",
		"stroke_color": "Linienfarbe ändern",
		"stroke_style": "Linienstil ändern",
		"stroke_width": "Linienbreite ändern",
		"pos_x": "Ändere die X-Koordinate",
		"pos_y": "Ändere die Y-Koordinate",
		"linecap_butt": "Form der Linienendung: Stumpf",
		"linecap_round": "Form der Linienendung: Rund",
		"linecap_square": "Form der Linienendung: Rechteckig",
		"linejoin_bevel": "Zusammentreffen von zwei Linien: abgeschrägte Kante",
		"linejoin_miter": "Zusammentreffen von zwei Linien: Gehrung",
		"linejoin_round": "Zusammentreffen von zwei Linien: Rund",
		"angle": "Drehwinkel ändern",
		"blur": "Ändere Wert des Gaußschen Weichzeichners",
		"opacity": "Opazität des ausgewählten Objekts ändern",
		"circle_cx": "Kreiszentrum (cx) ändern",
		"circle_cy": "Kreiszentrum (cy) ändern",
		"circle_r": "Kreisradius (r) ändern",
		"ellipse_cx": "Ellipsenzentrum (cx) ändern",
		"ellipse_cy": "Ellipsenzentrum (cy) ändern",
		"ellipse_rx": "Ellipsenradius (x) ändern",
		"ellipse_ry": "Ellipsenradius (y) ändern",
		"line_x1": "X-Koordinate des Linienanfangs ändern",
		"line_x2": "X-Koordinate des Linienendes ändern",
		"line_y1": "Y-Koordinate des Linienanfangs ändern",
		"line_y2": "Y-Koordinate des Linienendes ändern",
		"rect_height": "Höhe des Rechtecks ändern",
		"rect_width": "Breite des Rechtecks ändern",
		"corner_radius": "Eckenradius des Rechtecks ändern",
		"image_width": "Bildbreite ändern",
		"image_height": "Bildhöhe ändern",
		"image_url": "URL ändern",
		"node_x": "Ändere die X-Koordinate des Knoten",
		"node_y": "Ändere die Y-Koordinate des Knoten",
		"seg_type": "Ändere den Typ des Segments",
		"straight_segments": "Gerade",
		"curve_segments": "Kurve",
		"text_contents": "Textinhalt erstellen und bearbeiten",
		"font_family": "Schriftart wählen",
		"font_size": "Schriftgröße einstellen",
		"bold": "Fetter Text",
		"italic": "Kursiver Text"
	},
	tools: {
		"main_menu": "Hauptmenü",
		"bkgnd_color_opac": "Hintergrundfarbe ändern / Opazität",
		"connector_no_arrow": "Kein Pfeil",
		"fitToContent": "An den Inhalt anpassen",
		"fit_to_all": "An gesamten Inhalt anpassen",
		"fit_to_canvas": "An die Zeichenfläche anpassen",
		"fit_to_layer_content": "An Inhalt der Ebene anpassen",
		"fit_to_sel": "An die Auswahl anpassen",
		"align_relative_to": "Relativ zu einem anderem Objekt ausrichten …",
		"relativeTo": "im Vergleich zu:",
		"page": "Seite",
		"largest_object": "größtes Objekt",
		"selected_objects": "gewählte Objekte",
		"smallest_object": "kleinstes Objekt",
		"new_doc": "Neues Bild",
		"open_doc": "Bild öffnen",
		"export_img": "Export",
		"save_doc": "Bild speichern",
		"import_doc": "Importiere SVG",
		"align_to_page": "Element an Seite ausrichten",
		"align_bottom": "Unten ausrichten",
		"align_center": "Zentriert ausrichten",
		"align_left": "Linksbündig ausrichten",
		"align_middle": "In der Mitte ausrichten",
		"align_right": "Rechtsbündig ausrichten",
		"align_top": "Oben ausrichten",
		"mode_select": "Objekte auswählen und verändern",
		"mode_fhpath": "Freihandlinien zeichnen",
		"mode_line": "Linien zeichnen",
		"mode_connect": "Verbinde zwei Objekte",
		"mode_rect": "Rechteck-Werkzeug",
		"mode_square": "Quadrat-Werkzeug",
		"mode_fhrect": "Freihand-Rechteck",
		"mode_ellipse": "Ellipse",
		"mode_circle": "Kreis",
		"mode_fhellipse": "Freihand-Ellipse",
		"mode_path": "Pfad zeichnen",
		"mode_shapelib": "Form-Bibliothek",
		"mode_text": "Text erstellen und bearbeiten",
		"mode_image": "Bild einfügen",
		"mode_zoom": "Zoomfaktor vergrößern oder verringern",
		"mode_eyedropper": "Eye Dropper Werkzeug",
		"no_embed": "Hinweis: Dieses Bild kann nicht eingebettet werden. Eine Anzeige hängt von diesem Pfad ab.",
		"undo": "Rückgängig",
		"redo": "Wiederherstellen",
		"tool_source": "Quellcode bearbeiten",
		"wireframe_mode": "Drahtmodell-Modus",
		"toggle_grid": "Zeige/Verstecke Gitternetz",
		"clone": "Element(e) klonen",
		"del": "Element(e) löschen",
		"group_elements": "Element(e) gruppieren",
		"make_link": "Link erstellen",
		"set_link_url": "Link setzen (leer lassen zum Entfernen)",
		"to_path": "Gewähltes Objekt in einen Pfad konvertieren",
		"reorient_path": "Neuausrichtung des Pfades",
		"ungroup": "Gruppierung aufheben",
		"docprops": "Dokument-Eigenschaften",
		"imagelib": "Bilder-Bibliothek",
		"move_bottom": "Die gewählten Objekte nach ganz unten verschieben",
		"move_top": "Die gewählten Objekte nach ganz oben verschieben",
		"node_clone": "Klone den Knoten",
		"node_delete": "Lösche den Knoten",
		"node_link": "Gekoppelte oder separate Kontrollpunkte für die Bearbeitung des Pfades",
		"add_subpath": "Teilpfad hinzufügen",
		"openclose_path": "Öffne/Verbinde Unterpfad",
		"source_save": "Änderungen akzeptieren",
		"cut": "Ausschneiden",
		"copy": "Kopieren",
		"paste": "Einfügen",
		"paste_in_place": "Bei Originalposition einfügen",
		"delete": "Löschen",
		"group": "Gruppieren",
		"move_front": "Nach ganz oben verschieben",
		"move_up": "Hochschieben",
		"move_down": "Herunterschieben",
		"move_back": "Nach ganz unten verschieben"
	},
	layers: {
		"layer": "Ebene",
		"layers": "Ebenen",
		"del": "Ebene löschen",
		"move_down": "Ebene nach unten verschieben",
		"new": "Neue Ebene",
		"rename": "Ebene umbenennen",
		"move_up": "Ebene nach oben verschieben",
		"dupe": "Ebene duplizieren",
		"merge_down": "Nach unten zusammenführen",
		"merge_all": "Alle zusammenführen",
		"move_elems_to": "Verschiebe ausgewählte Objekte:",
		"move_selected": "Verschiebe ausgewählte Objekte auf eine andere Ebene"
	},
	config: {
		"image_props": "Bildeigenschaften",
		"doc_title": "Titel",
		"doc_dims": "Dimension der Zeichenfläche",
		"included_images": "Eingefügte Bilder",
		"image_opt_embed": "Daten einbetten (lokale Dateien)",
		"image_opt_ref": "Benutze die Dateireferenz",
		"editor_prefs": "Editor-Einstellungen",
		"icon_size": "Symbol-Abmessungen",
		"language": "Sprache",
		"background": "Editor-Hintergrund",
		"editor_img_url": "Bild-URL",
		"editor_bg_note": "Anmerkung: Der Hintergrund wird mit dem Bild nicht gespeichert.",
		"icon_large": "Groß",
		"icon_medium": "Mittel",
		"icon_small": "Klein",
		"icon_xlarge": "Sehr Groß",
		"select_predefined": "Auswahl einer vordefinierten:",
		"units_and_rulers": "Einheiten und Lineale",
		"show_rulers": "Zeige Lineale",
		"base_unit": "Basiseinheit:",
		"grid": "Gitternetz",
		"snapping_onoff": "Einrasten an/aus",
		"snapping_stepsize": "Einrastabstand:",
		"grid_color": "Gitterfarbe"
	},
	shape_cats: {
		"basic": "Standard",
		"object": "Objekte",
		"symbol": "Symbole",
		"arrow": "Pfeile",
		"flowchart": "Flussdiagramme",
		"animal": "Tiere",
		"game": "Spielkarten und Schach",
		"dialog_balloon": "Sprechblasen",
		"electronics": "Elektronik",
		"math": "Mathematik",
		"music": "Musik",
		"misc": "Sonstige",
		"raphael_1": "raphaeljs.com set 1",
		"raphael_2": "raphaeljs.com set 2"
	},
	imagelib: {
		"select_lib": "Wähle eine Bild-Bibliothek aus",
		"show_list": "Zeige Bibliotheksliste",
		"import_single": "Einzelnes importieren",
		"import_multi": "Mehrere importieren",
		"open": "Als neues Dokument öffnen"
	},
	notification: {
		"invalidAttrValGiven": "Fehlerhafter Wert",
		"noContentToFitTo": "Kein Inhalt anzupassen",
		"dupeLayerName": "Eine Ebene hat bereits diesen Namen",
		"enterUniqueLayerName": "Verwenden Sie einen eindeutigen Namen für die Ebene",
		"enterNewLayerName": "Geben Sie bitte einen neuen Namen für die Ebene ein",
		"layerHasThatName": "Eine Ebene hat bereits diesen Namen",
		"QmoveElemsToLayer": "Verschiebe ausgewählte Objekte in die Ebene '%s'?",
		"QwantToClear": "Möchten Sie die Zeichnung löschen?\nDadurch wird auch die Rückgängig-Funktion zurückgesetzt!",
		"QwantToOpen": "Möchten Sie eine neue Datei öffnen?\nDadurch wird auch die Rückgängig-Funktion zurückgesetzt!",
		"QerrorsRevertToSource": "Es gibt Parser-Fehler in der SVG-Quelle.\nDie Original-SVG wiederherstellen?",
		"QignoreSourceChanges": "Sollen die Änderungen an der SVG-Quelle ignoriert werden?",
		"featNotSupported": "Diese Eigenschaft wird nicht unterstützt",
		"enterNewImgURL": "Geben Sie die URL für das neue Bild an",
		"defsFailOnSave": "Hinweis: Aufgrund eines Fehlers in Ihrem Browser kann dieses Bild falsch angezeigt werden (fehlende Gradienten oder Elemente). Es wird jedoch richtig angezeigt, sobald es gespeichert wird.",
		"loadingImage": "Bild wird geladen, bitte warten ...",
		"saveFromBrowser": "Wählen Sie \"Speichern unter ...\" in Ihrem Browser, um das Bild als Datei %s zu speichern.",
		"noteTheseIssues": "Beachten Sie außerdem die folgenden Probleme: ",
		"unsavedChanges": "Es sind nicht-gespeicherte Änderungen vorhanden.",
		"enterNewLinkURL": "Geben Sie die neue URL ein",
		"errorLoadingSVG": "Fehler: Kann SVG-Daten nicht laden",
		"URLloadFail": "Kann von dieser URL nicht laden",
		"retrieving": "Empfange \"%s\"..."
	},
	confirmSetStorage: {
		message: "Standardmäßig kann SVG-Edit Ihre Editor-Einstellungen " +
		"und die SVG-Inhalte lokal auf Ihrem Gerät abspeichern. So brauchen Sie " +
		"nicht jedes Mal die SVG neu laden. Falls Sie aus Datenschutzgründen " +
		"dies nicht wollen, " +
		"können Sie die Standardeinstellung im Folgenden ändern.",
		storagePrefsAndContent: "Editor-Einstellungen und SVG-Inhalt lokal speichern",
		storagePrefsOnly: "Nur Editor-Einstellungen lokal speichern",
		storagePrefs: "Editor-Einstellungen lokal speichern",
		storageNoPrefsOrContent: "Meine Editor-Einstellungen und die SVG-Inhalte nicht lokal speichern",
		storageNoPrefs: "Meine Editor-Einstellungen nicht lokal speichern",
		rememberLabel: "Auswahl merken?",
		rememberTooltip: "Wenn Sie die Einstellungen nicht speichern, wird sich die URL ändern, damit sie nicht noch einmal gefragt werden."
	}
});
