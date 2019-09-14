class LazyLoad {
    constructor(packhouse, options) {
        options = packhouse.utils.verify(options, {
            group: [true, ['function']],
            groupOptions: [false, ['object'], {}],
            merger: [true, ['function']],
            mergerOptions: [false, ['object'], {}]
        })
        packhouse.on('use', (event, { group }) => {
            let groupName = (group.sign ? `${group.sign}@` : '') + group.name
            if (packhouse.hasGroup(groupName)) {
                return null
            }
            if (group.sign) {
                packhouse.merger(group.sign, options.merger(group.sign), options.mergerOptions[group.sign])
            } else {
                packhouse.addGroup(group.name, options.group(group.name), options.groupOptions)
            }
        })
    }
}

module.exports = LazyLoad
