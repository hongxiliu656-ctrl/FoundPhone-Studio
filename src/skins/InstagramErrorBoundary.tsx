import { Component, type ErrorInfo, type ReactNode } from "react";
export class InstagramErrorBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state:{error:string|null}={error:null};
  static getDerivedStateFromError(error:Error){return {error:error?.message||"未知错误"};}
  componentDidCatch(error:Error, info:ErrorInfo){console.error("Instagram render failure",error,info.componentStack);}
  render(){if(this.state.error)return <div style={{background:"#fff",color:"#111",height:"100%",padding:24,overflow:"auto",fontSize:14}}><h3>Instagram 加载失败</h3><p>页面出现错误，请将下面的信息截图发给我：</p><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{this.state.error}</pre><button style={{padding:12,border:"1px solid #ccc",borderRadius:8}} onClick={()=>this.setState({error:null})}>重试打开</button></div>;return this.props.children;}
}
