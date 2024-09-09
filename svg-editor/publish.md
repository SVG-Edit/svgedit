## To publish this package
1. Make sure that @svgedit/packages is published if a new version is made (see publish.md in its corresponding folder)
2. modify package.json to update:
    - The new version of svgcanvas (if any)
    - The new version of svgedit
2. run 'npm install' to update the corresponding package-lock.json
3. update the CHANGES.md
4. run 'npm publish' (that will automate the build)
5. create a commit with above changes called 'release x.y.z'
