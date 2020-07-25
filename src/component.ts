import Tool from './tool'

type ComponentCallback = (props: any) => {
    [key: string]: any
}

class Component {
    use() {

    }
}

export default (callback: ComponentCallback) => {
    return new Component(callback())
}