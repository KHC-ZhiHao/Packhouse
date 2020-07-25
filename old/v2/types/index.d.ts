type Mode = 'READ' | undefined | null
type EventName = 'use' | 'done' | 'run' | String
type SystemMold = 'type' | 'boolean' | 'number' | 'int' | 'string' | 'array' | 'buffer' | 'object' | 'function' | 'date' | 'required' | String
type GetTypeResult = 'string' | 'undefined' | 'object' | 'boolean' | 'number' | 'bigint' | 'symbol' | 'function' | 'array' | 'empty' | 'NaN' | 'regexp' | 'promise' | 'buffer' | 'error'

export interface ToolContext {
    store: {[key: string]: any}
    group: {[key: string]: any}
    utils: Utils
    include(name: string): Include
    require(name: string): any
    packhouse: any
}

export interface VerifyOptions {
    [key: string]: [boolean, Array<GetTypeResult>, any?]
}

export interface Utils {
    getType(target: any): GetTypeResult
    verify(data: any, validate: VerifyOptions)
    generateId(): string
    arrayCopy(array: Array<any>): Array<any>
    peel(target: {[key: string]: any}, path: string, def: any): any
}

export interface Include {
    line(name: string, ...args: any): void
    tool(name: string, ...args: any): void
}

export interface Always {
    result: any,
    context: {
        id: string,
        caller: string
    },
    success: boolean
}

export interface ToolProcess {
    pack(...any: any): ToolProcess
    noGood(action: (error: any) => void, options?: {[key: string]: any}): ToolProcess
    always(action: (result: Always) => void): ToolProcess
    action(...any: any): void
    promise(...any: any): Promise<any>
}

export interface Tool {
    info?: string
    request?: Array<SystemMold>
    response?: SystemMold
    install?(context: ToolContext): void
    handler(self: ToolHandler, ...any: any): void
}

export interface ToolHandler {
    tool(name: string): ToolProcess
    line(name: string): (...any: any) => LineProcess & Response
    utils: Utils
    store: {[key: string]: any}
    error(data?: any): void
    success(data?: any): void
    assess(compile?: (result?: any) => any): (error?: any, result?: any) => void
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
    info?: string
    request?: Array<SystemMold>
    response?: SystemMold
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
    molds?: { [key: string]: Mold | VerifyOptions }
    mergers?: { [key: string]: string }
    install?(group: {[key: string]: any}, options: any, packhouse: Core): void
}

export interface Merger {
    molds?: { [key: string]: Mold }
    groups?: { [key: string]: MergerGroup }
}

export interface Event {
    id: string
    off(): void
}

export interface CoreBase {
    utils: Utils
    on(name: EventName, callback: (event: Event, ...any: any) => void): Event
    off(name: EventName, id: string): void
    plugin(plugin: any, options?: any): void
    merger(name: string, data: Merger, configs?: any)
    addMold(name: string, handler:Mold)
    addGroup(name: string, group: Group)
    hasMold(name: string): boolean
    hasGroup(name: string): boolean
    [key: string]: any
}

export interface Core extends CoreBase {
    tool(name: string): ToolProcess
    line(name: string): (...any: any) => LineProcess & Response
}

export interface Main {
    (callback: (packhouse?: Core, options?: any, mode?: Mode) => {
        plugins: Array<any>
        groups: {
            [key: string]: () => {
                data: Group,
                options?: any
            }
        }
        mergers: { 
            [key: string]: () => {
                data: Merger,
                options?: any
            }
        }
    }): (options?: any, mode?: Mode) => Core
}
