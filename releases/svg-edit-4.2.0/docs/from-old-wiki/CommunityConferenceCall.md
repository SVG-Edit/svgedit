The recording is at: http://tiki.bigbluebutton.org/playback/slides/playback.html?meetingId=c986d4c28a45e0f8bab246354ebfe0422683e9de-1354632865808

Actual meeting lasted about 3.5 hours! The recording lasts 5 hours because some people arrived early and some stayed after the meeting. Just use the slider to skip ahead to 1h 06min 25sec. Over 30 people participated and the interest/energy level is high. The meeting lasted way longer than planned because there were so many people (a great problem to have!) You can see image of web conference here. Thank you to BigBlueButton for the awesome web conferencing solution!

Main conclusions & notes: * Introduction of participants * It is incredible to see the diverse ways people use SVG-edit. There were over a dozen presentations. * 2.6 release * Release is planned for January 15th, 2013 * trunk is in "risk freeze" until then (don't make major changes that can affect existing implementations) * Adding new optional features is OK until December 31st 2012 (January 1-15 should be bug fixes and translations only) * Ahmad will handle 2 of the remaining blockers in December * Release managers: Chance and Jordan (It's their first time so anyone familiar with release process: please help them) * Translators: we are counting on you to complete translations for all languages :-) * Wiki edit rights * Everyone will be given access. * We want more people to use it for planning and documentation. Long thoughtful posts on the mailing list should perhaps be more in the wiki with a link in the mailing list. * Commit access policy * We open as per the proposal at CommitPolicy with an additional caution to people that SVG-edit is widely used and changes can have unexpected consequences. Wait for after 2.6 release (and thus trunk re-opening) for any bigger changes. * Convergence of energy / modularization / themeing / etc. * Another conference call will be set up in February 2013 (after the release of 2.6) to discuss this in more detail. But in general everybody agreed some architectural changes are necessary and all participants want to contribute back. (the big question is "how?") * Some of the participants expressed an interest in sponsoring development (ex.: allocate some of their development resources) * Wikipedia * The MediaWiki extension was presented. Getting SVG-edit on Wikipedia is a top priority. Further discussions are to be held to determine clear roadmap: https://bugzilla.wikimedia.org/show_bug.cgi?id=38271#c16 * Browser support * This will need more discussion to have a clear policy * Release cycle * Active devs will reconvene for exact formula on this but it is agreed that it should never be more than one year. * Consulting ecosystem * This is essential in a healthy community. All consultants, please add yourself to Consulting * Translations * All translators will have commit access and they can use web interface or SVN. 2.6 will be released January 15th. If you can commit your translations in December, that would be awesome. * Roadmap: see point above on Convergence of energy / modularization / themeing

Apologies to Moritz Wissenbach (and anyone else affected) because he couldn't present his [Image Annotation project](https://faustedition.uni-wuerzburg.de/public/text-image-links.jpg). Although there is no limit to BigBlueButton for the number of people that can connect, the phone gateway we use is limited to 4 connections. So there are likely other people that got a busy signal. This number has since been increased to 8 so we should be OK for the next meeting.

The list of people varied but at one point, here were the names: * Reimar Bauer * Moritz Wissenbach * Michel Buffa * Harry Burt * Dan Nickchen * Ahmad Syazwan * Chuck Weissman (no mic) * Emmanuel Harguindey * Boris Goldowsky * Ludovic Dubost (XWiki) * Marc Laporte * Luigi Capra * Mark MacKay * NICHOLAS KYRIAKIDES * Harman Dandiwal * Mark Nickel * ctzurcanu * Senthil Kumar * edroid * luciash d' being * Caleb * robertplummer * Mark Medinger * Jo Segaert * Flint O'Brien * Chance Roth * Alexander Widera * Jordan Mendler * John Sebok
When

The meeting is confirmed for December 4th, 2012 16h00 UTC

