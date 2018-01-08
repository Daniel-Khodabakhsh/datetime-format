///
/// Common Utilities
///

const Gtk = imports.gi.Gtk;

///
/// Convert unicode characters in a string to escaped ascii.
///
/// @param {string} string - The string to be escaped.
/// @return {string} The string with all unicode characters replaced by escaped ascii.
function escapeUnicode(string) {
	return string.replace(/[^\0-~]/g, function(ch) {
		return "\\u" + ("0000" + ch.charCodeAt().toString(16)).slice(-4);
	});
}

///
/// Safe-esacpe characters in a string for parsing with JSON.parse, including unicode and special characters.
///
/// @param {string} string - The string to be escaped.
/// @return {string} The string with problematic characters escaped.
function escapeJson(string) {
	return escapeUnicode(string.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'));
}

///
/// Convert string to datetime format.
///
/// @param {string} format - Format to convert into a datetime string.
/// @param {string} defaultFormat - Format to use if 'format' is null or empty.
/// @return {string} Datetime representation of format, or format if the conversion fails, or datetime representation of defaultFormat, or blank.
///
function dateTimeFormat(format, defaultFormat) {
	return JSON.parse('"' + escapeUnicode(format && new Date().toLocaleFormat(escapeJson(format)) || defaultFormat && new Date().toLocaleFormat(escapeJson(defaultFormat)) || "") + '"');
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
