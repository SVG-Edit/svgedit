There are some unit tests here: https://svg-edit.googlecode.com/svn/trunk/test/

All the tests can be run at once from [this page](https://svg-edit.googlecode.com/svn/trunk/test/all_tests.html).
To do

    List all tests that need to be written
    In particular, it seems that the existing tests are lower level tests. That's good, but we probably also need higher level "acceptance testing" kinds of tests.
    It seems also we need to organize and document these tests a bit better, so that:
        people don't end up writing a test that already exists
        when people want to add a new test, they know where to add it
        people know that those tests exist, and have access to easy tutorials on how to write them.

Related: * For Wikipedia, we have a round-trip testing suite: https://github.com/brion/svg-edit-test
