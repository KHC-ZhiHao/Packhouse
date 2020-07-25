
/**
 * @class ModuleMergersBase
 * @desc ModuleMergers的Prototype
 */

class ModuleMergersBase extends ModuleBase {

    constructor() {
        super('PublicMergers')
        this.mergers = {}
        this.created = {}
    }

    /**
     * @function add
     * @desc 加入一個module group
     */

    register(name, action) {
        if (this.mergers[name]) {
            this.$systemError('add', `Public merger name(${name}) already exists.`)
        }
        if (typeof action !== 'function') {
            this.$systemError('add', `Public merger action not a function.`)
        }
        this.mergers[name] = action
    }

    /**
     * @function get
     * @desc 獲取一個module group
     */

    get(name) {
        if (this.mergers[name] == null) {
            return this.$systemError('get', `Public merger ${name} not found.`)
        }
        if (this.created[name] == null) {
            this.created[name] = this.$verify(this.mergers[name](), {
                group: [true, ['object']],
                options: [false, ['object'], {}]
            })
            let merger = this.created[name]
            if (Group.isGroup(merger.group) === false) {
                return this.$systemError('get', `The '${name}' not a group.`)
            }
            if (merger.group.isModule() === false) {
                return this.$systemError('get', `The group(${name}) not module mode.`)
            }
            merger.options.__module_group__ = true
            merger.group.create(merger.options)
        }
        return this.created[name].group
    }

}

let ModuleMergers = new ModuleMergersBase()
