export default class Validate {
  isEmail(email) {
    return new RegExp("[a-z.]+[0-9]*[a-z.0-9]*@[a-z]+.com").test(email);
  }
  isName(name) {
    return new RegExp("^[a-zA-Z]+[.]?(\\s+[a-zA-Z]*[.]?)*$").test(name);
  }
  isUsername(username) {
    return /^([_]*[a-z]+[_]*[a-z0-9_]+)$/.test(username);
  }
  isPhone(phone) {
    return new RegExp("^[0-9]{10}$").test(phone);
  }
};
