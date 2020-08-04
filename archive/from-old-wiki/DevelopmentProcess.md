If you use SVG-edit, add to your Ohloh.net stacks: <wiki:gadget url="http://www.ohloh.net/p/325148/widgets/project_users.xml" height="100" border="0"/>
The Development Phases of a Release

NOTE: The duration of each of the phases below has not been defined at this time.
Pre-Alpha

During this phase, the trunk is completely open to contributions: new features, bug fixes, radical architectural changes. In this phase, the scope of the release will be locked down (features will be decided upon, new features will be voted and accepted for release targeting).

The trunk spends most of its lifetime in Pre-Alpha mode.
Alpha

During this phase, the majority of the features have been implemented on the trunk. Some minor features may still not be implemented yet. Portions of major features may be in a rough state during the Alpha phase.

No new features will be considered for the release, the scope is locked down.
Beta

During this phase, all feature work has been complete. The release has now gone into bug fix mode. Only fixes deemed critical to the release will be considered for check-in to the trunk.
Release

During this phase, the trunk will be branched to svn/branches/X.X (where X.X is the release number) and the following steps need to be performed:

    Update the HTML to reference the aggregated minified JS file, svgedit.compiled.js (switch HTML comments)
    Update the HTML to point to the Google CDN version of jQuery (switch HTML comments)
    Change the version stored at the top of the Makefile
    Run the Makefile, which does the following automatically
        JS files will be minified on the branch
        all files will be packaged up as a downloadable zip file
        the Firefox extension will be packaged into an xpi file
        the Opera widget will be packaged into a wgt file
            [Opera Widgets are being phased out](http://my.opera.com/addons/blog/2012/04/24/sunsetting-unite-and-widgets)
    Commit the now built minified JS file, svgedit.compiled.js
    Project owner: ~~upload the zip, xpi and wgt files to the Google Code download section~~ (Commit the packaged files and/or add to Google Drive since new project downloads [now disabled](http://google-opensource.blogspot.hk/2013/05/a-change-to-google-code-download-service.html)?)
    update the stable branch to refer to the new release branch via: $ svn delete -m "Removing old stable branch" https://svg-edit.googlecode.com/svn/branches/stable $ svn copy https://svg-edit.googlecode.com/svn/branches/2.3 https://svg-edit.googlecode.com/svn/branches/stable -m "Pointing stable branch to 2.3 branch"
    A project owner should move the old version information from [Project home](https://code.google.com/p/svg-edit/) page to the VersionHistory page and move any information on the new release from the Roadmap to the [Project home](https://code.google.com/p/svg-edit/).
    Update the Roadmap to refer to the next planned release (and keep updated with any new features added to trunk).

At this point, the trunk is now opened up again and enters Pre-Alpha phase for the next release.

If bugs are encountered with a released version, those fixes must be merged to both the release branch and the trunk (as well as to the "stable" branch if the bug is for the stable version).
Creating a Branch

For big experimental features, you may want to branch the repository to separate your work from the trunk. A branch in SVN is just a copy:

svn copy https://svg-edit.googlecode.com/svn/trunk/ https://svg-edit.googlecode.com/svn/branches/rotate-selector -m "Making a branch for..."

This will create the branch on the server. Then you can check it out as a working copy:

svn co https://svg-edit.googlecode.com/svn/branches/rotate-selector/ svg-edit-rotater

Then hack away in the 'svg-edit-rotater' folder and freely check in your changes (these will only be updating the rotate-selector branch in the repository. You can share your changes, have them reviewed, etc.

Once your happy with the branch, you can merge it in.
Rolling Back a Bad Commit

Let's say you accidentally committed your change when you didn't mean to as [revision 2075](https://code.google.com/p/svg-edit/source/detail?r=2075).

svn merge -r2075:2074 . svn ci -m "Rollback bad revision 2075"

    TODO: instructions on automatically merging back to trunk
    TODO: instructions for keeping up to date in the branch (i.e. merging from trunk to branch)
