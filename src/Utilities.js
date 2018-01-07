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
	var dtf = (format && new Date().toLocaleFormat(format) || format) || defaultFormat && new Date().toLocaleFormat(defaultFormat) || "";
	// Capitalizes the words prefixed by + sign
	dtf = dtf.replace(/(\+\b\w)/gi, function(m) {
		return m.toUpperCase().replace("+", "");
	});
	return dtf;	
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
