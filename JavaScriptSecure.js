const unirest = require("unirest");
const CryptoJS = require("crypto-js");
const phpjs = require("phpjs");
const Config = {
  APP_SECRET_KEY: "########################", //App Secret key
  APP_API_LINK: "https://api.autho.app/app/auth/##################", //App Api Link
};

const DecryptEndToEnd = (AppKey, Cipher) => {
  var encrypted = Cipher;
  var key = AppKey;
  encrypted = Buffer.from(encrypted, "base64");
  encrypted = JSON.parse(encrypted);
  const iv = CryptoJS.enc.Base64.parse(encrypted.iv);
  const value = encrypted.value;
  key = CryptoJS.enc.Base64.parse(key);
  var decrypted = CryptoJS.AES.decrypt(value, key, {
    iv: iv,
  });
  return JSON.parse(phpjs.unserialize(decrypted.toString(CryptoJS.enc.Utf8)));
};

const CheckAuth = (auth_method, auth_value = 1) => {
  return new Promise((resolve) => {
    unirest("POST", Config.APP_API_LINK)
      .field("auth_method", auth_method)
      .field("auth_value", auth_value)
      .end(function (res) {
        let access = false;
        if (res.error) {
          access = false;
          resolve(access);
        } else {
          let response = DecryptEndToEnd(
            Config.APP_SECRET_KEY,
            JSON.parse(res.raw_body)["auth"]
          );
          if (
            response["auth_access_status"] == true &&
            response["auth_expires_at"] > Math.floor(Date.now() / 1000)
          ) {
            access = true;
            resolve(access);
          }
        }
      });
  });
};
CheckAuth("ip")
  .then((res) => {
    if (res == true) {
      console.log("Access Granted");
    } else {
      console.log("Access Denied");
    }
  })
  .catch(() => {
    console.log("Something went wrong");
  });
