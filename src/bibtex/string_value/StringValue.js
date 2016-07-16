import specialCharsHandlers from './specialCharsHandlers'
import Immutable, {Set} from 'immutable'
/**
 * String wrapper that is meant to deal with the subtleties of BiBTeX / LaTeX styling.
 * Class is pretty incomplete, but we may want a higher-level class to do store formatting information or something.
 */
export default class StringValue {
  constructor(strRaw) {
    this._raw = strRaw;
    if (strRaw.type != 'quotedstringwrapper' && strRaw.type != 'bracedstringwrapper')
      throw new Error("Did not expect object to instantiate StringValue: " + JSON.stringify(strRaw));
    this._unicode = this._raw.map(o=> {
      if (typeof o == 'string') return o;
      else if (o.toUnicode) return o.toUnicode();
      else throw new Error("Unexpected object in _values: " + JSON.stringify(o));
    }).join('');
  }

  toUnicode() {
    if (this._raw.type == 'quotedstringwrapper' || strRaw.type == 'bracedstringwrapper') {
      return StringValue.computeUnicodeString(0, this._raw);
    } else throw new Error("Unexpected object in _raw: " + JSON.stringify(this._raw));
  }

  // Will turn to lowercase:
  // {\'{E}}cole
  // {\'E}cole
  //
  // Will not turn to lowercase:
  // {{\'E}}cole
  lowercase$() {

  }

  static purify$() {
//     There are thirteen LATEX commands that won’t follow the above rules: \OE, \ae, \AE,
//       \aa, \AA, \o, \O, \l, \L, \ss. Those commands correspond to ı, , œ, Œ, æ, Æ, å, Å, ø, Ø, ł, Ł,
//       ß, and purify$ transforms them (if they are in a special character, in i, j, oe, OE, ae, AE, aa,
//       AA, o, O, l, L, ss, respectively.
    const translateEscaped = {
      'i': 'ı',
      'j': 'ȷ',
      'oe': 'œ',
      'OE': 'Œ',
      'ae': 'æ',
      'AE': 'Æ',
      'aa': 'å',
      'AA': 'Å',
      'o': 'ø',
      'O': 'Ø',
      'ss': 'ß',
      'l': 'ł',
      'L': 'Ł'
    };
    const purifyEscapeExceptions = {
      'i': 'i',
      'j': 'j',
      'oe': 'oe',
      'OE': 'OE',
      'ae': 'ae',
      'AE': 'AE',
      'aa': 'aa',
      'AA': 'AA',
      'o': 'o',
      'O': 'O',
      'ss': 'ss',
      'l': 'l',
      'L': 'L'
    }
  }


  // TODO
  // The following ten characters have special meanings in (La)TeX:
  // & % $ # _ { } ~ ^ \
  // Outside \verb, the first seven of them can be typeset by prepending a backslash; for the other three, use the macros \textasciitilde, \textasciicircum, and \textbackslash.
  static computeUnicodeString(braceDepth, obj) {
    rawObjects.map(obj => {
    });
      /**
       * A special character is a
       * part of a field starting with a left brace being at brace depth 0 immediately followed with a backslash,
       * and ending with the corresponding right brace. For instance, in the above example, there is no special
       * character, since \LaTeX is at depth 2. It should be noticed that anything in a special character is
       * considered as being at brace depth 0, even if it is placed between another pair of braces.
       */
      if (braceDepth == 0 && obj.type == 'braced' && obj.data[0] == '\\') {
        // Found special character
        const escapeString = StringValue.joinSimpleString(obj.data);
        const specialCharFunction = specialChars[escapeString.charAt(1)];
        if (specialCharFunction) return specialCharFunction(escapeString.substring(2));
        else throw new Error("Unexpected escape string: " + escapeString);
      } else if (obj.type == 'braced') {
        const portions = [];
        const braced = strRaw.type == 'braced';
        const data = strRaw.data;
        if (braced
          && braceDepth == 0
          && data.length > 0
          && typeof data[0] == 'string'
          && data[0].charAt(0) == '\\'
        ) {
          console.log(braceDepth, "SPECIAL CHAR because of" + data[0].charAt(0) +
            ": " + data)
        }
        return new StringValue(obj.data.map(o => StringValue.toUnicode(braceDepth + 1, o)));
      }
      else if (obj.constructor == Array) return new StringValue(obj.map(o=>StringValue.toUnicode(braceDepth, o)));
      else {
        throw new Error("Could not handle string value " + JSON.stringify(obj));
      }
  }

  static joinSimpleString(data) {
    if (typeof data == 'string') return data;
    else if (data.constructor == Array) {
      const str = [];
      for (let i = 0; i < data.length; i++) {
        str.push(StringValue.joinSimpleString(data[i]));
      }
      return str.join('');
    }
    else if (typeof data.string == 'string') return data.string;
    else if (data.type == 'braced') return StringValue.joinSimpleString(data.data);
    else if (typeof data.data == 'string') return data.string;
    else throw new Error("Could not read escaped string value " + JSON.stringify(data));
  }


  static toStringValue(braceDepth, strRaw) {
    //console.log("COMPILING", strRaw);
    if (strRaw.type == 'braced' || strRaw.type == 'quoted' || strRaw.type == 'quotedstring') {

      //console.log("braced", bracesSquashed)
      for (let i = 0; i < data.length; i++) {
        const strObj = data[i];
        portions.push(StringValue.toStringValue(braceDepth + (braced ? 1 : 0), strObj));
      }
      return portions.join('');
      //return compileStrings()//Bibliography.compileStringDeclarations(Bibliography.dissolvesBraces(0, strRaw.data));
    }
    else if (typeof strRaw == 'object' && strRaw.type == 'number') return strRaw.string;
    else if (typeof strRaw == 'string' || strRaw.constructor === Number)  return new StringValue(strRaw + "");
    else if (typeof  strRaw == 'object' && strRaw.type && strRaw.type.match(ID_STRINGS)) return strRaw.string;

    else if (strRaw.constructor === Array) {
      return new StringValue(strRaw.map(
        strObj => StringValue.toStringValue(braceDepth, strObj)
      ));
    } else throw new Error("Could not handle " + JSON.stringify(strRaw));
  }

  static resolveStrings(keyvals) {
    const refs = {};
    for (let key in keyvals)
      if (keyvals.hasOwnProperty(key) && !refs[key])
        refs[key] = StringValue.resolveStringDeclarations(Set.of(), keyvals[key], refs, keyvals);
    return refs;
  }

  static resolveStringDeclarations(referenceStack, wrapper, compiledSoFar, rawStrings) {
    if (wrapper.type == 'quotedstringwrapper') {
      return new StringValue({
        type: wrapper.type,
        data: wrapper.data.map((strObj) => {
          if (typeof strObj == 'object' && strObj.stringref) {
            const refName = strObj.stringref;
            if (referenceStack.has(refName)) throw new Error("Cycle detected: " + refName);
            if (compiledSoFar[refName]) return compiledSoFar[refName];
            if (!rawStrings[refName]) throw new Error("Unresolved reference: " + JSON.stringify(strObj));
            //console.log("RESOLVE", refName);
            compiledSoFar[refName] = StringValue.resolveStringDeclarations(referenceStack.add(refName), rawStrings[refName], compiledSoFar, rawStrings);
            return compiledSoFar[refName];
          } else if (strObj._raw) return strObj;
          else return strObj;
        })
      });
    }
    else if (wrapper.type == 'bracedstringwrapper') return new StringValue(wrapper);
    else throw new Error("Unexpected object to resolve: " + JSON.stringify(wrapper));
  }
}


