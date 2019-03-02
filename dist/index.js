!function(t,e){"undefined"!=typeof module&&"object"==typeof exports?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Packhouse=e()}(this||("undefined"!=typeof window?window:global),function(){class t{static getArgsLength(t){for(var e=t.toString(),s=0,r=0,i=0,o=!1,n=!1,a=0;a<e.length;a++)if(!["(","[","{"].includes(e[a])||o||n){if(![")","]","}"].includes(e[a])||o||n)"'"!==e[a]||n||"\\"===e[a-1]?'"'!==e[a]||o||"\\"===e[a-1]?","!==e[a]||1!==r||o||n||s++:n=!n:o=!o;else if(--r<1)break}else r++,i=a;return 0===s&&0===e.substring(i+1,a).trim().length?0:s+1}}class e{constructor(t){this.$moduleBase={name:t||"no name"}}$systemError(t,e,s="$_no_error"){throw"$_no_error"!==s&&console.log("error data => ",s),new Error(`(☉д⊙)!! PackHouse::${this.$moduleBase.name} => ${t} -> ${e}`)}$noKey(t,e,s){return null==e[s]||(this.$systemError(t,`Name(${s}) already exists.`),!1)}$verify(t,e,s={}){let r={};for(let s in e){let i=e[s];if(i[0]&&null==t[s])return void this.$systemError("verify","Must required",s);null!=t[s]?typeof i[1]!==("string"==typeof t[s]&&"#"===t[s][0])||t[s].slice(1)?r[s]=t[s]:this.$systemError("verify",`Type(${typeof i[1]}) error`,s):r[s]=i[1]}return Object.assign(r,s)}}class s{}class r extends e{constructor(){super("Order"),this.caches={},this.exports={has:this.has.bind(this),get:this.get.bind(this),clear:this.clear.bind(this),create:this.create.bind(this),getOrCreate:this.getOrCreate.bind(this)}}has(t){if("string"==typeof t)return!!this.caches[t];this.$systemError("has","Key not a string.",t)}get(t){if(this.has(t))return this.caches[t];this.$system("get",`Key(${t}) not found.`)}clear(){this.caches={}}create(t){let e=new i;return this.caches[t]=e.exports,this.get(t)}getOrCreate(t){return this.has(t)?this.get(t):this.create(t)}}class i extends e{constructor(){super("OrderCache"),this.mode=null,this.ready=!1,this.loaded=!1,this.onloadBuffers=[],this.result=null,this.buffers=[],this.exports={post:this.post.bind(this),buffer:this.buffer.bind(this),onload:this.onload.bind(this),isReady:this.isReady.bind(this),onReady:this.onReady.bind(this)}}post(){for(;this.buffers.length>0;){let t=this.buffers.pop();"success"===this.mode?t.success(this.result):t.error(this.result)}}buffer(t,e){return this.buffers.push({error:t,success:e}),this.exports}isReady(){return!!this.ready}onReady(t){!1===this.isReady()?(this.ready=!0,t(this.setError.bind(this),this.setSuccess.bind(this))):this.$systemError("onReady","This cache is ready, use order.clear() reset cache.")}onload(t){return this.loaded?t(this.exports):this.onloadBuffers.push(t),this.exports}postOnload(){for(;this.onloadBuffers.length>0;){this.onloadBuffers.pop()(this.exports)}}set(t,e){!1===this.loaded&&(this.mode=t,this.loaded=!0,this.result=e,this.postOnload())}setError(t){this.set("error",t)}setSuccess(t){this.set("success",t)}}class o extends e{constructor(t={},e,r){super("Tool"),this.user=r||new s,this.store={},this.group=e,this.installStamp=0,this.argumentLength="number"==typeof t.paramLength?t.paramLength:-1,this.data=this.$verify(t,{name:[!0,""],molds:[!1,[]],create:[!1,function(){}],action:[!0,"#function"],update:[!1,function(){}],updateTime:[!1,-1],allowDirect:[!1,!0]})}get name(){return this.data.name}install(){this.initSystem(),this.initArgLength(),this.initCreate(),this.installStamp=Date.now(),this.install=null}initCreate(){this.data.create.call(this.user,this.store,this.system)}checkUpdate(){let t=Date.now();t-this.installStamp>this.data.updateTime&&(this.data.update.call(this.user,this.store,this.system),this.installStamp=t)}initSystem(){this.system={coop:this.coop.bind(this),store:this.store,group:this.group.case,include:this.include.bind(this),casting:this.parseMold.bind(this)}}initArgLength(){-1===this.argumentLength&&(this.argumentLength=t.getArgsLength(this.data.action)-3),this.argumentLength<0&&this.$systemError("initArgLength","Args length < 0",this.name+`(length:${this.argumentLength})`)}createExports(){let t={noGood:null,package:[]},e={store:this.getStore.bind(this),direct:this.createLambda(this.direct,"direct",t),action:this.createLambda(this.action,"action",t),promise:this.createLambda(this.promise,"promise",t)},s=this.createSupport(e,t);return Object.assign(e,s)}createSupport(t,e){return{ng:function(s){if("function"==typeof s)return e.noGood=s,t;this.$systemError("setNG","NG param not a function.",s)},packing:function(){return e.package=e.package.concat([...arguments]),t},unPacking:function(){return e.package=[],t}}}getError(t){return t||"unknown error"}createLambda(t,e,s){let r=this,i=Symbol(this.group.data.alias+"_"+this.name+"_"+e);return{[i]:function(){let i=s.package.concat([...arguments]),o=null;"action"===e&&("function"==typeof i.slice(-1)[0]?o=i.pop():r.$systemError("createLambda","Action must a callback, no need ? try direct!"));let n=new Array(r.argumentLength);for(let t=0;t<n.length;t++)n[t]=i[t]||void 0;return t.bind(r)(n,o,s)}}[i]}parseMold(t,e,s){let r=this.group.getMold(t),i=r.check(e);if(!0===i)return r.casting(e);"function"==typeof s?s(i):this.$systemError("parseMold",i)}include(t){return this.group.getTool(t).use()}coop(t){return this.group.getMerger(t)}call(t,e,s){this.data.updateTime>=0&&this.checkUpdate();for(let s=0;s<t.length;s++){let r=this.data.molds[s];t[s]=r?this.parseMold(r,t[s],e):t[s]}this.data.action.call(this.user,...t,this.system,e,s)}createResponse({error:t,success:e}){let s=!1;return{error:e=>{s||(s=!0,t(e))},success:t=>{s||(s=!0,e(t))}}}direct(t,e,s){!1===this.data.allowDirect&&this.$systemError("direct",`Tool(${this.data.name}) no allow direct.`);let r=null,i=this.createResponse({error:t=>{if(!s.noGood)throw new Error(this.getError(t));s.noGood(this.getError(t))},success:t=>{r=t}});return this.call(t,i.error,i.success),r}action(t,e=function(){},s){let r=this.createResponse({error:t=>{let r=this.getError(t);s.noGood?s.noGood(r):e(r,null)},success:t=>{s.noGood?e(t):e(null,t)}});this.call(t,r.error,r.success)}promise(t,e,s){return new Promise((e,r)=>{let i=this.createResponse({error:t=>{let e=this.getError(t);s.noGood&&s.noGood(e),r(e)},success:t=>{e(t)}});this.call(t,i.error,i.success)})}getStore(t){if(this.store[t])return this.store[t];this.$systemError("getStore",`Key(${t}) not found.`)}use(){return this.install&&this.install(),this.createExports()}}class n extends e{constructor(t,e){super("Line"),this.group=e,this.data=this.$verify(t,{name:[!0,""],fail:[!0,"#function"],inlet:[!1,[]],input:[!0,"#function"],output:[!0,"#function"],layout:[!0,{}]}),this.inlet=this.data.inlet||null,this.tools={},this.checkPrivateKey()}get name(){return this.data.name}checkPrivateKey(){let t=this.data.layout;(t.action||t.promise)&&this.$systemError("init","Layout has private key(action, promise)")}use(){let t=this;return function(){return new a(t,[...arguments]).getConveyer()}}}class a extends e{constructor(t,e){super("Unit"),this.case=new s,this.flow=[],this.main=t,this.layout=t.data.layout,this.params=e,this.init()}createTool(t,e){return new o({name:t,action:e},this.main.group,this.case).use()}init(){this.input=this.createTool("input",this.main.data.input),this.output=this.createTool("output",this.main.data.output),this.initConveyer()}initConveyer(){let t=this;this.conveyer={action:this.action.bind(this),promise:this.promise.bind(this)};for(let e in this.layout)this.conveyer[e]=function(){return t.register(e,[...arguments]),t.getConveyer()}}getConveyer(){return this.conveyer}register(t,e){0!==this.main.inlet.length&&0===this.flow.length&&(this.main.inlet.includes(t)||this.$systemError("register",`First call method not inside inlet, you use'${t}'.`));let s={name:t,method:this.createTool(t,this.layout[t]),params:e};this.flow.push(s)}action(t){this.process(e=>{this.main.data.fail(e,e=>{t(e,null)})},e=>{t(null,e)})}promise(){return new Promise((t,e)=>{this.action((s,r)=>{s?e(s):t(r)})})}process(t,e){new h(this.params,this.flow,this.input,this.output).start(t,e)}}class h extends e{constructor(t,e,s,r){super("Process"),this.params=t,this.stop=!1,this.flow=e,this.index=0,this.stack=[],this.input=s,this.output=r}start(t,e){this.error=t,this.success=e,this.stack.push("input"),this.input.action(...this.params,t=>{t?this.fail(t):this.next()})}finish(){this.stack.push("output"),this.output.action((t,e)=>{t?this.fail(t):this.success(e)})}createError(t){return{message:t||"unknown error",stack:this.stack}}fail(t){!1===this.stop&&(this.stop=!0,this.error(this.createError(t)))}next(){let t=this.flow[this.index];t&&!1===this.stop?(this.stack.push(t.name),t.method.action(...t.params,t=>{t?this.fail(t):(this.index+=1,this.next())})):!1===this.stop&&this.finish()}}class u extends e{constructor(t={}){super("Mold"),this.case=new s,this.data=this.$verify(t,{name:[!0,""],check:[!1,function(){return!0}],casting:[!1,function(t){return t}]})}get name(){return this.data.name}check(t){return this.data.check.call(this.case,t)}casting(t){return this.data.casting.call(this.case,t)}}let c={number:new u({name:"number",check:t=>"number"==typeof t||`Param(${t}) not a number.`}),int:new u({name:"int",check:t=>"number"==typeof t||`Param(${t}) not a number.`,casting:t=>Math.floor(t)}),string:new u({name:"string",check:t=>"string"==typeof t||`Param(${t}) not a string.`}),array:new u({name:"array",check:t=>!!Array.isArray(t)||`Param(${t}) not a array.`}),object:new u({name:"object",check:t=>"object"==typeof t||`Param(${t}) not a object.`}),function:new u({name:"function",check:t=>"function"==typeof t||`Param(${t}) not a function.`})};class l extends e{constructor(t={}){super("Group"),this.case=new s,this.line={},this.moldbox={},this.toolbox={},this.data=this.$verify(t,{alias:[!1,"no_alias_group"],merger:[!1,{}],create:[!1,function(){}]}),this.initStatus(),this.initMerger()}initStatus(){this.status={created:!1}}initMerger(){for(let t in this.data.merger){this.data.merger[t]instanceof l==!1&&this.$systemError("initMerger",`The '${t}' not a group.`)}}alone(t){return this.create(t),{tool:this.callTool.bind(this),line:this.callLine.bind(this)}}create(t){!1===this.status.created&&(this.data.create.bind(this.case)(t),this.status.created=!0)}getTool(t){if(this.toolbox[t])return this.toolbox[t];this.$systemError("getTool",`Tool(${t}) not found.`)}getLine(t){if(this.line[t])return this.line[t];this.$systemError("getLine",`Line(${t}) not found.`)}getMold(t){let e=this.moldbox[t]||c[t]||null;if(e)return e;this.$systemError("getMold",`Mold(${t}) not found.`)}getMerger(t){if(this.data.merger[t])return this.data.merger[t].alone();this.$systemError("getMerger",`Merger(${t}) not found.`)}callTool(t){return this.getTool(t).use()}callLine(t){return this.getLine(t).use()}addMold(t){let e=new u(t);this.$noKey("addMold",this.moldbox,e.name)&&(this.moldbox[e.name]=e)}addMolds(t){if(Array.isArray(t))for(let e of t)this.addMold(e);else this.$systemError("addMolds","Molds not a array.",t)}addLine(t){let e=new n(t,this);this.$noKey("addLine",this.line,e.name)&&(this.line[e.name]=e)}addTool(t){let e=new o(t,this);this.$noKey("addTool",this.toolbox,e.name)&&(this.toolbox[e.name]=e)}addTools(t){if(Array.isArray(t))for(let e of t)this.addTool(e);else this.$systemError("addTools","Tools not a array.",t)}hasTool(t){return!!this.toolbox[t]}hasLine(t){return!!this.line[t]}hasMold(t){return!!this.moldbox[t]}}let d=class extends e{constructor(){super("Packhouse"),this.groups={},this.bridge=null}static createPublicMold(t){let e=new u(t);c[e.name]=e}static createOrder(){return(new r).exports}static asyncLoop(t,e,s){if(!1===Array.isArray(t))return void s("AsyncLoop : Targrt not be array.");if("function"!=typeof e||"function"!=typeof s)return void s("AsyncLoop : Action or callback not a function.");let r=t.length,i=0,o=()=>{(i+=1)===r&&s()},n=async(t,s)=>{e(t,s,o)};for(let e=0;e<r;e++)n(t[e],e);0===r&&s()}getGroup(t){if(this.hasGroup(t))return this.groups[t];this.$systemError("getGroup",`Group(${t}) not found.`)}getTool(t,e){return this.getGroup(t).getTool(e)}getLine(t,e){return this.getGroup(t).getLine(e)}addGroup(t,e,s){null==this.groups[t]?e instanceof l!=0?(e.create(s),this.groups[t]=e):this.$systemError("addGroup","Must group.",e):this.$systemError("addGroup",`Name(${t}) already exists.`)}hasGroup(t){return!!this.groups[t]}hasTool(t,e){return!!this.getGroup(t).hasTool(e)}hasLine(t,e){return!!this.getGroup(t).hasLine(e)}tool(t,e){return this.callBridge(t,e),this.getTool(t,e).use()}line(t,e){return this.callBridge(t,e),this.getLine(t,e).use()}callBridge(t,e){this.bridge&&this.bridge(this,t,e)}setBridge(t){"function"==typeof t?this.bridge=t:this.$systemError("setBridge","Bridge not a function.",t)}};return d.Group=l,d});