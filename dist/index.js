!function(t,s){"object"==typeof exports&&"object"==typeof module?module.exports=s():"function"==typeof define&&define.amd?define([],s):"object"==typeof exports?exports.Packhouse=s():t.Packhouse=s()}(this||("undefined"!=typeof window?window:global),function(){return function(t){var s={};function e(o){if(s[o])return s[o].exports;var i=s[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,e),i.l=!0,i.exports}return e.m=t,e.c=s,e.d=function(t,s,o){e.o(t,s)||Object.defineProperty(t,s,{enumerable:!0,get:o})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,s){if(1&s&&(t=e(t)),8&s)return t;if(4&s&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(e.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&s&&"string"!=typeof t)for(var i in t)e.d(o,i,function(s){return t[s]}.bind(null,i));return o},e.n=function(t){var s=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(s,"a",s),s},e.o=function(t,s){return Object.prototype.hasOwnProperty.call(t,s)},e.p="/dist/",e(e.s=6)}([function(t,s,e){const o=e(1);t.exports=class{constructor(t){this._base={name:t||"no name"}}$systemError(t,s,e="no_error"){throw"no_error"!==e&&console.log("error data => ",e),new Error(`(☉д⊙)!! PackHouse::${this._base.name} => ${t} -> ${s}`)}$verify(t,s){let e={};for(let i in s){let r=t[i],n=s[i],h=n[0],a=n[1],l=n[2],c=o.getType(r);if("boolean"!==o.getType(h))throw new Error("Helper::verify => Required must be a boolean");if("array"!==o.getType(a))throw new Error("Helper::verify => Types must be a array");if(h&&null==r)throw new Error(`Helper::verify => Key(${i}) is required`);if(a&&null!=r&&!a.includes(c))throw new Error(`Helper::verify => Type(${i}::${c}) error, need ${a.join(" or ")}`);e[i]=r||l}return e}}},function(t,s){t.exports=class{static isAsyncFunction(t){return"[object AsyncFunction]"===Object.prototype.toString.call(t)}static getType(t){let s=typeof t;return Array.isArray(t)?"array":null==t?"empty":"number"===s&&isNaN(t)?"NaN":t instanceof RegExp?"regexp":s}static arrayCopy(t){for(var s=t.length,e=[];s--;)e[s]=t[s];return e}static createArgs(t,s){let e=new Array(t.length),o=s.package,i=o.length+t.length,r=s.package.length;for(let s=0;s<i;s++)e[s]=s>=r?t[s-r]:o[s];return e}static createId(){return Date.now()+Math.floor(1e6*Math.random())}}},function(t,s,e){const o=e(0);class i{}t.exports=class extends o{constructor(t={}){super("Mold"),this.case=new i,this.options=this.$verify(t,{check:[!1,["function"],function(){return!0}],casting:[!1,["function"],function(t){return t}]})}check(t,s){return this.options.check.call(this.case,t,s)}casting(t,s){return this.options.casting.call(this.case,t,s)}parse(t,s,e){let o=this.check(t,s),i=null;!0===o&&(o=null,i=this.casting(t,s)),e(o,i)}}},function(t,s,e){const o=e(0),i=e(1),r=e(12),n=e(4),h=e(5);class a{constructor(t){this._tool=t,this.$group=t.group.store}$coop(t){return this._tool.useCoop(t)}$tool(t){return this._tool.useTool(t)}$line(t){return this._tool.useLine(t)}$casting(t,s,e){return this._tool.casting(t,0,s,e)}}class l{constructor(t,s,e){this.store=t.store,this.context=e,this.error=e=>{this.context.finishTime=Date.now(),t.emit("error",{reslut:e,context:this.context}),s.error(e)},this.success=e=>{this.context.success=!0,this.context.finishTime=Date.now(),t.emit("success",{reslut:e,context:this.context}),s.success(e)}}}t.exports=class extends o{constructor(t,s={},e={}){super("Tool"),this.name=e.name||"no_name_tool",this.group=t,this.store=e.store||new a(this),this.profile=new r(this,"tool"),this.options=this.$verify(s,{molds:[!1,["array"],[]],action:[!0,["function"]],create:[!1,["function"],()=>{}]})}emit(t,s){this.group.emit(t,{type:"tool",from:this.name,...s})}install(){this.initMolds(),this.options.create(this.store),this.install=null}initMolds(){let t=this.options.molds.length;this.molds=new Array(t);for(let s=0;s<t;s++)if(this.options.molds[s]){let t=this.options.molds[s].split("|"),e=t.shift();this.molds[s]={name:e,extras:t}}else this.molds[s]=null}exports(t){let s=new n,e={action:this.createLambda("action",s,t),promise:this.createLambda("promise",s,t),recursive:this.createLambda("recursive",s,t)};return s.createExports(e)}createLambda(t,s,e){return(...o)=>{let r=this.createContext(t,s,e),n=s.copy(),h=this.getActionCallback(t,o),a=i.createArgs(o,n);return this[t](a,n,r,h)}}createContext(t,s,e){return{mode:t,args:s,caller:e,success:!1,startTime:Date.now(),finishTime:null}}getActionCallback(t,s){if("action"===t||"recursive"===t){let t=s.pop();return"function"!=typeof t&&this.$systemError("getActionCallback","Action or recursive must a callback."),t}return null}call(t,s,e){this.emit("action-tool-before",s);let o=new l(this,e,s),i=this.molds.length;for(let s=0;s<i;s++){let e=this.molds[s];null!=e&&this.parseMold(e.name,t[s],{index:s,extras:e.extras},(e,i)=>{e?o.error(e):t[s]=i})}e.isLive()&&this.options.action.apply(o,t)}action(t,s,e,o){let i=new h.Action(this.group,s,o);this.call(t,e,i)}recursive(t,s,e,o){let i=new h.Recursive(this,this.group,s,e,o);this.call(t,e,i)}promise(t,s,e){return new Promise((o,i)=>{let r=new h.Promise(this.group,s,o,i);this.call(t,e,r)})}parseMold(t,s,e,o){return this.group.getMold(t).parse(s,e,o)}casting(t,s,e,o){let i=t.split("|"),r=i.shift(),n=i;this.parseMold(r,e,{index:s,extras:n},o)}useTool(t){return this.group.callTool(t,this.profile.export())}useLine(t){return this.group.callLine(t,this.profile.export())}useCoop(t){return this.group.callCoop(t,this.profile.export())}use(t){return this.install&&this.install(),this.exports(t)}}},function(t,s,e){const o=e(0),i=e(1);class r{constructor(t,s){this._core=t,this.action=s.action,this.promise=s.promise,this.recursive=s.recursive}ng(t,s){return this._core.setNoGood(t,s),this}unNg(){return this._core.unNoGood(),this}sop(t){return this._core.setSop(t),this}unSop(){return this._core.unSop(),this}rule(t,s,e){return this._core.setRule(t,s,e),this}weld(t,s){return this._core.addWeld(t,s),this}unWeld(){return this._core.unWeld(),this}clear(){return this._core.clear(),this}pack(...t){return this._core.pack(t),this}rePack(...t){return this._core.rePack(t),this}unPack(){return this._core.unPack(),this}}t.exports=class extends o{constructor(){super("Support"),this.sop=null,this.welds=[],this.noGood=null,this.package=[]}createExports(t){return new r(this,t)}copy(){return{sop:this.sop,welds:i.arrayCopy(this.welds),noGood:this.noGood,package:i.arrayCopy(this.package)}}addWeld(t,s){this.welds.push({tool:t,pack:s})}unWeld(){this.welds=[]}setRule(t,s,e){t&&this.setNoGood(t,e),s&&this.setSop(s)}setNoGood(t,s={}){"function"==typeof t?this.noGood={action:t,options:this.$verify(s,{resolve:[!1,["boolean"],!1]})}:this.$systemError("setNG","NG param not a function.",t)}unNoGood(){this.noGood=null}setSop(t){"function"==typeof t?this.sop=t:this.$systemError("setSOP","SOP param not a function.",t)}unSop(){this.sop=null}pack(t){this.package=this.package.concat(t)}rePack(t){this.package=t}unPack(){this.package=[]}clear(){this.unNoGood(),this.unSop(),this.unWeld(),this.unPack()}}},function(t,s,e){const o=e(1);class i{constructor(t,s){this.sop=s.sop,this.over=!1,this.group=t,this.welds=null,this.exports={error:this.error.bind(this),success:this.success.bind(this)},s.welds.length>0&&(this.welds=o.arrayCopy(s.welds)),s.noGood&&(this.noGood=s.noGood.action,this.noGoodOptions=s.noGood.options)}isLive(){return!this.over}getError(t){return t||"unknown error"}error(t){!1===this.over&&(this.over=!0,this.errorBase(t),this.callSop({result:t,success:!1}))}success(t){!1===this.over&&(this.over=!0,this.runWeld(t,t=>{this.successBase(t),this.callSop({result:t,success:!0})}))}runWeld(t,s){if(null==this.welds)return s(t),null;let e=this.welds.shift(),o=null,i=s=>{this.noGood(s),this.callSop({result:t,success:!1})};e?(o=this.group.callTool(e.tool),e.pack(t,o.pack.bind(o)),o.ng(i,this.noGoodOptions).action(t=>{this.runWeld(t,s)})):s(t)}callSop(t){this.sop&&this.sop(t)}}class r extends i{constructor(t,s,e){super(t,s),this.callback=e||function(){}}errorBase(t){let s=this.getError(t);this.noGood?this.noGood(s):this.callback(s,null)}successBase(t){this.noGood?this.callback(t):this.callback(null,t)}}t.exports={Action:r,Promise:class extends i{constructor(t,s,e,o){super(t,s),this.reject=o,this.resolve=e}errorBase(t){let s=this.getError(t);this.noGood&&this.noGood(s),this.noGood&&this.noGoodOptions.resolve?this.resolve(s):this.reject(s)}successBase(t){this.resolve(t)}},Recursive:class extends r{constructor(t,s,e,i,r){super(s,e,r),this.stack=(...s)=>{s=o.createArgs(s,e),t.recursive(s,e,i,r)}}successBase(t){this.noGood?this.callback(t,this.stack):this.callback(null,t,this.stack)}}}},function(t,s,e){const o=e(7),i=e(8),r=e(9),n=e(10);t.exports=class{static createFactory(){return new n}static createPump(t,s){return new o(t,s)}static createStep(t){return new i(t)}static createOrder(t){return new r(t)}}},function(t,s,e){const o=e(0);class i extends o{constructor(t,s){super("Pump"),this.count=0,this.options=this.$verify({total:t,finish:s},{total:[!0,["number"]],finish:[!0,["function"]]})}press(){return this.count+=1,this.count>=this.options.total&&this.options.finish(),this.count}add(t){let s=typeof t;return null!=t&&"number"!==s&&this.$systemError("add","Count not a number.",number),"number"===s&&t<0&&this.$systemError("add","Count cannot be negative.",number),this.options.total+=t,this.options.total}each(t){"function"!=typeof t&&this.$systemError("each","Callback not a function",t);let s=this.press.bind(this);for(let e=this.count;e<this.options.total;e++)t(s,this.count)}}t.exports=class{constructor(t,s){this._core=new i(t,s)}add(t){return this._core.add(t)}each(t){return this._core.each(t)}press(){return this._core.press()}}},function(t,s,e){const o=e(0);class i extends o{constructor(t){super("Step"),this.timeout=null,this.templates=[],this.options=this.$verify(t,{mixin:[!1,["function"],t=>t],input:[!0,["function"]],middle:[!0,["function"]],output:[!0,["function"]]}),t.timeout&&(this.timeout=this.$verify(t.timeout,{ms:[!0,["number"]],output:[!0,["function"]]}))}addTemplate(t){"function"!=typeof t&&this.$systemError("addTemplate","Param not a function."),this.templates.push(t)}start(t,s,e){return new Promise((o,i)=>{new h(this,s,e,(s,e)=>{"run"===t&&(s?o(e):i(e)),"generator"===t&&o(e)})})}}class r{constructor(){this.list=[],this.index=0}exports(){return{templates:this.list,isDone:t=>this.isDone(t)}}isDone(t){return!!(this.list.find(s=>s.name===t)||{}).finishTime}punchOn({name:t}){this.list[this.index]={name:t,startTime:Date.now(),finishTime:null}}punchOut(){this.list[this.index].finishTime=Date.now(),this.index+=1}}class n{}class h extends o{constructor(t,s,{options:e,templates:o,outputBefore:i},h){super("Flow"),this.step=t,this.case=new n,this.over=!1,this.history=new r,this.callback=h,this.templates=t.options.mixin.call(this.case,o.slice(),e),this.outputBefore=i,this.initContext(),this.initTimeout(),this.start(s,e)}initContext(){this.flow={exit:this.exit.bind(this),fail:this.fail.bind(this)},this.context={...this.flow,lastCall:null,nextCall:null}}initTimeout(){if(null==this.step.timeout)return null;this.timeout=setTimeout(()=>{this.timeoutHandler()},this.step.timeout.ms)}timeoutHandler(){if(!1===this.over){let t=this.history.exports(),s={success:!1,message:"timeout",history:t},e=this.step.timeout.output.call(this.case,s);this.done(),this.callback(!1,this.getResponse(e,t))}}start(t,s){this.step.options.input.call(this.case,t,s,this.flow),this.iterator()}iterator(){if(!1===this.over){let t=this.templates.shift();if(null==t)return this.flow.exit();let s=()=>{if(this.over)return this.$systemError("iterator","Step is exit or fail.");s=()=>{this.$systemError("iterator","Next has already been declared.")},this.history.punchOut(),this.next()};this.history.punchOn({name:t.name}),this.context.nextCall=this.templates[0]?this.templates[0].name:null,this.context.lastCall=t.name||null,t.call(this.case,s,this.flow)}}next(){!1===this.over&&(this.step.options.middle.call(this.case,this.context),this.iterator())}exit(t){this.finish(!0,t)}fail(t){this.finish(!1,t)}done(){this.over=!0,this.timeout&&clearTimeout(this.timeout)}finish(t,s){let e=this.history.exports(),o={success:t,message:s,history:e};!1===this.over&&(this.done(),this.outputBefore.call(this.case,()=>{let s=this.step.options.output.call(this.case,o);this.callback(t,this.getResponse(s,e))},o))}getResponse(t,s){return{data:t,history:s}}}t.exports=class{constructor(t){this._core=new i(t)}export(){return this.generator.bind(this)}run(t={}){let s=t.args,e=this._core.$verify(t,{options:[!1,["object"],{}],templates:[!0,["array"]],outputBefore:[!1,["function"],t=>{t()}]});return this._core.start("run",s,e)}generator(t){let s=this._core.$verify(t,{debug:[!1,["boolean"],!1],options:[!1,["object"],{}],templates:[!0,["array"]],outputBefore:[!1,["function"],t=>{t()}]});return async(...t)=>(await this._core.start("generator",t,s)).data}}},function(t,s,e){const o=e(0);class i extends o{constructor(t={}){super("Order"),this.init(),this.options=this.$verify(t,{max:[!1,["number"],100]})}has(t){return"string"!=typeof t&&this.$systemError("has","Key not a string.",t),!!this.caches[t]}get(t){return!1===this.has(t)&&this.$system("get",`Key(${t}) not found.`),this.caches[t]}init(){this.keys=[],this.caches={},this.length=0}clear(){this.init()}create(t){return this.keys.push(t),this.length+=1,this.caches[t]=new n,this.length>this.options.max&&this.remove(this.keys[0]),this.get(t)}remove(t){this.has(t)?(this.length-=1,delete this.caches[this.keys.shift()]):this.$systemError("remove",`Key(${t}) not found.`)}getOrCreate(t){return this.has(t)?this.get(t):this.create(t)}}class r extends o{constructor(t){super("Cache"),this.init(),this.buffers=[],this.exports=t,this.finishCallback=()=>{}}init(){this.mode=null,this.over=!1,this.result=null}post(){for(;this.buffers.length>0;){this.buffers.pop()[this.mode](this.result)}}buffer(t,s){this.buffers.push({error:t,success:s}),this.over&&this.post()}finish(t){this.finishCallback=t}action(t){!1===this.over&&t(this.setError.bind(this),this.setSuccess.bind(this))}set(t,s){this.mode=t,this.over=!0,this.result=s,this.post(),this.finishCallback(this.exports)}setError(t){this.set("error",t)}setSuccess(t){this.set("success",t)}}class n{constructor(){this._core=new r(this)}buffer(t,s){return this._core.buffer(t,s),this}finish(t){return this._core.finish(t),this}action(t){return this._core.action(t),this}clear(){return this._core.init(),this}}t.exports=class{constructor(t){this._core=new i(t)}has(t){return this._core.has(t)}use(t,s,e,o){this._core.getOrCreate(t).buffer(s,e).finish(t=>t.clear()).action(o)}clear(){return this._core.clear()}remove(t){return this._core.remove(t)}getOrCreat(t){return this._core.getOrCreate(t)}}},function(t,s,e){const o=e(0),i=e(2),r=e(11),n=e(14),h=e(15);class a extends o{constructor(){super("Factory"),this.event=new n(this),this.event.addChannel("error"),this.event.addChannel("success"),this.event.addChannel("use-before"),this.event.addChannel("action-tool-before"),this.event.addChannel("action-line-before"),this.modules={},this.moldbox={},this.groupbox={};for(let t in h.defaultMolds)this.addMold(t,h.defaultMolds[t])}on(t,s){this.event.on(t,s)}emit(t,s){this.event.broadcast(t,s)}merger(t,s,e){this.modules[t]&&this.$systemError("join",`Name(${t}) already exists.`);let o=t+"@",i=this.$verify(s,{molds:[!1,["object"],{}],groups:[!1,["object"],{}]});for(let t in i.molds)this.addMold(o+t,i.molds[t]);for(let t in i.groups)this.addGroup(o+t,i.groups[t],e,o);this.modules[t]=!0}getGroup(t){return!1===this.hasGroup(t)&&this.$systemError("getGroup",`Group(${t}) not found.`),this.groupbox[t]}getMold(t){return!1===this.hasMold(t)&&this.$systemError("getMold",`Mold(${t}) not found.`),this.moldbox[t]}getCoop(t,s){return{tool:e=>this.callTool(t,e,s),line:e=>this.callLine(t,e,s)}}emitCall(t,s){this.emit("use-before",{type:t,...s})}callTool(t,s,e){return this.emitCall("tool",{groupName:t,toolName:s,context:e}),this.getGroup(t).callTool(s,e)}callLine(t,s,e){return this.emitCall("line",{groupName:t,toolName:s,context:e}),this.getGroup(t).callLine(s,e)}addGroup(t,s,e,o){null!=this.groupbox[t]&&this.$systemError("addGroup",`Name(${t}) already exists.`),this.groupbox[t]=new r(this,s,e,{name:t,namespace:o})}addMold(t,s){this.hasMold(t)&&this.$systemError("addMold",`Name(${t}) already exists.`),this.moldbox[t]=new i(s)}hasMold(t){return!!this.moldbox[t]}hasGroup(t){return!!this.groupbox[t]}}t.exports=class{constructor(){this._core=new a}on(t,s){this._core.on(t,s)}tool(t,s){return this._core.callTool(t,s)}line(t,s){return this._core.callLine(t,s)}merger(t,s,e){return this._core.merger(t,s,e)}addMold(t,s){return this._core.addMold(t,s)}addGroup(t,s,e){return this._core.addGroup(t,s,e)}hasMold(t){return this._core.hasMold(t)}hasGroup(t){return this._core.hasGroup(t)}}},function(t,s,e){const o=e(0),i=e(3),r=e(13),n=e(2);class h{}t.exports=class extends o{constructor(t,s={},e={},o={}){super("Group"),this.name=o.name.replace(o.namespace||"",""),this.sign=o.name.match("@")?o.name.split("@")[0]:"",this.namespace=o.namespace||"",this.store=new h,this.factory=t,this.toolbox={},this.linebox={},this.moldbox={},this.options=this.$verify(s,{tools:[!1,["object"],{}],lines:[!1,["object"],{}],molds:[!1,["object"],{}],install:[!1,["function"],()=>{}]}),this.init(),this.options.install(this.store,e)}emit(t,s){this.factory.emit(t,{groupName:this.name,groupSign:this.sign,caller:s})}init(){this.initTools(),this.initLines(),this.initMolds(),this.options.tools=null}initTools(){let t=this.options.tools;for(let s in t)this.addTool(s,t[s])}initLines(){let t=this.options.lines;for(let s in t)this.addLine(s,t[s])}initMolds(){let t=this.options.molds;for(let s in t)this.addMold(s,t[s])}getTool(t){return!1===this.hasTool(t)&&this.$systemError("getTool",`Tool(${t}) not found.`),this.toolbox[t]}getLine(t){return!1===this.hasLine(t)&&this.$systemError("getLine",`Line(${t}) not found.`),this.linebox[t]}getMold(t){return!1===this.hasMold(t)&&this.$systemError("getMold",`Mold(${t}) not found.`),this.moldbox[t]||this.factory.getMold(this.namespace+t)}callCoop(t,s){return this.factory.getCoop(this.namespace+t,s)}callTool(t,s){return this.getTool(t).use(s)}callLine(t,s){return this.getLine(t).use(s)}addTool(t,s){this.hasTool(t)&&this.$systemError("addTool",`Name(${t}) already exists.`),this.toolbox[t]=new i(this,s,{name:t})}addLine(t,s){this.hasLine(t)&&this.$systemError("addLine",`Name(${t}) already exists.`),this.linebox[t]=new r(this,s,{name:t})}addMold(t,s){this.hasMold(t)&&this.$systemError("addMold",`Name(${t}) already exists.`),this.moldbox[t]=new n(s)}hasTool(t){return!!this.toolbox[t]}hasLine(t){return!!this.linebox[t]}hasMold(t){return!(!this.moldbox[t]&&!this.factory.hasMold(this.namespace+t))}}},function(t,s){t.exports=class{constructor(t,s){this.name=t.name,this.type=s,this.sign=t.group.sign,this.group=t.group.name}export(){return{name:this.name,type:this.type,sign:this.sign,group:this.group}}}},function(t,s,e){const o=e(0),i=e(3),r=e(4),n=e(5);class h extends o{constructor(t,s){super("Deploy"),this.flow=[],this.main=t,this.params=s,this.layout=t.options.layout,this.supports=new r,this.init()}init(){this.input=this.createTool("input",{molds:this.main.options.molds,action:this.main.options.input}),this.output=this.createTool("output",this.main.options.output),this.initConveyer()}createTool(t,s){let e="function"==typeof s?{action:s}:s,o=new i(this.main.group,e,{name:"line-"+this.main.name+"-"+t,store:this.store});return null==this.store&&(this.store=o.store),o.use()}initConveyer(){this.conveyer={action:this.action.bind(this),promise:this.promise.bind(this),setRule:this.setRule.bind(this)};for(let t of this.main.layoutKeys)this.conveyer[t]=(...s)=>(this.register(t,s),this.conveyer)}register(t,s){this.flow.push({name:t,method:this.createTool(t,this.layout[t]),params:s})}action(t){let s=this.supports.copy(),e=new n.Action(this.main.group,s,t);this.process(e)}promise(){return new Promise((t,s)=>{let e=this.supports.copy(),o=new n.Promise(this.main.group,e,t,s);this.process(o)})}setRule(...t){return this.supports.setRule(...t),this.conveyer}process(t){this.main.emit("action-line-before"),new a(this,t)}}class a extends o{constructor(t,s){super("Process"),this.stop=!1,this.flow=t.flow,this.index=0,this.input=t.input,this.params=t.params,this.output=t.output,this.error=s.exports.error,this.success=s.exports.success,this.input.ng(t=>this.fail(t)).action(...this.params,this.next.bind(this))}finish(){this.output.ng(t=>this.fail(t)).action(this.success)}fail(t){!1===this.stop&&(this.stop=!0,this.error(t))}next(){if(!0===this.stop)return;let t=this.flow[this.index];t?t.method.ng(t=>this.fail(t)).action(...t.params,()=>{this.index+=1,this.next()}):this.finish()}}t.exports=class extends o{constructor(t,s,e={}){super("Line"),this.name=e.name||"no_name_line",this.tools={},this.group=t,this.options=this.$verify(s,{molds:[!1,["array"],[]],input:[!0,["function"]],output:[!0,["function"]],layout:[!0,["object"]]}),this.layoutKeys=Object.keys(this.options.layout),this.checkPrivateKey()}checkPrivateKey(){let t=this.options.layout;(t.action||t.promise||t.rule)&&this.$systemError("init","Layout has private key is action, promise, rule")}emit(t,s){this.group.emit(t,{type:"line",from:this.name,...s})}use(){return(...t)=>new h(this,t).conveyer}}},function(t,s,e){const o=e(0);t.exports=class extends o{constructor(t){super("Event"),this.factory=t,this.channels={}}addChannel(t){this.channels[t]=[]}on(t,s){null==this.channels[t]&&this.$systemError("on",`Channel(${t}) not found.`),"function"!=typeof s&&this.$systemError("on","Callback must be a function",s),this.channels[t].push(s)}broadcast(t,s){null==this.channels[t]&&this.$systemError("on",`Channel(${t}) not found.`);for(let e of this.channels[t])e.call(this.factory,{name:t,...s})}}},function(t,s){t.exports={defaultMolds:{boolean:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("boolean"==typeof t||`Param ${s.index} not a boolean(${t}).`)},number:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("number"==typeof t||`Param ${s.index} not a number(${t}).`)},int:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("number"==typeof t||`Param ${s.index} not a number(${t}).`),casting:t=>Math.floor(t)},string:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("string"==typeof t||`Param ${s.index} not a string(${t}).`)},array:{check:(t,s)=>null==t&&"abe"===s.extras[0]||(!!Array.isArray(t)||`Param ${s.index} not a array(${t}).`)},object:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("object"==typeof t||`Param ${s.index} not a object(${t}).`)},function:{check:(t,s)=>null==t&&"abe"===s.extras[0]||("function"==typeof t||`Param ${s.index} not a function(${t}).`)},required:{check:(t,s)=>null!=t||`Param ${s.index} required.`}}}}])});