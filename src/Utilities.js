///
/// Common Utilities
///

const Gtk = imports.gi.Gtk;

///
/// Convert string to datetime format.
///
/// @param {string} format - Format to convert into a datetime string.
/// @param {string} defaultFormat - Format to use if 'format' is null or empty.
/// @return {string} Datetime representation of format, or format if the conversion fails, or datetime representation of defaultFormat, or blank.
///
function dateTimeFormat(format, defaultFormat) {
	function escapeUnicode(str) {
		return str.replace(/[^\0-~]/g, function(ch) {
			return "\\u" + ("0000" + ch.charCodeAt().toString(16)).slice(-4);
		});
	}

	return JSON.parse('"' + escapeUnicode((format && new Date().toLocaleFormat(escapeUnicode(format)) || format) || defaultFormat && new Date().toLocaleFormat(escapeUnicode(defaultFormat)) || "").replace('"',     '\\"') + '"');
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
