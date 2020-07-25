type ToolContext = {
    fail: (error: Error) => void
    done: (result: any) => void
    include: <T>(target: T) => T
}

type ToolCallback = (context: ToolContext) => {
    request: string[],
    handler: (...params: any) => void
}

class Tool {
    on(eventname: string, callback: any) {
        return this
    }

    async action(callback) {
        
    }
}

export default function(callback: ToolCallback) {
    return null
}
