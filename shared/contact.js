/* WHO TO CONTACT.
 *
 * Edit these lines and every page updates: the "Talk to someone" box, the
 * floating button, and every prefilled WhatsApp message.
 *
 *   phone     - the number the Call button dials (keep the + and country code)
 *   whatsapp  - the number for WhatsApp, digits only, with country code
 *   telegram  - the number for Telegram, digits only (no +)
 *   name      - how you want to be shown. Leave "" to show the number only.
 */
var CONTACT = {
  name: "",
  phone: "+256754687597",
  whatsapp: "256754687597",
  telegram: "256754687597"
};

/* Build the links. These never call home - they just open your phone's apps. */
CONTACT.telLink = function () {
  return "tel:" + CONTACT.phone;
};
CONTACT.waLink = function (message) {
  return "https://wa.me/" + CONTACT.whatsapp + (message ? "?text=" + encodeURIComponent(message) : "");
};
CONTACT.tgLink = function () {
  return "https://t.me/+" + CONTACT.telegram;
};
CONTACT.shareLink = function (message) {
  return "https://wa.me/?text=" + encodeURIComponent(message);
};
CONTACT.showName = function () {
  return CONTACT.name || CONTACT.phone;
};
