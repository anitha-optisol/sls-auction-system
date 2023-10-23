var crypto = require('crypto');
var hash = "md5";
var digest = "hex";


export async function passwordEncryption(password) {
  return crypto.createHash(hash).update(password).digest(digest);
}