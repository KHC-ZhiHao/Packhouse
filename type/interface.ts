declare namespace Packhouse {
    interface ToolContext {
        store: object
        group: object
        utils: Utils
        include(name: string): Include
    }
    
    interface Utils {
        getType(target: any): string
        verify(data: any, validate: { [key: string]: [boolean, Array<string>, any?] })
        generateId(): string
        arrayCopy(array: Array<any>): Array<any>
        peel(target: object, path: string, def: any): any
    }

    interface Include {
        line(name: string): void
        coop(name: string): IncludeCoop
        tool(name: string): ToolPreProcess
    }

    interface IncludeCoop {
        line(name: string): void
        tool(name: string): ToolPreProcess
    }

    interface ToolPreProcess {
        weld(name: string, handler: WeldPack): ToolPreProcess
        pack(...any: any): ToolPreProcess
        repack(...any: any): ToolPreProcess
        noGood(action: () => void, options?: object): ToolPreProcess
        always(action: () => void): ToolPreProcess
    }

    interface WeldPack {
        (result: any, pack: (...any: any) => void): void
    }

    interface Tool {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        handler(self: ToolHandler, ...any: any): void
    }

    interface ToolHandler {
        store: object
        error(data: any): void
        success(data: any): void
        casting(moldName: string, target: any): any
    }

    interface Mold {
        (value: any, context: MoldContext): any
    }

    interface MoldContext {
        utils: Utils
        message: any
        index: number
        extras: object
    }

    interface Line {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        input(self: ToolHandler, ...any: any): void
        output(self: ToolHandler): void
        layout: { [key: string]: Tool }
    }

    interface MergerGroup {
        (options: any): MergerGroupResponse
    }

    interface MergerGroupResponse {
        data: Group
        options?: any
    }

    export interface Group {
        tools?: { [key: string]: Tool }
        lines?: { [key: string]: Line }
        molds?: { [key: string]: Mold }
        mergers?: { [key: string]: string }
        install?(group: object, options: any): void
    }

    export interface Merger {
        molds?: { [key: string]: Mold }
        groups?: { [key: string]: MergerGroup }
    }
}
