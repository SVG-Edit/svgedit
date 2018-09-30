function expectOutOfBoundsException (obj, fn, arg1) {
  const expected = true;
  const message = 'Caught an INDEX_SIZE_ERR exception';
  let result = false;
  try {
    obj[fn](arg1);
  } catch (e) {
    if (e.code === 1) {
      result = true;
    }
  }
  const actual = result;
  console.log('aaa', result, actual, expected);
  this.pushResult({result, actual, expected, message});
}
export default function extend (QUnit) {
  QUnit.extend(QUnit.assert, {
    expectOutOfBoundsException
  });
  return QUnit;
}
