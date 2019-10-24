declare namespace Packhouse {
    export interface ToolContext {
        store: {[key: string]: any}
        group: {[key: string]: any}
        utils: Utils
        include(name: string): Include
    }
    
    export interface Utils {
        getType(target: any): string
        verify(data: any, validate: { [key: string]: [boolean, Array<string>, any?] })
        generateId(): string
        arrayCopy(array: Array<any>): Array<any>
        peel(target: {[key: string]: any}, path: string, def: any): any
        [key: string]: any
    }

    export interface Include {
        line(name: string): void
        coop(name: string): IncludeCoop
        tool(name: string): ToolProcess
    }

    export interface IncludeCoop {
        line(name: string): void
        tool(name: string): ToolProcess
    }

    export interface ToolProcess {
        weld(name: string, handler: WeldPack): ToolProcess
        pack(...any: any): ToolProcess
        repack(...any: any): ToolProcess
        noGood(action: (error: any) => void, options?: {[key: string]: any}): ToolProcess
        always(action: (result: any) => void): ToolProcess
        action(...any: any): void
        promise(...any: any): Promise<any>
    }

    export interface WeldPack {
        (result: any, pack: (...any: any) => void): void
    }

    export interface Tool {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        handler(self: ToolHandler, ...any: any): void
    }

    export interface ToolHandler {
        use(name: string): any
        tool(name: string): ToolProcess
        line(name: string): (...any: any) => LineProcess & Response
        store: {[key: string]: any}
        error(data: any): void
        success(data?: any): void
        casting(moldName: string, target: any): any
    }

    export interface LineProcess {
        [prop: string]: (...any: any) => LineProcess & Response
    }

    export interface Response {
        action(...any: any): void
        promise(...any: any): Promise<any>
    }

    export interface ToolUseResponse {
        [prop: string]: ToolUseResponse
    }

    export interface Mold {
        (value: any, context: MoldContext): any
    }

    export interface MoldContext {
        utils: Utils
        message: any
        index: number
        extras: {[key: string]: any}
    }

    export interface Line {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        input(self: ToolHandler, ...any: any): void
        output(self: ToolHandler): void
        layout: { [key: string]: Tool }
    }

    export interface MergerGroup {
        (options: any): MergerGroupResponse
    }

    export interface MergerGroupResponse {
        data: Group
        options?: any
    }

    export interface Group {
        tools?: { [key: string]: Tool }
        lines?: { [key: string]: Line }
        molds?: { [key: string]: Mold }
        mergers?: { [key: string]: string }
        install?(group: {[key: string]: any}, options: any): void
    }

    export interface Merger {
        molds?: { [key: string]: Mold }
        groups?: { [key: string]: MergerGroup }
    }
}

export = Packhouse
