Roundtrip Tests

Primarily in an effort to make SVG-edit suitable for Wikipedia, there are some tests that determine how accurately SVG-edit reproduces an original svg document when it is loaded into SVG-edit and immediately saved back out.
Hosted tests

The tests automate SVG-edit to perform a series of load-save operations on svg documents randomly selected from the Wikimedia Commons, but SVG-edit's output is sent back to a server for analysis and permanent storage. Currently, the main test server is https://www.mbaynton.com/svg-edit/2.6/test/roundtrip-test-src/launcher.php'>https://www.mbaynton.com/svg-edit/2.6/test/roundtrip-test-src/launcher.php'>https://www.mbaynton.com/svg-edit/2.6/test/roundtrip-test-src/launcher.php. Anyone who wants to help out can donate some cycles and bandwidth to the tests just by visiting this URL. We test hundreds of svg's on many browsers and many SVG-edit code revisions, so there's probably tests to be run.

The Error Score is based on how many pixels differ between the rasterized version of the original SVG document and the rasterized version of the SVG document that ran through SVG-edit. The closer to 0 the better. In the present interface you can also see a highlighted view of which pixels differ in each test, and compare the C14N-canonicalized input xml with the C14N-canonicalized SVG-edit output in a side-by-side diff.

In revisions of SVG-edit as of this writing, one of the first tests (352) will pause at "uploading saved source..." for a very long time due to the wildly inaccurate dimensions of the image that SVG-edit reports back to the server. Be patient.
Identified Issues

This section lists some issues that the roundtrip tests have revealed

    Inline style attributes are not preserved
    Wildly inaccurate dimensions of saved document, as exemplified by test 352
    2013-10-03 Firefox on Windows eats up over 2 gigs of RAM and eventually crashes (reported by marclaporte)

Test code and dependencies

This section is only of interest if you wanted to set up a new roundtrip test environment on your own server.

I've checked in the code in a new branch at /svn/branches/roundtrip-diff-tests/2.6/test/roundtrip-test-src. Those with more ownership of the project can feel free to reorganize and/or merge it into trunk if you like.

To get this working on your server:

    Create a MySQL database and apply the svg-edit-test.sql file to it to create two empty tables. Configure permissions to this database as you desire; you'll need to give php credentials to read and write.
    Create a settings.php file in the same directory as test-runner.php, replacing the variable values for your environment:



    <?php

    $dbhost = "localhost";

    $dbuser = "www";

    $dbpass = "";

    $dbschema = "svg-edit-test"; // name of database you created



    $baseURL = "http://www.mbaynton.com/svg-edit-test/2.6/test/roundtrip-test-src";

    ?>

    Load a set of svg files ("tests") into your database from Wikimedia Commons via the Tests-generator.php command-line script. Verify everything is working by loading a single document with

    $ php Tests-generator.php

    If this is successful, you can load some n SVG documents with

    $ php Tests-generator.php n

    Once you're satisfied with the set of tests you've loaded, you probably shouldn't change them again. It will be easier to compare test runs that way.

A (probably incomplete) list of dependencies on the server:

    PHP cURL extension
    SVN Functions for PHP
    ImageMagick and its PHP extension
    (Optionally) a W3C markup validator. The validator is web based and so doesn't need to be local; the one it uses should be in settings.php but is currently hardcoded in helper-functions.php (function testSvgStrictValidity).

# Future Enhancements #

    Use http://www.mergely.com/ for textual diffs
    Allow tests to run from svg-edit hosted on arbitrary servers, so developers can evaluate changes before checking them in.
    Plenty more...

Related links