Please check for [the time in your time zone](http://www.timeanddate.com/worldclock/fixedtime.html?iso=20121204T1600)
Where

    We will be using the Free and Open Source [BigBlueButton](http://bigbluebutton.org/) Web conferencing platform
    It will be possible to join
        With a regular phone with a call to a North American number
        Via the BigBlueButton web interface (in Flash) (please have a headset)
        With Skype (please have a headset)

The meeting room is at http://tiki.org/SVG-edit+2012-12+community+meeting and you can already try it out.
Topics
Introduction of participants

    Each person takes a minute or two to introduce themselves. This also serves to make sure sound is OK for all. Please have a headset.
        Where do you live?
        How do you use SVG-edit? (if this takes more than 30 seconds, please add as a presentation below)
        Where do you want to see the project in the future?

Demos/explanation of how SVG-edit is used/integrated

    Each project presents in 2-5 minutes an overview of how they use SVG-edit. Presenters: you'll be able to [share URLs in the chatroom, or you can upload PDFs to the presentation tool](http://www.bigbluebutton.org/overview/)
        [CWM Draw Tool](https://code.google.com/p/cwm-drawtool/) (Boris Goldowsky)
        [Awwation](http://awwation.com/) (Aditya Bhatt)
        [Method Draw](https://github.com/duopixel/Method-Draw) (Mark MacKay)
        [MediaWiki integration](https://www.mediawiki.org/wiki/Extension:SVGEdit) (Brion Vibber)
        [TranslateSvg](https://www.mediawiki.org/wiki/Extension:TranslateSvg) (Harry Burt)
        Various improvements by Michel Buffa (Touch, multiline)
        [ownCloud integration](http://sourceforge.net/projects/ocsvg/) (Florian Hülsmann)
        [A schematic editor (one-line diagrams for electric utilities)](https://groups.google.com/d/msg/svg-edit/8uYm9I4KheQ/kMLggZdytuoJ) (Flint O'Brien)
        [Drupal SVG](https://drupal.org/sandbox/josegaert/1511596) (Jo Segaert)
        [CloudCanvas](http://www.cloud-canvas.com/) (Chance Roth)
        Sapiens Mapping Project
        [The Veloz Group has been using SVG Edit for a lot of our companies](http://www.thevelozgroup.com/) ([Jordan Mendler](http://www.thevelozgroup.com/about/executive-team#Jordan-Mendler), [Yarong Guo](http://www.thevelozgroup.com/internships#engineering-internships), [Shangcheng Ying](http://www.thevelozgroup.com/internships#engineering-internships))
        [Tiki Screen capture](http://doc.tiki.org/Screencast), [Tiki Draw](https://doc.tiki.org/Draw) and [CartoGraf](http://profiles.tiki.org/CartoGraf) (Marc Laporte & Robert Plummer)
        [XWiki SVG Macro](http://extensions.xwiki.org/xwiki/bin/view/Extension/SVG+Macro) Ludovic Dubost
        [Image Annotation](https://faustedition.uni-wuerzburg.de/public/text-image-links.jpg) Moritz Wissenbach
        Reimar Bauer has added a [save extension](https://bitbucket.org/ReimarBauer/xstatic-svg-edit-moin/src/tip/xstatic/pkg/svgedit_moin/data/editor/extensions/ext-server_moinsave.js?at=default) for the [MoinMoin Wiki Software project](http://moinmo.in/MoinMoin2.0) and packaged it as [XStatic package](http://pypi.python.org/pypi/XStatic-svg-edit-moin) for PyPI

2.6 Release

    What is the code status in trunk?
        [The current list of issues tagged needed for 2.6](https://code.google.com/p/svg-edit/issues/list?can=2&q=NeededFor%3D2.6)
        Discuss blockers for a 2.6 release
        If we can't release quickly, perhaps just branch so trunk is open again for development?

Wiki edit rights

    How should we use the wiki?
    Used more for community planning discussion?
    Explicit way for people to gain edit access

Commit access policy

SVG-edit is awesome. And all the people who worked on it have done a superb contribution to the Free and Open Source ecosystem. The main contributors according to https://www.ohloh.net/p/svg-edit/contributors?query=&sort=commits are: Alexis, Jeff, Pavol and of course, thank you to Narendra for starting all this.

Now, time goes by, great people get busy with new projects and it's time for renewal within the SVG-edit community. There is a great bit of talent and energy on the mailing lists and the issue tracker. We hope to always count on Alexis, Jeff, Pavol and Narendra when there is a big problem, but we want the community to be sustainable and growing.

The commit activity has slowed in recent years: https://www.ohloh.net/p/svg-edit/commits/summary

Yet, there are patches in the issue tracker: https://code.google.com/p/svg-edit/issues/list?can=2&q=patch How can we increase the odds that 1- they become appropriate for and 2- they are committed to the main code base?

What should our commit access policy be?

Marc Laporte proposes to think about this: http://info.tiki.org/article188-Tiki-reaches-500-contributors-with-commit-access and to move progressively in this direction. It's a little scary at first but listen to the podcast on that link :-)

Also, as an example, Ben has a simple commit, how do we make it efficient? Ref: https://groups.google.com/d/topic/svg-edit/4Try3YB7pMo/discussion

See proposal at: CommitPolicy
Convergence of energy

There are many applications that are based on SVG-edit (CWM Draw Tool, Method Draw, Awwation, etc.) Super! Now, many of these enhancements are obviously suitable for upstream as the new default, and some are suitable as an option. * Let's discuss when this is a "good"/acceptable/best scenario to keep things separate vs when we feel this work should be part of SVG-edit. * Let's discuss a way to reduce the number of forks and make projects closer and have everyone work in the same code base (with branches, distros, alternate themes, or something!)
Wikipedia

We have: * https://www.mediawiki.org/wiki/Extension:SVGEdit * https://www.mediawiki.org/wiki/Extension:TranslateSvg * https://bugzilla.wikimedia.org/show_bug.cgi?id=38271 * https://code.google.com/p/svg-edit/issues/detail?id=1006

Being used for Wikipedia will be the biggest surge of usage for SVG-edit (Wikipedia being a top-10 site in the World)

What are the next steps to get there?
Browser support

More or less half the web uses rapid release browsers (Chrome & Firefox). What happens if we want to improve SVG-edit but need something that is not yet available in some of the browsers? (or very difficult to do)

What should our policy be?
Release cycle

We don't need to decide anything today but let's start the discussion. And we should eventually come up with some realistic and commonly understood guidelines. Some examples: * A release every 6 months like Ubuntu (October and April) * Release at any time (when energy and features are there), but never more than 12 month between releases.
Consulting ecosystem

There are people (ex.: on the mailing list) that are willing to sponsor SVG-edit work. How do we leverage this? * Consulting (add yourself!) * What else?
Translations

    [Translation overhaul discussion](https://groups.google.com/d/topic/svg-edit/suxArdPZcqI/discussion)
    Or we use Google Code web-based commits

Roadmap

Let's discuss as a project where we want to be in 3-5 years. What are the features / use cases we would cover if we had tons of contributors the project vs what is outside the scope of the project?

    SVG-edit is a https://en.wikipedia.org/wiki/Vector_graphics_editor. Will it become a https://en.wikipedia.org/wiki/Raster_graphics_editor as well? Ex.: [Pixastic Image Processing Library](https://code.google.com/p/svg-edit/issues/detail?id=893)
    [SVG-edit can draw on images. Will it one day draw on videos?](https://code.google.com/p/svg-edit/issues/detail?id=985)
    [How about realtime collaborative editing?](https://code.google.com/p/svg-edit/issues/detail?id=947)
    There are some non-linear presentation tools like use SVG-edit as a base. Should SVG-edit become a such editor? [Awwation: "The editor is built upon the core of SVG-edit, and uses the Sozi library for zooming animations"](https://github.com/adityab/Awwation#readme)
    How good will SVG-edit become for [Concept Maps, Mind Maps, Topic Maps, Flow Charts and Org Charts](http://www.mind-mapping.org/web-based-mindmappers/graphical.html)?
        For example, I want something like http://drichard.org/mindmaps/ Should I work to add this to SVG-edit?

Who

If you are interested to participate, please indicate your name, city or time zone and ideal dates/times/periods. We'll likely use an online service to pick the date

    Marc Laporte, Montréal (any time)
    Pavol Rusnak, Prague (any time)
    Chance Roth, San Diego (any time)
    Mark MacKay (any time)
    Ahmad Syazwan, Kuala Lumpur (?)
    Bdkzero, Italy
    Brion Vibber, San Francisco
    Jordan Mendler (http://www.thevelozgroup.com), Los Angeles
    Moritz Wissenbach, Germany
    You?

    Who else should we make sure is present?

You can confirm here as well: https://www.facebook.com/events/469279513113470/
Your thoughts

What do you think? Let us know what is on your mind :-)
