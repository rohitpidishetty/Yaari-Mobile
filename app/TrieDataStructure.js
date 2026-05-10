class Trie {
  buffer = new Array(27).fill(null);
  endOfWord = false;
}

export default class TDS {
  root = new Trie();
  wordToTrieVec(name) {
    var locations = [];
    for (var idx = 0; idx < name.length; idx++)
      locations.push(name.charAt(idx) == "_" ? 26 : (name.charCodeAt(idx) - 97));
    return locations;
  }
  fitTrie(vector) {
    var seed = this.root;
    for (var i in vector) {
      var target = vector[i];
      if (seed.buffer[target] == null) {
        seed.buffer[target] = new Trie();
        seed = seed.buffer[target];
      }
      else
        seed = seed.buffer[target];
    }
    seed.endOfWord = true;
    return this.root;
  }
  exploreNetwork(root, buffer, final) {
    if (root.endOfWord) {
      final.push([...buffer]);
      return;
    }
    for (var i = 0; i < 27; i++) {
      const seed = root.buffer[i];
      if (seed == null) continue;
      buffer.push(i);
      this.exploreNetwork(seed, buffer, final);
      buffer.pop();
    }
  }
  scanTrie(word) {
    if (word.length == 0) return [];
    var vec = this.wordToTrieVec(word);
    var seed = this.root;
    for (var i in vec) {
      if (seed.buffer[vec[i]] == null)
        return [];
      seed = seed.buffer[vec[i]];
    }
    var final = new Array();
    this.exploreNetwork(seed, new Array(), final);
    var strings_match = [];
    for (const row of final) {
      let str = "";
      for (const val of row) {
        const charCode = val + 97;
        str += (charCode >= 97 && charCode <= 122)
          ? String.fromCharCode(charCode)
          : "_";
      }
      strings_match.push(word + str);
    }
    return strings_match;
  }
}


// var obj = new TDS();
// obj.fitTrie(obj.wordToTrieVec("rohit_pidishetty"));
// obj.fitTrie(obj.wordToTrieVec("rohit_acharya"));
// obj.fitTrie(obj.wordToTrieVec("rohit_vishwakarma"));
// obj.fitTrie(obj.wordToTrieVec("ronit"));

// console.log(obj.scanTrie("r"))


