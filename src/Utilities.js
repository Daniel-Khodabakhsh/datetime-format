///
/// Common Utilities
///

const Gtk = imports.gi.Gtk;
let _localTimeZone = null;
///
/// Convert string to datetime format.
///
/// @param {string} format - Format to convert into a datetime string.
/// @param {string} defaultFormat - Format to use if 'format' is null or empty.
/// @return {string} Datetime representation of format, or format if the conversion fails, or datetime representation of defaultFormat, or blank.
///
function dateTimeFormat(format, defaultFormat) {
	return (format && new Date().toLocaleFormat(format) || format) || defaultFormat && new Date().toLocaleFormat(defaultFormat) || "";
}

///
/// Get the Gtk.Builder with the specified glade contents.
///
/// @param {string} gladeContent - Glade file contents.
/// @return {Gtk.Builder} Gtk.Builder for the glade contents.
///
function getBuilder(gladeContent) {
	return Gtk.Builder.new_from_string(gladeContent, gladeContent.length);
}
// Code from https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/environment.js
// Work around https://bugzilla.mozilla.org/show_bug.cgi?id=508783
Date.prototype.toLocaleFormat = function (format) {
	if (_localTimeZone === null)
		_localTimeZone = GLib.TimeZone.new_local();

	let dt = GLib.DateTime.new(_localTimeZone,
		this.getFullYear(),
		this.getMonth() + 1,
		this.getDate(),
		this.getHours(),
		this.getMinutes(),
		this.getSeconds());
	return dt?.format(format) ?? '';
};
