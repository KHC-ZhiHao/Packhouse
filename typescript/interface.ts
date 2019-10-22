export namespace Packhouse {
    interface ToolContext {
        store: object
        group: object
        utils: Utils
        include(name: string): Include
    }
    
    interface Utils {}
    
    interface Include {
        line(): void
        coop(): IncludeCoop
        tool(): ToolPreProcess
    }
    
    interface ToolHandler {
        store: object
        error(): void
        success(): void
        casting(): any
    }
    
    interface IncludeCoop {}
    
    interface ToolPreProcess {}
    
    interface Tool {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        handler(self: ToolHandler): void
    }
    
    interface Mold {
        (value: any): any
    }
    
    interface Line {
        request?: Array<string>
        response?: string
        install?(context: ToolContext): void
        input
        output
        layout
    }
    
    export interface Group {
        tools: { [key: string]: Tool }
        lines
        molds
        mergers
        install
    }
}

let b: Packhouse.Group = {
    tools: {
        a: {
            install({ store, include }) {
                store
            },
            handler(self) {

            }
        }
    },
    lines: {},
    molds: {},
    mergers: {},
    install() {}
}
