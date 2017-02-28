///
/// Build script for the 'datetime-format' gnome extension.
///

const ChildProcess = require("child_process");
const FileSystem = require("fs");
const Path = require("path");
const extensionSettings = require("./extension.json");

const sourceDirectory = "src";
const buildDirectory = "build";
const templateDirectory = "templates";
const formatTargetsDirectory = "formatTargets";
const uuid = extensionSettings.extension + "@" + extensionSettings.domain;
const settingsSchema = `org.gnome.shell.extensions.${extensionSettings.extension}`;

let systemFlag = false;
let installFlag = true;

///
/// Parse a template string and replace values with those specified in map.
///
/// @param {string} template - Template string to parse.
/// @param {Object} map - Map object containing a variable:value map to replace the variables in the template string.
/// @param {string} [fallback] - Value to replace variables not found in the map.
/// @return {string} Template string with the values replaced with those in the map.
///
function parseTemplate(template, map, fallback) {
	return template.replace(/\$\{[^}]+\}/g, (match) => 
		match
			.slice(2, -1)
			.trim()
			.split(".")
			.reduce(
				(searchObject, key) => searchObject[key] || fallback || match,
				map
			)
	);
}

///
/// Get list of all files in the specified directory.
///
/// @param {string} directory - Name of the directory to list file names.
/// @return {string[]} List of files prefixed with the directory path.
///
function getFiles(directory) {
	directory = Path.normalize(directory);
	let files = FileSystem.readdirSync(directory).map((file) => directory + Path.sep + file);

	files.forEach((file, index) => {
		if (FileSystem.statSync(file).isDirectory()) {
			Array.prototype.splice.apply(files, [index, 1].concat(getFiles(file)));
		}
	});

	return files;
}

///
/// Capitalise a string.
///
/// @param {string} string - String to capitalise.
/// @return {string} Capitalised string.
///
function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Parse through all arguments.
process.argv.forEach((argument) => {
	switch (argument.toLowerCase()) {
		case "global":
		case "system":
			systemFlag = true;
			break;

		case "remove":
		case "uninstall":
		case "delete":
			installFlag = false;
			break;
	}
});

// Get extension path.
const installationDirectory = (systemFlag ? "/usr/" : "~/.") + "local/share/gnome-shell/extensions/" + uuid;

console.log(`Removing '${installationDirectory}' if it exists.`);
ChildProcess.execSync(`rm -rf ${installationDirectory}`);

// Install.
if (installFlag) {
	console.log(`Scanning '${formatTargetsDirectory}' for format targets.`);
	const formatTargets = FileSystem.readdirSync(sourceDirectory + Path.sep + formatTargetsDirectory)
		.filter((file) => file.slice(-3) == ".js")
		.map((file) => file.slice(0, -3));
	console.log(`Found the following format targets: ${formatTargets.join(", ")}`);
	// TODO: Validate formatTarget file names. Enforce names with alphanumeric and dash '-' characters only because of gsettings.

	// Add properties to extensionSettings which will be used to generate files via templates.
	console.log("Populating additional build properties.");
	Object.assign(extensionSettings, {
		uuid: uuid,
		gnomeShellVersions: JSON.stringify(extensionSettings.gnomeShellVersions),
		name: extensionSettings.extension.split("-").map(capitalise).join(" "),
		settingsSchema: settingsSchema,
		settingsSchemaPath: "/" + settingsSchema.split(".").join("/") + "/",
		formatTargets: JSON.stringify(formatTargets),
		settingKeys: formatTargets
			.map((formatTarget) => formatTarget.toLowerCase())
			.map((formatTarget) => `
				<key name="${formatTarget}-format" type="s">
					<default>""</default>
					<summary>Format for '${formatTarget}'</summary>
				</key>
				<key name="${formatTarget}-toggle" type="b">
					<default>true</default>
					<summary>Toggle for '${formatTarget}'</summary>
				</key>
			`)
			.join("")
	});

	console.log(`Cleaning and populating '${buildDirectory}' directory from '${sourceDirectory}'.`);
	ChildProcess.execSync(`rm -rf ${buildDirectory}`);
	ChildProcess.execSync(`mkdir ${buildDirectory}`);
	ChildProcess.execSync(`cp -r src/* ${buildDirectory}`);

	console.log(`Generating files from templates into '${buildDirectory}' directory.`);
	getFiles(templateDirectory).forEach((file) => {
		FileSystem.writeFileSync(
			buildDirectory + Path.sep + file.split(Path.sep).slice(1).join(Path.sep),
			parseTemplate(FileSystem.readFileSync(file, {encoding: "utf8"}), extensionSettings)
		);
	});

	console.log("Compiling settings schema.");
	ChildProcess.execSync(`glib-compile-schemas ${buildDirectory}`);
	// TODO: Should we delete schema XML after this step?

	console.log(`Installing extension to '${installationDirectory}'.`);
	ChildProcess.execSync(`mkdir -p ${installationDirectory}`);
	ChildProcess.execSync(`cp -r ${buildDirectory}/* ${installationDirectory}`);
}

// TODO: May want to restart gnome-shell? (gnome-shell --replace)
console.log("To complete installation, restart gnome-shell by pressing Alt+F2, typing 'r', and pressing 'Enter'.");

console.log("Done!");