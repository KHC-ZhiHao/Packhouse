class Profile {
    constructor(target, type) {
        this.name = target.name
        this.type = type
        this.sign = target.group.sign
        this.group = target.group.name
    }

    export() {
        return {
            name: this.name,
            type: this.type,
            sign: this.sign,
            group: this.group
        }
    }
}

module.exports = Profile
