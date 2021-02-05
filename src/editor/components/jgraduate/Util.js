/**
 * @param {any} obj
 * @returns {any}
 */
export function findPos (obj) {
  let curleft = 0;
  let curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return {left: curleft, top: curtop};
  }
  return {left: curleft, top: curtop};
}