class FactoryExports {

    constructor(factory) {
        this.line = factory.line.bind(factory)
        this.tool = factory.tool.bind(factory)
        this.hasLine = factory.hasLine.bind(factory)
        this.hasTool = factory.hasTool.bind(factory)
        this.addGroup = factory.addGroup.bind(factory)
        this.hasGroup = factory.hasGroup.bind(factory)
        this.setBridge = factory.setBridge.bind(factory)
    }

}

class GroupExports {

    constructor(group) {
        this.alone = group.alone.bind(group)
        this.create = group.create.bind(group)
        this.hasTool = group.hasTool.bind(group)
        this.hasMold = group.hasMold.bind(group)
        this.hasLine = group.hasLine.bind(group)
        this.addMold = group.addMold.bind(group)
        this.addLine = group.addLine.bind(group)
        this.addTool = group.addTool.bind(group)
        this.addMolds = group.addMolds.bind(group)
        this.addTools = group.addTools.bind(group)
        this.callTool = group.callTool.bind(group)
        this.callLine = group.callLine.bind(group)
        this.isModule = group.isModule.bind(group)
        this.getProfile = group.getProfile.bind(group)
    }

}

class OrderExports {

    constructor(order) {
        this.has = order.has.bind(order)
        this.get = order.get.bind(order)
        this.list = order.list.bind(order)
        this.clear = order.clear.bind(order)
        this.create = order.create.bind(order)
        this.remove = order.remove.bind(order)
        this.getOrCreate = order.getOrCreate.bind(order)
    }

}