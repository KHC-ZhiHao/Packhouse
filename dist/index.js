!function(t,e){"undefined"!=typeof module&&"object"==typeof exports?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Packhouse=e()}(this||("undefined"!=typeof window?window:global),function(){class t{static getArgsLength(t){for(var e=t.toString(),s=0,i=0,r=0,o=!1,n=!1,a=0;a<e.length;a++)if(!["(","[","{"].includes(e[a])||o||n){if(![")","]","}"].includes(e[a])||o||n)"'"!==e[a]||n||"\\"===e[a-1]?'"'!==e[a]||o||"\\"===e[a-1]?","!==e[a]||1!==i||o||n||s++:n=!n:o=!o;else if(--i<1)break}else i++,r=a;return 0===s&&0===e.substring(r+1,a).trim().length?0:s+1}static isAsyncFunction(t){return"[object AsyncFunction]"===Object.prototype.toString.call(t)}}class e{}class s{constructor(t){this.$moduleBase={name:t||"no name"}}$systemError(t,e,s="$_no_error"){throw"$_no_error"!==s&&console.log("error data => ",s),new Error(`(☉д⊙)!! PackHouse::${this.$moduleBase.name} => ${t} -> ${e}`)}$noKey(t,e,s){return null==e[s]||(this.$systemError(t,`Name(${s}) already exists.`),!1)}$verify(t,e,s={}){let i={};for(let s in e){let r=e[s],o=r[0],n=r[1],a=r[2];o&&null==t[s]&&this.$systemError("verify",`Key(${s}) is required`),n&&null!=t[s]&&!n.includes(typeof t[s])&&this.$systemError("verify",`Type(${s}::${typeof t[s]}) error, need ${n.join(" or ")}`),i[s]=t[s]||a}return Object.assign(i,s)}$protection(t){return new Proxy(t,{set:(t,e)=>this.$systemError("$protection",`Key(${e}) is protection`,t)})}}class i extends s{constructor(t={}){super("Factory"),this.groups={},this.bridge=null,t.bridge&&this.setBridge(t.bridge)}static registerModuleMerger(t,e){b.register(t,e)}static createPublicMold(t){let e=new y(t);if($[e.name])throw new Error(`(☉д⊙)!! PackHouse::createPublicMold -> Public mold name(${e.name}) already exists.`);$[e.name]=e}static createOrder(t){let e=new r(t);return new k(e)}static createGroup(t){let e=new x(t);return new L(e)}static createFactory(t){let e=new i(t);return new w(e)}static isFactory(t){return t instanceof i||t instanceof w}static isGroup(t){return x.isGroup(t)}static asyncLoop(t,e,s){if(!1===Array.isArray(t))return void s("AsyncLoop : Targrt not be array.");if("function"!=typeof e||"function"!=typeof s)return void s("AsyncLoop : Action or callback not a function.");let i=t.length,r=0,o=()=>{(r+=1)===i&&s()},n=async(t,s)=>{e(t,s,o)};for(let e=0;e<i;e++)n(t[e],e);0===i&&s()}static createPump(t,e){return new d(t,e).exports}getGroup(t){if(this.hasGroup(t))return this.groups[t];this.$systemError("getGroup",`Group(${t}) not found.`)}getTool(t,e){return this.getGroup(t).callTool(e)}getLine(t,e){return this.getGroup(t).callLine(e)}addGroup(t,e,s){return null!=this.groups[t]?this.$systemError("addGroup",`Name(${t}) already exists.`):!1===x.isGroup(e)?this.$systemError("addGroup","Must group.",e):e.isModule()?this.$systemError("addGroup","Group id module, only use alone or in the merger.",e):(e.create(s),void(this.groups[t]=e))}removeGroup(t){this.groups[t]?this.groups[t]=null:this.$systemError("removeGroup",`Group(${t}) not found.`)}hasGroup(t){return!!this.groups[t]}hasTool(t,e){return!!this.getGroup(t).hasTool(e)}hasLine(t,e){return!!this.getGroup(t).hasLine(e)}tool(t,e){return this.callBridge(t,e),this.getTool(t,e)}line(t,e){return this.callBridge(t,e),this.getLine(t,e)}callBridge(t,e){this.bridge&&this.bridge(this,t,e)}setBridge(t){"function"==typeof t?this.bridge=t:this.$systemError("setBridge","Bridge not a function.",t)}}class r extends s{constructor(t={}){super("Order"),this.init(),this.options=this.$verify(t,{max:[!1,["number"],1e3]})}init(){this.keys=[],this.caches={},this.length=0}has(t){if("string"==typeof t)return!!this.caches[t];this.$systemError("has","Key not a string.",t)}get(t){if(this.has(t))return this.caches[t].exports;this.$system("get",`Key(${t}) not found.`)}list(){let t={};for(let e of this.caches)t[e]=this.caches[e].result;return t}clear(){this.init()}create(t){return this.length+=1,this.keys.push(t),this.caches[t]=new o,this.length>this.options.max&&this.remove(this.keys[0]),this.get(t)}remove(t){this.has(t)?(this.length-=1,delete this.caches[this.keys.shift()]):this.$systemError("remove",`Key(${t}) not found.`)}getOrCreate(t){return this.has(t)?this.get(t):this.create(t)}}class o extends s{constructor(){super("OrderCache"),this.mode=null,this.ready=!1,this.loaded=!1,this.onloadBuffers=[],this.result=null,this.buffers=[],this.exports={post:this.post.bind(this),buffer:this.buffer.bind(this),onload:this.onload.bind(this),isReady:this.isReady.bind(this),onReady:this.onReady.bind(this)}}post(){for(;this.buffers.length>0;){let t=this.buffers.pop();"success"===this.mode?t.success(this.result):t.error(this.result)}}buffer(t,e){return this.buffers.push({error:t,success:e}),this.exports}isReady(){return!!this.ready}onReady(t){!1===this.isReady()&&(this.ready=!0,t(this.setError.bind(this),this.setSuccess.bind(this)))}onload(t){return this.loaded?t(this.exports):this.onloadBuffers.push(t),this.exports}postOnload(){for(;this.onloadBuffers.length>0;){this.onloadBuffers.pop()(this.exports)}}set(t,e){!1===this.loaded&&(this.mode=t,this.loaded=!0,this.result=e,this.postOnload())}setError(t){this.set("error",t)}setSuccess(t){this.set("success",t)}}class n{constructor(t,e){this.sop=e.sop,this.over=!1,this.group=t,this.welds=null,this.exports={error:this.error.bind(this),success:this.success.bind(this)},e.welds.length>0&&(this.welds=e.welds.slice()),e.noGood&&(this.noGood=e.noGood.action,this.noGoodOptions=e.noGood.options)}getError(t){return t||"unknown error"}error(t){!1===this.over&&(this.over=!0,this.errorBase(t),this.callSop({result:t,success:!1}))}success(t,e){!1===this.over&&(this.over=!0,this.runWeld(t,t=>{this.successBase(t,e),this.callSop({result:t,success:!0})}))}runWeld(t,e){if(null==this.welds)return e(t),null;let s=this.welds.shift(),i=null,r=e=>{this.noGood(e),this.callSop({result:t,success:!1})};s?(i=this.group.callTool(s.tool),s.packing(t,i.packing),i.ng(r,this.noGoodOptions).action(t=>{this.runWeld(t,e)})):e(t)}callSop(t){this.sop&&this.sop(t)}}class a extends n{constructor(t,e){super(t,e),this.result=null}errorBase(t){if(!this.noGood)throw new Error(this.getError(t));this.noGood(this.getError(t))}successBase(t){this.result=t}}class h extends n{constructor(t,e,s){super(t,e),this.callback=s||function(){}}errorBase(t){let e=this.getError(t);this.noGood?this.noGood(e):this.callback(e,null)}successBase(t){this.noGood?this.callback(t):this.callback(null,t)}}class l extends h{successBase(t,e){this.noGood?this.callback(t,e):this.callback(null,t,e)}}class u extends n{constructor(t,e,s,i){super(t,e),this.resolve=s,this.reject=i}errorBase(t){let e=this.getError(t);this.noGood&&this.noGood(e),this.noGood&&this.noGoodOptions.resolve?this.resolve(e):this.reject(e)}successBase(t){this.resolve(t)}}class c extends s{constructor(){super("Support"),this.sop=null,this.welds=[],this.noGood=null,this.package=[],this.exports=null}createExports(t){return this.exports={...t,ng:this.setNoGood.bind(this),unNg:this.unNoGood.bind(this),sop:this.setSop.bind(this),rule:this.setRule.bind(this),unSop:this.unSop.bind(this),weld:this.addWeld.bind(this),clear:this.clear.bind(this),unWeld:this.unWeld.bind(this),packing:this.addPacking.bind(this),rePacking:this.rePacking.bind(this),unPacking:this.unPacking.bind(this)},this.exports}copy(){return{sop:this.sop,welds:this.welds.slice(),noGood:this.noGood,package:this.package.slice()}}addWeld(t,e){return this.welds.push({tool:t,packing:e}),this.exports}unWeld(){return this.welds=[],this.exports}setRule(t,e,s){return t&&this.setNoGood(t,s),e&&this.setSop(e),this.exports}setNoGood(t,e={}){if("function"==typeof t)return this.noGood={action:t,options:this.$verify(e,{resolve:[!1,["boolean"],!1]})},this.exports;this.$systemError("setNG","NG param not a function.",t)}unNoGood(){return this.noGood=null,this.exports}setSop(t){if("function"==typeof t)return this.sop=t,this.exports;this.$systemError("setSOP","SOP param not a function.",t)}unSop(){return this.sop=null,this.exports}addPacking(){return this.package=this.package.concat([...arguments]),this.exports}rePacking(){return this.package=[...arguments],this.exports}unPacking(){return this.package=[],this.exports}clear(){return this.unNoGood(),this.unSop(),this.unWeld(),this.unPacking(),this.exports}}class d extends s{constructor(t,e){super("Pump"),this.count=0,this.options=this.$verify({total:t,callback:e},{total:[!0,["number"]],callback:[!0,["function"]]}),this.exports={add:this.add.bind(this),each:this.each.bind(this),press:this.press.bind(this)}}press(){return this.count+=1,this.count>=this.options.total&&this.options.callback(),this.count}add(t){let e=typeof t;return null!=t&&"number"!==e&&this.$systemError("add","Count not a number.",number),"number"===e&&t<0&&this.$systemError("add","Count cannot be negative.",number),this.options.total+=t,this.options.total}each(t){"function"!=typeof t&&this.$systemError("each","Callback not a function",t);let e=this.press.bind(this);for(let s=this.count;s<this.options.total;s++)t(e,this.count)}}class p extends s{constructor(t={},s,i){super("Tool"),this.user=i||new e,this.store={},this.group=s,this.updateStamp=0,this.exportStore=this.group.data.secure?this.$protection(this.store):this.store,this.argumentLength="number"==typeof t.paramLength?t.paramLength:-1,this.data=this.$verify(t,{name:[!0,["string"]],molds:[!1,["object"],[]],create:[!1,["function"],function(){}],action:[!0,["function"]],update:[!1,["function"],function(){}],updateTime:[!1,["number"],-1],description:[!1,["string"],""],allowDirect:[!1,["boolean"],!0]})}get name(){return this.data.name}install(){this.initSystem(),this.initArgLength(),this.initCreate(),this.updateStamp=Date.now(),this.install=null}initCreate(){this.data.create.call(this.user,this.store,this.system)}getProfile(){return{name:this.data.name,molds:this.data.molds,description:this.data.description,allowDirect:this.data.allowDirect}}replace(t){this.data=this.$verify(t,{molds:[!1,["object"],this.data.molds],create:[!1,["function"],this.data.create],action:[!1,["function"],this.data.action],update:[!1,["function"],this.data.update],updateTime:[!1,["number"],this.data.updateTime],description:[!1,["string"],this.data.description],allowDirect:[!1,["boolean"],this.data.allowDirect]})}checkUpdate(){Date.now()-this.updateStamp>this.data.updateTime&&this.update()}update(){this.install&&this.install(),this.data.update.call(this.user,this.store,this.system),this.updateStamp=Date.now()}updateCall(t){if(Array.isArray(t))for(let e of t)this.group.updateCall(e);else this.group.updateCall(t)}initSystem(){this.system={coop:this.coop.bind(this),tool:this.useTool.bind(this),line:this.useLine.bind(this),store:this.exportStore,group:this.group.exportCase,update:this.update.bind(this),include:this.useTool.bind(this),casting:this.casting.bind(this),updateCall:this.updateCall.bind(this)}}initArgLength(){-1===this.argumentLength&&(this.argumentLength=t.getArgsLength(this.data.action)-3),this.argumentLength<0&&this.$systemError("initArgLength","Args length < 0",this.name+`(length:${this.argumentLength})`)}createExports(){let t=new c,e={store:this.getStore.bind(this),replace:this.replace.bind(this),direct:this.createLambda(this.direct,"direct",t),action:this.createLambda(this.action,"action",t),promise:this.createLambda(this.promise,"promise",t),recursive:this.createLambda(this.recursive,"recursive",t)};return t.createExports(e)}getError(t){return t||"unknown error"}createLambda(t,e,s){let i=Symbol(this.group.data.alias+"_"+this.name+"_"+e),r=t.bind(this),o=this.getActionCallback(e);return{[i]:(...t)=>{let e=s.copy(),i=o(t),n=this.createArgs(t,e);return r(n,i,e)}}[i]}createArgs(t,e){let s=new Array(this.argumentLength+3),i=this.argumentLength,r=e.package,o=r.length;for(let e=i;e--;)s[e]=e>=o?t[e-o]:r[e];return s}getActionCallback(t){return"action"===t||"recursive"===t?t=>{let e=t.pop();return"function"!=typeof e&&this.$systemError("createLambda","Action must a callback."),e}:function(){return null}}parseMold(t,e,s,i){let r=this.group.getMold(t),o=r.check(e,i);if(!0===o)return r.casting(e);"function"==typeof s?s(o):this.$systemError("parseMold",o)}casting(t,e,s){let i=t.split("|"),r=i.shift(),o=i,n=this.name;return this.parseMold(r,e,s,{type:"system",index:0,extras:o,caller:n})}useTool(t){return this.group.callTool(t)}useLine(t){return this.group.callLine(t)}coop(t){return this.group.getMerger(t)}call(t,e,s){this.data.updateTime>=0&&this.checkUpdate();let i=this.data.molds.length;for(let s=0;s<i;s++){if(null==this.data.molds[s])continue;let i=this.data.molds[s].split("|"),r=i.shift();r&&(t[s]=this.parseMold(r,t[s],e,{type:"call",index:s,extras:i,caller:this.name}))}let r=t.length-3;t[r]=this.system,t[r+1]=e,t[r+2]=s,this.data.action.apply(this.user,t)}direct(t,e,s){!1===this.data.allowDirect&&this.$systemError("direct",`Tool(${this.data.name}) no allow direct.`),s.welds.length>0&&this.$systemError("direct",`Tool(${this.data.name}) use weld, can do direct.`);let i=new a(this.group,s);return this.call(t,i.exports.error,i.exports.success),i.result}action(t,e,s){let i=new h(this.group,s,e).exports;this.call(t,i.error,i.success)}recursive(t,e,s,i=-1){i+=1;let r=(...t)=>{this.recursive(this.createArgs(t,s),e,s,i)},o=new l(this.group,s,e).exports;this.call(t,o.error,t=>o.success(t,{count:i,stack:r}))}promise(t,e,s){return new Promise((e,i)=>{let r=new u(this.group,s,e,i).exports;this.call(t,r.error,r.success)})}getStore(t){if(this.store[t])return this.store[t];this.$systemError("getStore",`Key(${t}) not found.`)}use(){return this.install&&this.install(),this.createExports()}}class g extends s{constructor(t,e){super("Line"),this.tools={},this.group=e,this.data=this.$verify(t,{name:[!0,["string"]],fail:[!0,["function"]],inlet:[!1,["object"],null],input:[!0,["object","function"]],output:[!0,["object","function"]],layout:[!0,["object"]]}),this.layoutKeys=Object.keys(this.data.layout),this.checkPrivateKey()}get name(){return this.data.name}getProfile(){return{name:this.data.name,inlet:this.data.inlet,layouts:Object.keys(this.data.layout)}}checkPrivateKey(){let t=this.data.layout;(t.action||t.promise||t.setRule)&&this.$systemError("init","Layout has private key(action, promise, setRule)")}use(){return(...t)=>new m(this,t).conveyer}}class m extends s{constructor(t,s){super("Unit"),this.case=new e,this.flow=[],this.main=t,this.layout=t.data.layout,this.params=s,this.supports=new c,this.init()}createTool(t,e,s){return"function"==typeof e?new p({name:t,action:e},this.main.group,this.case).use():s?void this.$systemError("createTool",`${t} not a function.`):(e.name&&delete e.name,new p({name:t,...e},this.main.group,this.case).use())}init(){this.input=this.createTool("input",this.main.data.input),this.output=this.createTool("output",this.main.data.output,!0),this.initConveyer()}initConveyer(){this.conveyer={action:this.action.bind(this),promise:this.promise.bind(this),setRule:this.setRule.bind(this)};for(let t of this.main.layoutKeys)this.conveyer[t]=((...e)=>(this.register(t,e),this.conveyer))}register(t,e){let s=this.main.data.inlet;s&&0!==s.length&&0===this.flow.length&&!1===s.includes(t)&&this.$systemError("register",`First call method not inside inlet, you use '${t}'.`),this.flow.push({name:t,method:this.createTool(t,this.layout[t]),params:e})}action(t){let e=this.main.data.fail,s=this.supports.copy(),i=new h(this.main.group,s,t).exports;this.process(t=>e(t,i.error),i.success)}promise(){return new Promise((t,e)=>{let s=this.main.data.fail,i=this.supports.copy(),r=new u(this.main.group,i,t,e).exports;this.process(t=>s(t,r.error),r.success)})}setRule(...t){return this.supports.setRule(...t),this.conveyer}process(t,e){new f(this.params,this.flow,this.input,this.output).start(t,e)}}class f extends s{constructor(t,e,s,i){super("Process"),this.stop=!1,this.flow=e,this.index=0,this.stack=[],this.input=s,this.params=t,this.output=i}start(t,e){this.error=t,this.success=e,this.stack.push("input"),this.input.ng(t=>this.fail(t)).action(...this.params,this.next.bind(this))}finish(){this.stack.push("output"),this.output.ng(t=>this.fail(t)).action(this.success)}createError(t){return{message:t||"unknown error",stack:this.stack}}fail(t){!1===this.stop&&(this.stop=!0,this.error(this.createError(t)))}next(){if(!0===this.stop)return;let t=this.flow[this.index];t?(this.stack.push(t.name),t.method.ng(t=>this.fail(t)).action(...t.params,()=>{this.index+=1,this.next()})):this.finish()}}class y extends s{constructor(t={}){super("Mold"),this.case=new e,this.data=this.$verify(t,{name:[!0,["string"]],check:[!1,["function"],function(){return!0}],casting:[!1,["function"],function(t){return t}],description:[!1,["string"],""]})}get name(){return this.data.name}getProfile(){return{name:this.data.name,description:this.data.description}}check(t,e){return this.data.check.call(this.case,t,e)}casting(t){return this.data.casting.call(this.case,t)}}let b=new class extends s{constructor(){super("PublicMergers"),this.mergers={},this.created={}}register(t,e){this.mergers[t]&&this.$systemError("add",`Public merger name(${t}) already exists.`),"function"!=typeof e&&this.$systemError("add","Public merger action not a function."),this.mergers[t]=e}get(t){if(null==this.mergers[t])return this.$systemError("get",`Public merger ${t} not found.`);if(null==this.created[t]){this.created[t]=this.$verify(this.mergers[t](),{group:[!0,["object"]],options:[!1,["object"],{}]});let e=this.created[t];if(!1===x.isGroup(e.group))return this.$systemError("get",`The '${t}' not a group.`);if(!1===e.group.isModule())return this.$systemError("get",`The group(${t}) not module mode.`);e.options.__module_group__=!0,e.group.create(e.options)}return this.created[t].group}},$={number:new y({name:"number",check:(t,e)=>null==t&&"abe"===e.extras[0]||("number"==typeof t||`Param ${e.index} not a number(${t}).`)}),int:new y({name:"int",check:(t,e)=>null==t&&"abe"===e.extras[0]||("number"==typeof t||`Param ${e.index} not a number(${t}).`),casting:t=>Math.floor(t)}),string:new y({name:"string",check:(t,e)=>null==t&&"abe"===e.extras[0]||("string"==typeof t||`Param ${e.index} not a string(${t}).`)}),array:new y({name:"array",check:(t,e)=>null==t&&"abe"===e.extras[0]||(!!Array.isArray(t)||`Param ${e.index} not a array(${t}).`)}),object:new y({name:"object",check:(t,e)=>null==t&&"abe"===e.extras[0]||("object"==typeof t||`Param ${e.index} not a object(${t}).`)}),function:new y({name:"function",check:(t,e)=>null==t&&"abe"===e.extras[0]||("function"==typeof t||`Param ${e.index} not a function(${t}).`)}),required:new y({name:"required",check:(t,e)=>null!=t||`Param ${e.index} required.`})};class x extends s{constructor(t={}){super("Group"),this.case=new e,this.data=this.$verify(t,{alias:[!1,["string"],"no_alias_group"],module:[!1,["boolean"],!1],secure:[!1,["boolean"],!1],merger:[!1,["object"],{}],create:[!1,["function"],function(){}]}),this.toolbox={},this.moldbox={},this.linebox={},this.initStatus(),this.initMerger()}static isGroup(t){return t instanceof x||t instanceof L}getProfile(){let t={line:{},mold:{},tool:{},alias:this.data.alias};for(let e in this.toolbox)t.tool[e]=this.getTool(e).getProfile();for(let e in this.moldbox)t.mold[e]=this.getMold(e).getProfile();for(let e in this.linebox)t.line[e]=this.getLine(e).getProfile();return t}compileLazy(t,e,s){return"function"==typeof e[t]&&(e[t]=new s({name:t,...e[t]()},this)),e[t]}replaceTool(t,e){this.getTool(t).replace(e)}isModule(){return!!this.data.module}initStatus(){this.exportCase=this.data.secure?this.$protection(this.case):this.case,this.status={alone:!1,created:!1}}initMerger(){for(let t in this.data.merger){let e=this.data.merger[t],s=typeof e;!1===x.isGroup(e)&&"function"!==s&&"string"!==s&&this.$systemError("initMerger",`The '${t}' not a group or function.`)}}alone(t){return this.status.alone=!0,this.create(t),{tool:this.callTool.bind(this),line:this.callLine.bind(this)}}create(t){let e=t&&this.isModule();return e&&!0!==t.__module_group__?this.$systemError("create","Module mode group can't use options"):e&&!0===t.__module_group__&&this.status.alone?this.$systemError("create","Module already use, can't be announced as module merger."):(e&&!0===t.__module_group__&&delete t.__module_group__,!0===this.status.created?null:(this.data.create.bind(this.case)(t),void(this.status.created=!0)))}getTool(t){if(this.toolbox[t])return this.compileLazy(t,this.toolbox,p);this.$systemError("getTool",`Tool(${t}) not found.`)}getLine(t){if(this.linebox[t])return this.compileLazy(t,this.linebox,g);this.$systemError("getLine",`Line(${t}) not found.`)}getMold(t){let e=this.moldbox[t]||$[t]||null;if(e)return e;this.$systemError("getMold",`Mold(${t}) not found.`)}getMerger(t){if(this.data.merger[t]){if("string"==typeof this.data.merger[t]&&(this.data.merger[t]=b.get(this.data.merger[t])),"function"==typeof this.data.merger[t]){let e=this.data.merger[t]();!1===x.isGroup(e)&&this.$systemError("getMerger",`The '${t}' not a group.`),this.data.merger[t]=e}return this.data.merger[t].alone()}this.$systemError("getMerger",`Merger(${t}) not found.`)}callTool(t){return this.getTool(t).use()}callLine(t){return this.getLine(t).use()}addMold(t){let e=new y(t);this.$noKey("addMold",this.moldbox,e.name)&&(this.moldbox[e.name]=e)}addMolds(t){if(Array.isArray(t)){for(let e of t)this.addMold(e);return!0}if("object"==typeof t){for(let e in t)this.addMold({name:e,...t[e]});return!0}this.$systemError("addMolds","Molds not a array or object.",t)}addLine(...t){if("string"==typeof t[0])this.addLineLazy(t[0],t[1]);else{let e=new g(t[0],this);this.$noKey("addLine",this.linebox,e.name)&&(this.linebox[e.name]=e)}}addLineLazy(t,e){"function"==typeof e?this.$noKey("addLineLazy",this.linebox,t)&&(this.linebox[t]=e):this.$systemError("addLineLazy","Callback not a function.")}addLines(t){if(Array.isArray(t)){for(let e of t)this.addLine(e);return!0}if("object"==typeof t){for(let e in t)"function"==typeof t[e]?this.addLineLazy(name,t[e]):this.addLine({name:e,...t[e]});return!0}this.$systemError("addLines","Lines not a array or object.",t)}addTool(...t){if("string"==typeof t[0])this.addToolLazy(t[0],t[1]);else{let e=new p(t[0],this);this.$noKey("addTool",this.toolbox,e.name)&&(this.toolbox[e.name]=e)}}addToolLazy(t,e){"function"==typeof e?this.$noKey("addToolLazy",this.toolbox,t)&&(this.toolbox[t]=e):this.$systemError("addToolLazy","Callback not a function.")}addTools(t){if(Array.isArray(t)){for(let e of t)this.addTool(e);return!0}if("object"==typeof t){for(let e in t)"function"==typeof t[e]?this.addToolLazy(name,t[e]):this.addTool({name:e,...t[e]});return!0}this.$systemError("addTools","Tools not a array or object.",t)}hasTool(t){return!!this.toolbox[t]}hasLine(t){return!!this.linebox[t]}hasMold(t){return!!this.moldbox[t]}updateCall(t){this.getTool(t).update()}}class w{constructor(t){this.line=t.line.bind(t),this.tool=t.tool.bind(t),this.hasLine=t.hasLine.bind(t),this.hasTool=t.hasTool.bind(t),this.addGroup=t.addGroup.bind(t),this.hasGroup=t.hasGroup.bind(t),this.setBridge=t.setBridge.bind(t),this.removeGroup=t.removeGroup.bind(t)}}class L{constructor(t){this.alone=t.alone.bind(t),this.create=t.create.bind(t),this.hasTool=t.hasTool.bind(t),this.hasMold=t.hasMold.bind(t),this.hasLine=t.hasLine.bind(t),this.addMold=t.addMold.bind(t),this.addLine=t.addLine.bind(t),this.addTool=t.addTool.bind(t),this.addMolds=t.addMolds.bind(t),this.addTools=t.addTools.bind(t),this.callTool=t.callTool.bind(t),this.callLine=t.callLine.bind(t),this.isModule=t.isModule.bind(t),this.getProfile=t.getProfile.bind(t)}}class k{constructor(t){this.has=t.has.bind(t),this.get=t.get.bind(t),this.list=t.list.bind(t),this.clear=t.clear.bind(t),this.create=t.create.bind(t),this.remove=t.remove.bind(t),this.getOrCreate=t.getOrCreate.bind(t)}}let G=i;return G.Group=x,G});