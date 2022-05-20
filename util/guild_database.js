const guilds = new Map();

module.exports = {
	guilds,
	get
}

function get(id) {
	if (guilds.get(id) == undefined) {
		const guildConstruct = {
			queue: null,
		}
		guilds.set(id, guildConstruct)
	}
	return guilds.get(id)
}